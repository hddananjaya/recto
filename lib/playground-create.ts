import { Prisma } from "@prisma/client";

import { generateFormSuggestion } from "@/lib/ai/suggest-form";
import { generateFormId } from "@/lib/form-id";
import { getOrCreatePlaygroundOwnerId } from "@/lib/playground-owner";
import {
  playgroundExpiresAt,
  sanitizePlaygroundQuestions,
} from "@/lib/playground";
import { prisma } from "@/lib/prisma";
import type { Question } from "@/lib/types";

function stripQuestionFields(q: Question): Record<string, unknown> {
  const rest = { ...(q as unknown as Record<string, unknown>) };
  delete rest.id;
  delete rest.type;
  delete rest.title;
  delete rest.description;
  delete rest.required;
  return rest;
}

export async function createPlaygroundFormFromPrompt(
  prompt: string,
): Promise<string> {
  const suggestion = await generateFormSuggestion(prompt);
  const questions = sanitizePlaygroundQuestions(suggestion.questions);

  if (questions.length === 0) {
    throw new Error("Could not build a playground form from that description.");
  }

  const ownerId = await getOrCreatePlaygroundOwnerId();
  const expiresAt = playgroundExpiresAt();

  const data = {
    ownerId,
    title: suggestion.title,
    description: suggestion.description,
    isPublished: true,
    isPlayground: true,
    expiresAt,
    questions: {
      create: questions.map((q, index) => ({
        type: q.type,
        title: q.title,
        description: q.description,
        required: q.required,
        position: index,
        config: stripQuestionFields(q) as unknown as Prisma.InputJsonValue,
      })),
    },
  };

  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const form = await prisma.form.create({
        data: { id: generateFormId(), ...data },
        select: { id: true },
      });
      return form.id;
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

  throw new Error("Could not allocate a form id. Try again.");
}
