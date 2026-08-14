import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Question } from "@/lib/types";
import { mapQuestion } from "@/lib/questions";
import { buildSubmissionSchema, sanitizeSubmissionBody } from "@/lib/validation";
import { getClientIp } from "@/lib/client-ip";
import { isPlaygroundFormExpired } from "@/lib/playground";
import { checkRateLimit } from "@/lib/rate-limit";
import { attachSubmissionFiles } from "@/lib/submission-files";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> },
) {
  const { formId } = await params;

  const form = await prisma.form.findFirst({
    where: { id: formId, isPublished: true },
    include: { questions: { orderBy: { position: "asc" } } },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  if (isPlaygroundFormExpired(form.isPlayground, form.expiresAt)) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const isOwnerTestSubmit = Boolean(
    session?.user?.id && session.user.id === form.ownerId,
  );

  // Rate limit by form + IP.
  const ip = await getClientIp();
  const limitKey = `submit:${formId}:${ip}`;
  const limit = await checkRateLimit(limitKey, 20, 60);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const questions = form.questions.map(mapQuestion);
  const sanitizedBody = sanitizeSubmissionBody(questions, body);
  const schema = buildSubmissionSchema(questions);
  const parsed = schema.safeParse(sanitizedBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Owner testing the live form while signed in — validate only, don't persist.
  if (isOwnerTestSubmit) {
    return NextResponse.json(
      { id: `preview-${crypto.randomUUID()}`, preview: true },
      { status: 201 },
    );
  }

  const ipHash = ip ? createHash("sha256").update(ip).digest("hex") : null;

  try {
    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.submission.create({
        data: {
          formId,
          answers: parsed.data as unknown as Prisma.InputJsonValue,
          ipHash,
        },
      });

      await attachSubmissionFiles(
        tx,
        formId,
        sub.id,
        questions,
        parsed.data as Record<string, unknown>,
      );

      await tx.syncJob.create({
        data: { submissionId: sub.id },
      });

      return sub;
    });

    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Submission failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
