import { question } from "@/lib/__tests__/fixtures/questions";
import type { Prisma } from "@prisma/client";
import type { Question, QuestionType } from "@/lib/types";
import { prisma } from "@/lib/prisma";

import { ALL_QUESTION_TYPES, E2E_ALL_TYPES_FORM_DESCRIPTION, E2E_ALL_TYPES_FORM_ID, E2E_ALL_TYPES_FORM_TITLE } from "./all-types";
import {
  REALISTIC_QUESTIONS,
  questionTitle,
} from "./realistic-data";

function questionId(index: number): string {
  return `e2eq${String(index + 1).padStart(2, "0")}`;
}

export function toPrismaConfig(q: Question): Prisma.InputJsonValue {
  const config: Record<string, unknown> = {};
  if (q.options) config.options = q.options;
  if (q.rows) config.rows = q.rows;
  if (q.columns) config.columns = q.columns;
  if (q.maxRating !== undefined) config.maxRating = q.maxRating;
  if (q.placeholder) config.placeholder = q.placeholder;
  if (q.allowedFilePresets) config.allowedFilePresets = q.allowedFilePresets;
  if (q.customFileTypes) config.customFileTypes = q.customFileTypes;
  return config as Prisma.InputJsonValue;
}

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildAllTypesQuestions(): Question[] {
  return ALL_QUESTION_TYPES.map((type: QuestionType, index) => {
    const spec = REALISTIC_QUESTIONS[type];
    const base = question(type, {
      id: questionId(index),
      title: questionTitle(type),
      required: true,
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

export async function seedAllTypesForm(ownerId: string): Promise<string> {
  const questions = buildAllTypesQuestions();
  const questionIds = questions.map((q) => q.id);

  await prisma.form.upsert({
    where: { id: E2E_ALL_TYPES_FORM_ID },
    create: {
      id: E2E_ALL_TYPES_FORM_ID,
      ownerId,
      title: E2E_ALL_TYPES_FORM_TITLE,
      description: E2E_ALL_TYPES_FORM_DESCRIPTION,
      isPublished: true,
    },
    update: {
      ownerId,
      title: E2E_ALL_TYPES_FORM_TITLE,
      description: E2E_ALL_TYPES_FORM_DESCRIPTION,
      isPublished: true,
    },
  });

  await prisma.question.deleteMany({
    where: {
      formId: E2E_ALL_TYPES_FORM_ID,
      id: { notIn: questionIds },
    },
  });

  for (const [index, q] of questions.entries()) {
    await prisma.question.upsert({
      where: { id: q.id },
      create: {
        id: q.id,
        formId: E2E_ALL_TYPES_FORM_ID,
        type: q.type,
        title: q.title,
        description: q.description ?? null,
        required: q.required,
        position: index,
        config: toPrismaConfig(q),
      },
      update: {
        type: q.type,
        title: q.title,
        description: q.description ?? null,
        required: q.required,
        position: index,
        config: toPrismaConfig(q),
      },
    });
  }

  return E2E_ALL_TYPES_FORM_ID;
}
