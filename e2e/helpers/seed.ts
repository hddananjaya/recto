import { prisma } from "../../lib/prisma";

import { E2E_PUBLISHED_FORM_ID } from "./constants";
import { REALISTIC_ANSWERS, REALISTIC_QUESTIONS } from "./realistic-data";

const QUESTION_IDS = ["e2e-q-name", "e2e-q-email"] as const;

export async function seedPublishedForm(ownerId: string): Promise<string> {
  await prisma.form.upsert({
    where: { id: E2E_PUBLISHED_FORM_ID },
    create: {
      id: E2E_PUBLISHED_FORM_ID,
      ownerId,
      title: "Quick contact",
      description: "Leave your details and we'll follow up within one business day.",
      isPublished: true,
    },
    update: {
      ownerId,
      title: "Quick contact",
      description: "Leave your details and we'll follow up within one business day.",
      isPublished: true,
    },
  });

  await prisma.question.deleteMany({
    where: {
      formId: E2E_PUBLISHED_FORM_ID,
      id: { notIn: [...QUESTION_IDS] },
    },
  });

  await prisma.question.upsert({
    where: { id: QUESTION_IDS[0] },
    create: {
      id: QUESTION_IDS[0],
      formId: E2E_PUBLISHED_FORM_ID,
      type: "text",
      title: REALISTIC_QUESTIONS.text.title,
      required: true,
      position: 0,
      config: { placeholder: REALISTIC_ANSWERS.text },
    },
    update: {
      title: REALISTIC_QUESTIONS.text.title,
      required: true,
      position: 0,
      config: { placeholder: REALISTIC_ANSWERS.text },
    },
  });

  await prisma.question.upsert({
    where: { id: QUESTION_IDS[1] },
    create: {
      id: QUESTION_IDS[1],
      formId: E2E_PUBLISHED_FORM_ID,
      type: "email",
      title: REALISTIC_QUESTIONS.email.title,
      required: true,
      position: 1,
      config: { placeholder: REALISTIC_ANSWERS.email },
    },
    update: {
      title: REALISTIC_QUESTIONS.email.title,
      required: true,
      position: 1,
      config: { placeholder: REALISTIC_ANSWERS.email },
    },
  });

  return E2E_PUBLISHED_FORM_ID;
}
