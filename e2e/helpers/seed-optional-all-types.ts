import { question } from "@/lib/__tests__/fixtures/questions";
import type { Prisma } from "@prisma/client";
import type { Question, QuestionType } from "@/lib/types";
import { prisma } from "@/lib/prisma";

import { ALL_QUESTION_TYPES } from "./all-types";
import {
  REALISTIC_FORM_META,
  REALISTIC_QUESTIONS,
  questionTitle,
} from "./realistic-data";
import { buildAllTypesQuestions, toPrismaConfig } from "./seed-all-types";

export const E2E_OPTIONAL_FORM_ID = "e2eopt";

function questionId(index: number): string {
  return `e2oq${String(index + 1).padStart(2, "0")}`;
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildOptionalAllTypesQuestions(): Question[] {
  return ALL_QUESTION_TYPES.map((type: QuestionType, index) => {
    const spec = REALISTIC_QUESTIONS[type];
    const base = question(type, {
      id: questionId(index),
      title: questionTitle(type),
      required: false,
      placeholder: spec.placeholder,
    });

    if (spec.options) {
      base.options = spec.options.map((label) => ({
        label,
        value: slugify(label),
      }));
    }

    if (spec.matrixRows) base.rows = spec.matrixRows;
    if (spec.matrixColumns) base.columns = spec.matrixColumns;

    return base;
  });
}

export async function seedOptionalAllTypesForm(ownerId: string): Promise<string> {
  const questions = buildOptionalAllTypesQuestions();
  const questionIds = questions.map((q) => q.id);

  await prisma.form.upsert({
    where: { id: E2E_OPTIONAL_FORM_ID },
    create: {
      id: E2E_OPTIONAL_FORM_ID,
      ownerId,
      title: `${REALISTIC_FORM_META.title} (optional)`,
      description: "All questions optional — empty fields should skip.",
      isPublished: true,
    },
    update: {
      ownerId,
      title: `${REALISTIC_FORM_META.title} (optional)`,
      description: "All questions optional — empty fields should skip.",
      isPublished: true,
    },
  });

  await prisma.question.deleteMany({
    where: {
      formId: E2E_OPTIONAL_FORM_ID,
      id: { notIn: questionIds },
    },
  });

  for (const [index, q] of questions.entries()) {
    await prisma.question.upsert({
      where: { id: q.id },
      create: {
        id: q.id,
        formId: E2E_OPTIONAL_FORM_ID,
        type: q.type,
        title: q.title,
        description: q.description ?? null,
        required: false,
        position: index,
        config: toPrismaConfig(q),
      },
      update: {
        type: q.type,
        title: q.title,
        description: q.description ?? null,
        required: false,
        position: index,
        config: toPrismaConfig(q),
      },
    });
  }

  return E2E_OPTIONAL_FORM_ID;
}
