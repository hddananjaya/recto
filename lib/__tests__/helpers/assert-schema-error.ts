import { expect } from "vitest";
import type { z } from "zod";

import type { Question } from "@/lib/types";
import { buildSubmissionSchema } from "@/lib/validation";

export function parseSubmission(questions: Question[], data: Record<string, unknown>) {
  return buildSubmissionSchema(questions).safeParse(data);
}

export function expectSchemaSuccess(
  questions: Question[],
  data: Record<string, unknown>,
) {
  const result = parseSubmission(questions, data);
  expect(result.success).toBe(true);
  return result;
}

export function expectSchemaError(
  questions: Question[],
  data: Record<string, unknown>,
  fieldId: string,
  message: string,
) {
  const result = parseSubmission(questions, data);
  expect(result.success).toBe(false);
  if (result.success) return;

  const fieldError = result.error.issues.find(
    (issue) => issue.path[0] === fieldId,
  );
  expect(fieldError?.message).toBe(message);
  expect(fieldError?.message).not.toMatch(/invalid input|expected |received /i);
}

export function expectSchemaOptionalOmit(
  questions: Question[],
  data: Record<string, unknown>,
  fieldId: string,
) {
  const result = parseSubmission(questions, data);
  expect(result.success).toBe(true);
  if (!result.success) return;
  expect(result.data[fieldId]).toBeUndefined();
}

export function expectZodError(
  schema: z.ZodTypeAny,
  data: unknown,
  message: string,
) {
  const result = schema.safeParse(data);
  expect(result.success).toBe(false);
  if (result.success) return;
  expect(result.error.issues.some((i) => i.message === message)).toBe(true);
}
