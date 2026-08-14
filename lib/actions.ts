"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { CreateFormInput, Form, FormDetail, Question, Submission, SuggestFormResult, ClaimPlaygroundResult } from "./types";
import { AI_PROMPT_MAX_LENGTH, isAiConfigured } from "@/lib/ai/config";
import {
  FormSuggestionError,
  generateFormSuggestion,
} from "@/lib/ai/suggest-form";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  formatEditorValidationIssues,
  validateFormEditor,
} from "./editor-validation";
import { generateFormId } from "./form-id";
import { mapQuestion } from "./questions";
import { deleteObject } from "@/lib/storage/s3";
import {
  SUBMISSIONS_PAGE_SIZE,
  submissionPageFromRank,
} from "@/lib/submissions-pagination";
import { isPlaygroundFormExpired } from "@/lib/playground";
import { getServiceAccountEmailFromEnv } from "@/lib/sheets/service-account";

async function getSessionUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

type FormWithCounts = Prisma.FormGetPayload<{
  include: {
    _count: { select: { questions: true; submissions: true } };
    sheetConnection: { select: { sheetUrl: true; sheetName: true } };
  };
}>;

function mapForm(form: FormWithCounts): Form {
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    createdAt: form.createdAt.toISOString(),
    updatedAt: form.updatedAt.toISOString(),
    isPublished: form.isPublished,
    isPlayground: form.isPlayground,
    expiresAt: form.expiresAt?.toISOString() ?? null,
    questionCount: form._count.questions,
    responseCount: form._count.submissions,
    sheetUrl: form.sheetConnection?.sheetUrl ?? undefined,
    sheetName: form.sheetConnection?.sheetName ?? undefined,
    theme: (form.theme as unknown as Form["theme"]) ?? undefined,
  };
}

export async function listForms(): Promise<Form[]> {
  const ownerId = await getSessionUserId();
  const forms = await prisma.form.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { questions: true, submissions: true } },
      sheetConnection: { select: { sheetUrl: true, sheetName: true } },
    },
  });
  return forms.map(mapForm);
}

export async function getForm(id: string): Promise<FormDetail | null> {
  const ownerId = await getSessionUserId();
  const form = await prisma.form.findFirst({
    where: { id, ownerId },
    include: {
      questions: { orderBy: { position: "asc" } },
      sheetConnection: { select: { sheetUrl: true, sheetName: true } },
      _count: { select: { submissions: true } },
    },
  });
  if (!form) return null;
  return {
    ...mapForm({
      ...form,
      _count: {
        questions: form.questions.length,
        submissions: form._count.submissions,
      },
    }),
    questions: form.questions.map(mapQuestion),
  };
}

export async function createForm(input: CreateFormInput): Promise<Form> {
  const ownerId = await getSessionUserId();
  const data = {
    ownerId,
    title: input.title,
    description: input.description,
    questions: {
      create: input.questions.map((q, index) => ({
        type: q.type,
        title: q.title,
        description: q.description,
        required: q.required,
        position: index,
        config: stripQuestionFields(q) as unknown as Prisma.InputJsonValue,
      })),
    },
  };

  let form: FormWithCounts | null = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      form = await prisma.form.create({
        data: { id: generateFormId(), ...data },
        include: {
          _count: { select: { questions: true, submissions: true } },
          sheetConnection: { select: { sheetUrl: true, sheetName: true } },
        },
      });
      break;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }
      throw error;
    }
  }

  if (!form) {
    throw new Error("Could not generate a unique form id");
  }

  revalidatePath("/dashboard");
  return mapForm(form);
}

export async function updateFormQuestions(formId: string, questions: Question[]) {
  const ownerId = await getSessionUserId();
  await prisma.form.findFirstOrThrow({ where: { id: formId, ownerId } });

  const issues = validateFormEditor({ title: "", questions }, "save");
  if (issues.length > 0) {
    throw new Error(formatEditorValidationIssues(issues));
  }

  const existing = await prisma.question.findMany({ where: { formId }, select: { id: true } });
  const nextIds = new Set(questions.map((q) => q.id));
  const removedIds = existing.map((q) => q.id).filter((id) => !nextIds.has(id));

  // upsert by id so answers keyed by question id in past submissions stay valid
  await prisma.$transaction([
    ...(removedIds.length > 0
      ? [prisma.question.deleteMany({ where: { formId, id: { in: removedIds } } })]
      : []),
    ...questions.map((q, index) =>
      prisma.question.upsert({
        where: { id: q.id },
        create: {
          id: q.id,
          formId,
          type: q.type,
          title: q.title,
          description: q.description ?? null,
          required: q.required,
          position: index,
          config: stripQuestionFields(q) as unknown as Prisma.InputJsonValue,
        },
        update: {
          type: q.type,
          title: q.title,
          description: q.description ?? null,
          required: q.required,
          position: index,
          config: stripQuestionFields(q) as unknown as Prisma.InputJsonValue,
        },
      }),
    ),
  ]);
  revalidatePath(`/forms/${formId}`);
}

export async function updateForm(
  formId: string,
  patch: Partial<Pick<Form, "title" | "description" | "theme">>,
) {
  const ownerId = await getSessionUserId();
  await prisma.form.updateMany({
    where: { id: formId, ownerId },
    data: {
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.theme !== undefined && { theme: patch.theme as unknown as Prisma.InputJsonValue }),
    },
  });
  revalidatePath(`/forms/${formId}`);
}

export async function publishForm(formId: string): Promise<Form> {
  const ownerId = await getSessionUserId();
  const form = await prisma.form.findFirstOrThrow({
    where: { id: formId, ownerId },
    include: { questions: { orderBy: { position: "asc" } } },
  });

  const issues = validateFormEditor(
    {
      title: form.title,
      questions: form.questions.map(mapQuestion),
    },
    "publish",
  );
  if (issues.length > 0) {
    throw new Error(formatEditorValidationIssues(issues));
  }

  await prisma.form.update({ where: { id: formId }, data: { isPublished: true } });
  revalidatePath("/dashboard");
  revalidatePath(`/forms/${formId}`);
  return (await getForm(formId))!;
}

export async function unpublishForm(formId: string): Promise<Form> {
  const ownerId = await getSessionUserId();
  await prisma.form.findFirstOrThrow({ where: { id: formId, ownerId } });
  await prisma.form.update({ where: { id: formId }, data: { isPublished: false } });
  revalidatePath("/dashboard");
  revalidatePath(`/forms/${formId}`);
  return (await getForm(formId))!;
}

export async function deleteForm(formId: string) {
  const ownerId = await getSessionUserId();
  const form = await prisma.form.findFirst({
    where: { id: formId, ownerId },
    select: {
      id: true,
      fileAssets: { select: { storageKey: true } },
    },
  });

  if (!form) {
    throw new Error("Form not found");
  }

  const storageKeys = form.fileAssets.map((asset) => asset.storageKey);

  await prisma.form.delete({ where: { id: formId } });

  await Promise.allSettled(storageKeys.map((key) => deleteObject(key)));

  revalidatePath("/dashboard");
}

import { google } from "googleapis";

const SHEET_URL_PATTERN = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

function parseSheetUrl(sheetUrl: string) {
  const match = sheetUrl.match(SHEET_URL_PATTERN);
  if (!match) return null;
  const sheetId = match[1];
  const url = new URL(sheetUrl);
  const gidMatch = url.hash.match(/gid=(\d+)/);
  return { sheetId, gid: gidMatch ? gidMatch[1] : undefined };
}

function getSheetsClient() {
  if (!GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured");
  }
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function getSheetsServiceAccountEmail(): Promise<string | null> {
  await getSessionUserId();
  return getServiceAccountEmailFromEnv();
}

export type SheetAccessResult =
  | { ok: true; sheetName: string; title: string }
  | { ok: false; code: "invalid_url" | "no_access" | "missing_env" | "unknown"; message: string };

export async function verifySheetAccess(sheetUrl: string): Promise<SheetAccessResult> {
  const parsed = parseSheetUrl(sheetUrl);
  if (!parsed) {
    return { ok: false, code: "invalid_url", message: "That doesn't look like a Google Sheet URL." };
  }

  let sheets;
  try {
    sheets = getSheetsClient();
  } catch {
    return { ok: false, code: "missing_env", message: "Sheet service is not configured." };
  }

  try {
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: parsed.sheetId,
      includeGridData: false,
    });

    const title = metadata.data.properties?.title ?? "Untitled spreadsheet";
    let sheetName = "Sheet1";

    if (parsed.gid) {
      const matched = metadata.data.sheets?.find(
        (s) => String(s.properties?.sheetId) === parsed.gid,
      );
      if (matched?.properties?.title) {
        sheetName = matched.properties.title;
      }
    } else {
      const first = metadata.data.sheets?.[0];
      if (first?.properties?.title) {
        sheetName = first.properties.title;
      }
    }

    // Verify we actually have edit access by doing a harmless protected write:
    // append an empty row and immediately clear it. This only works with Editor access.
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: parsed.sheetId,
        range: `${sheetName}!A1:A1`,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [[]] },
      });
    } catch (writeError) {
      const message = writeError instanceof Error ? writeError.message : String(writeError);
      const lower = message.toLowerCase();
      if (
        message.includes("403") ||
        lower.includes("forbidden") ||
        lower.includes("does not have permission") ||
        lower.includes("insufficient permission")
      ) {
        return {
          ok: false,
          code: "no_access",
          message:
            "Recto can see this Sheet but can't add rows. Share it with Recto's email again and choose Editor.",
        };
      }
      return { ok: false, code: "unknown", message: `Could not write to Sheet: ${message}` };
    }

    return { ok: true, sheetName, title };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();
    if (
      message.includes("403") ||
      lower.includes("forbidden") ||
      lower.includes("does not have permission")
    ) {
      return {
        ok: false,
        code: "no_access",
        message:
          "Recto can't access this Sheet yet. Share it with Recto's email and set access to Editor.",
      };
    }
    return { ok: false, code: "unknown", message: `Something went wrong: ${message}` };
  }
}

export async function connectSheet(formId: string, sheetUrl: string) {
  const ownerId = await getSessionUserId();
  const parsed = parseSheetUrl(sheetUrl);
  if (!parsed) throw new Error("Invalid Google Sheet URL");

  const access = await verifySheetAccess(sheetUrl);
  if (!access.ok) {
    throw new Error(access.message);
  }

  const form = await prisma.form.findFirstOrThrow({
    where: { id: formId, ownerId },
    select: { isPlayground: true },
  });
  if (form.isPlayground) {
    throw new Error(
      "Save this form to your account before connecting a Google Sheet.",
    );
  }
  await prisma.sheetConnection.upsert({
    where: { formId },
    create: {
      formId,
      sheetUrl,
      sheetId: parsed.sheetId,
      sheetName: access.sheetName,
      tabName: access.sheetName,
    },
    update: {
      sheetUrl,
      sheetId: parsed.sheetId,
      sheetName: access.sheetName,
      tabName: access.sheetName,
    },
  });

  revalidatePath(`/forms/${formId}`);
}

export async function disconnectSheet(formId: string) {
  const ownerId = await getSessionUserId();
  await prisma.form.findFirstOrThrow({ where: { id: formId, ownerId } });
  await prisma.sheetConnection.deleteMany({ where: { formId } });
  revalidatePath(`/forms/${formId}`);
}

export interface PaginatedSubmissions {
  submissions: Submission[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listSubmissions(
  formId: string,
  page = 1,
  pageSize = SUBMISSIONS_PAGE_SIZE,
): Promise<PaginatedSubmissions> {
  const ownerId = await getSessionUserId();
  await prisma.form.findFirstOrThrow({ where: { id: formId, ownerId } });

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where: { formId },
      orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.submission.count({ where: { formId } }),
  ]);

  return {
    submissions: submissions.map((s) => ({
      id: s.id,
      formId: s.formId,
      submittedAt: s.submittedAt.toISOString(),
      answers: s.answers as Record<string, unknown>,
    })),
    total,
    page,
    pageSize,
  };
}

export async function getSubmissionPage(
  formId: string,
  submissionId: string,
  pageSize = SUBMISSIONS_PAGE_SIZE,
): Promise<number> {
  const ownerId = await getSessionUserId();
  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      formId,
      form: { ownerId },
    },
    select: { submittedAt: true, id: true },
  });

  if (!submission) return 1;

  const aheadCount = await prisma.submission.count({
    where: {
      formId,
      OR: [
        { submittedAt: { gt: submission.submittedAt } },
        {
          submittedAt: submission.submittedAt,
          id: { gt: submission.id },
        },
      ],
    },
  });

  return submissionPageFromRank(aheadCount, pageSize);
}

export async function getSubmission(
  formId: string,
  submissionId: string,
): Promise<Submission | null> {
  const ownerId = await getSessionUserId();
  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      formId,
      form: { ownerId },
    },
  });

  if (!submission) return null;

  return {
    id: submission.id,
    formId: submission.formId,
    submittedAt: submission.submittedAt.toISOString(),
    answers: submission.answers as Record<string, unknown>,
  };
}

export async function getPublicForm(id: string): Promise<FormDetail | null> {
  const form = await prisma.form.findFirst({
    where: { id, isPublished: true },
    include: {
      questions: { orderBy: { position: "asc" } },
      sheetConnection: { select: { sheetUrl: true, sheetName: true } },
    },
  });
  if (!form) return null;
  if (isPlaygroundFormExpired(form.isPlayground, form.expiresAt)) {
    return null;
  }
  return {
    ...mapForm({
      ...form,
      _count: { questions: form.questions.length, submissions: 0 },
    }),
    questions: form.questions.map(mapQuestion),
  };
}

export async function claimPlaygroundForm(
  formId: string,
): Promise<ClaimPlaygroundResult> {
  const ownerId = await getSessionUserId();

  const form = await prisma.form.findFirst({
    where: { id: formId, isPlayground: true, isPublished: true },
  });

  if (!form) {
    return { ok: false, message: "This playground form is no longer available." };
  }

  if (isPlaygroundFormExpired(form.isPlayground, form.expiresAt)) {
    return { ok: false, message: "This playground form has expired." };
  }

  await prisma.form.update({
    where: { id: formId },
    data: {
      ownerId,
      isPlayground: false,
      expiresAt: null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/forms/${formId}`);
  revalidatePath(`/f/${formId}`);

  return { ok: true, formId };
}

function stripQuestionFields(q: Question): Record<string, unknown> {
  const rest = { ...(q as unknown as Record<string, unknown>) };
  delete rest.id;
  delete rest.type;
  delete rest.title;
  delete rest.description;
  delete rest.required;
  return rest;
}

export async function suggestForm(prompt: string): Promise<SuggestFormResult> {
  if (!isAiConfigured()) {
    return {
      ok: false,
      code: "unconfigured",
      message:
        "AI generation isn't configured on this server. Use Start blank or add OPEN_ROUTER_KEY.",
    };
  }

  const userId = await getSessionUserId();
  const trimmed = prompt.trim();

  if (!trimmed) {
    return {
      ok: false,
      code: "invalid_prompt",
      message: "Describe what you need before generating a form.",
    };
  }

  if (trimmed.length > AI_PROMPT_MAX_LENGTH) {
    return {
      ok: false,
      code: "invalid_prompt",
      message: `Keep your description under ${AI_PROMPT_MAX_LENGTH} characters.`,
    };
  }

  const limit = await checkRateLimit(`ai:suggest:${userId}`, 10, 60 * 60);
  if (!limit.allowed) {
    return {
      ok: false,
      code: "rate_limited",
      message: "You've hit the AI generation limit. Try again in an hour.",
    };
  }

  try {
    const suggestion = await generateFormSuggestion(trimmed);
    return { ok: true, suggestion };
  } catch (error) {
    if (error instanceof FormSuggestionError) {
      return {
        ok: false,
        code: "generation_failed",
        message: error.message,
      };
    }

    return {
      ok: false,
      code: "generation_failed",
      message: "Something went wrong while generating your form. Try again.",
    };
  }
}
