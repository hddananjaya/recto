import { prisma } from "../../lib/prisma";

import { E2E_RESPONSES_FORM_ID } from "./constants";

const QUESTION_ID = "e2ersp-q1";

export const E2E_RESPONSES_SUBMISSION_COUNT = 25;

/** Stable ids for the first two submissions (newest first). */
export let E2E_RESPONSES_NEWEST_SUBMISSION_ID = "";
export let E2E_RESPONSES_SECOND_SUBMISSION_ID = "";

export async function seedResponsesForm(ownerId: string): Promise<string> {
  await prisma.form.upsert({
    where: { id: E2E_RESPONSES_FORM_ID },
    create: {
      id: E2E_RESPONSES_FORM_ID,
      ownerId,
      title: "E2E Responses",
      description: "Seeded form for responses workspace tests.",
      isPublished: true,
    },
    update: {
      ownerId,
      title: "E2E Responses",
      description: "Seeded form for responses workspace tests.",
      isPublished: true,
    },
  });

  await prisma.question.upsert({
    where: { id: QUESTION_ID },
    create: {
      id: QUESTION_ID,
      formId: E2E_RESPONSES_FORM_ID,
      type: "text",
      title: "Your name",
      required: true,
      position: 0,
      config: {},
    },
    update: {
      title: "Your name",
      required: true,
      position: 0,
    },
  });

  await prisma.submission.deleteMany({
    where: { formId: E2E_RESPONSES_FORM_ID },
  });

  const submissionIds: string[] = [];

  for (let index = 0; index < E2E_RESPONSES_SUBMISSION_COUNT; index++) {
    const submission = await prisma.submission.create({
      data: {
        formId: E2E_RESPONSES_FORM_ID,
        answers: { [QUESTION_ID]: `Responder ${index + 1}` },
        submittedAt: new Date(Date.now() - index * 60_000),
      },
      select: { id: true },
    });
    submissionIds.push(submission.id);
  }

  E2E_RESPONSES_NEWEST_SUBMISSION_ID = submissionIds[0] ?? "";
  E2E_RESPONSES_SECOND_SUBMISSION_ID = submissionIds[1] ?? "";

  return E2E_RESPONSES_FORM_ID;
}
