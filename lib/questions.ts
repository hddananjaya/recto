import type { Prisma } from "@prisma/client";

import type { Question } from "@/lib/types";
import { normalizeFileUploadConfig } from "@/lib/file-upload-presets";

export function mapQuestion(
  q: Prisma.QuestionGetPayload<Record<string, never>>,
): Question {
  const question = {
    id: q.id,
    type: q.type as Question["type"],
    title: q.title,
    description: q.description ?? undefined,
    required: q.required,
    ...(q.config as Record<string, unknown>),
  } as Question;

  if (question.type === "file") {
    const fileConfig = normalizeFileUploadConfig({
      allowedFilePresets: question.allowedFilePresets,
      customFileTypes: question.customFileTypes,
    });
    question.allowedFilePresets = fileConfig.allowedFilePresets;
    question.customFileTypes = fileConfig.customFileTypes;
  }

  return question;
}
