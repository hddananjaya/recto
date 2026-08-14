import { z } from "zod";

import { AI_QUESTION_TYPES } from "./question-types";

const questionTypeSchema = z.enum(AI_QUESTION_TYPES);

const nullableString = z.union([z.string(), z.null()]).transform((v) => v ?? undefined);
const nullableStringArray = z
  .union([z.array(z.string().min(1)), z.null()])
  .transform((v) => v ?? undefined);
const nullableMaxRating = z
  .union([z.number().int().min(1).max(10), z.null()])
  .transform((v) => v ?? undefined);

export const aiQuestionSchema = z.object({
  type: questionTypeSchema,
  title: z.string().min(1),
  description: nullableString,
  required: z.boolean(),
  placeholder: nullableString,
  optionLabels: nullableStringArray,
  rows: nullableStringArray,
  columns: nullableStringArray,
  maxRating: nullableMaxRating,
});

export const aiFormSuggestionSchema = z.object({
  title: z.string().min(1),
  description: z
    .string()
    .transform((value) => value.trim())
    .pipe(z.string().min(1)),
  questions: z.array(aiQuestionSchema).min(1).max(12),
});

export type AiFormSuggestionRaw = z.infer<typeof aiFormSuggestionSchema>;

const questionItemSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "type",
    "title",
    "description",
    "required",
    "placeholder",
    "optionLabels",
    "rows",
    "columns",
    "maxRating",
  ],
  properties: {
    type: {
      type: "string",
      enum: questionTypeSchema.options,
    },
    title: { type: "string" },
    description: { type: ["string", "null"] },
    required: { type: "boolean" },
    placeholder: { type: ["string", "null"] },
    optionLabels: {
      type: ["array", "null"],
      items: { type: "string" },
    },
    rows: {
      type: ["array", "null"],
      items: { type: "string" },
    },
    columns: {
      type: ["array", "null"],
      items: { type: "string" },
    },
    maxRating: {
      type: ["integer", "null"],
      minimum: 1,
      maximum: 10,
    },
  },
} as const;

export const aiFormSuggestionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "questions"],
  properties: {
    title: { type: "string" },
    description: { type: "string", minLength: 1 },
    questions: {
      type: "array",
      minItems: 1,
      maxItems: 12,
      items: questionItemSchema,
    },
  },
} as const;
