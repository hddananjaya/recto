import { format, isValid, parse } from "date-fns";
import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js/min";
import type { Question, QuestionType } from "./types";
import { fileAnswerSchema } from "./files";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const URL_PATTERN = /^https?:\/\/[^\s/.]+(\.[^\s/.]+)+([/?#].*)?$/i;

function emptyToUndefined(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (value === "") return undefined;
  if (Array.isArray(value) && value.length === 0) return undefined;
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  ) {
    return undefined;
  }
  return value;
}

const REQUIRED_MESSAGE = "This field is required";

function emptyNumberToUndefined(value: unknown): unknown {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number" && Number.isNaN(value)) return undefined;
  return value;
}

function isCompleteMatrixAnswer(q: Question, value: unknown): boolean {
  const rows = q.rows ?? [];
  const columns = q.columns ?? [];
  if (rows.length === 0) return false;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const matrix = value as Record<string, string>;
  return (
    Object.keys(matrix).length === rows.length &&
    rows.every((row) => row in matrix && columns.includes(String(matrix[row])))
  );
}

function optionalMatrixPreprocessor(q: Question, value: unknown): unknown {
  const emptied = emptyToUndefined(value);
  if (emptied === undefined) return undefined;
  return isCompleteMatrixAnswer(q, value) ? value : undefined;
}

function asOptional(validator: z.ZodTypeAny): z.ZodTypeAny {
  return z.preprocess(emptyToUndefined, validator.optional());
}

function optionValues(q: Question): string[] {
  return q.options?.map((o) => o.value) ?? [];
}

function isAllowedOptionValue(q: Question, value: string): boolean {
  return optionValues(q).includes(value);
}

/** Parse a stored date answer (string, Date, or ISO) for display / calendar selection. */
export function parseDateAnswer(value: unknown): Date | undefined {
  if (value == null || value === "") return undefined;
  if (value instanceof Date) {
    return isValid(value) ? value : undefined;
  }
  if (typeof value === "string") {
    const fromDay = parse(value, "yyyy-MM-dd", new Date());
    if (isValid(fromDay)) return fromDay;
    const fromIso = new Date(value);
    return isValid(fromIso) ? fromIso : undefined;
  }
  return undefined;
}

/** Normalize a date answer to `yyyy-MM-dd` for form state and submission. */
export function formatDateAnswer(value: unknown): string | undefined {
  const date = parseDateAnswer(value);
  if (!date) return undefined;
  return format(date, "yyyy-MM-dd");
}

const baseValidators: Record<
  QuestionType,
  (q: Question) => z.ZodType<unknown>
> = {
  text: () => z.string().min(1, "This field is required"),
  email: () => z.string().email("Enter a valid email"),
  phone: () =>
    z.string().refine((value) => isValidPhoneNumber(value), {
      message: "Enter a valid phone number",
    }),
  number: () =>
    z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined ? undefined : val,
      z.coerce.number({ message: "This field is required" }),
    ),
  url: () =>
    z
      .string()
      .url("Enter a valid URL")
      .regex(URL_PATTERN, "Enter a valid URL"),
  textarea: () => z.string().min(1, "This field is required"),
  single_select: (q) =>
    z.string().refine((v) => isAllowedOptionValue(q, v), {
      message: "Select a valid option",
    }),
  multi_select: (q) =>
    z
      .array(z.string())
      .min(1, "Select at least one option")
      .refine((arr) => arr.every((v) => isAllowedOptionValue(q, v)), {
        message: "Select valid options",
      }),
  rating: (q) => {
    const max = q.maxRating ?? 5;
    return z.preprocess(
      emptyNumberToUndefined,
      z
        .number({ error: REQUIRED_MESSAGE })
        .int()
        .min(1, "Select a rating")
        .max(max),
    );
  },
  nps: () =>
    z.preprocess(
      emptyNumberToUndefined,
      z
        .number({ error: REQUIRED_MESSAGE })
        .int()
        .min(0, "Select a score")
        .max(10),
    ),
  ranking: (q) => {
    const options = optionValues(q);
    return z
      .array(z.string())
      .min(1, "Rank all options")
      .refine(
        (arr) => {
          if (options.length === 0) return arr.length > 0;
          return (
            arr.length === options.length &&
            new Set(arr).size === arr.length &&
            arr.every((v) => options.includes(v))
          );
        },
        { message: "Rank all options" },
      );
  },
  matrix: (q) => {
    const rows = q.rows ?? [];
    const columns = q.columns ?? [];
    return z.record(z.string(), z.string()).refine(
      (value) => {
        if (rows.length === 0) return true;
        return (
          Object.keys(value).length === rows.length &&
          rows.every(
            (row) => row in value && columns.includes(String(value[row])),
          )
        );
      },
      { message: "Answer all rows" },
    );
  },
  date: () =>
    z.preprocess(
      (val) => {
        const formatted = formatDateAnswer(val);
        if (formatted) return formatted;
        if (val === undefined || val === null || val === "") return undefined;
        return val;
      },
      z
        .string({ error: "Enter a valid date" })
        .regex(DATE_PATTERN, { message: "Enter a valid date" }),
    ),
  file: () => fileAnswerSchema,
  signature: () => z.string().min(1, REQUIRED_MESSAGE),
  switch: () => z.union([z.literal(true), z.literal(false)]),
};

function requiredValidator(q: Question): z.ZodTypeAny {
  const validator = baseValidators[q.type](q);

  switch (q.type) {
    case "number":
      return validator.refine(
        (v) => typeof v === "number" && !Number.isNaN(v),
        { message: REQUIRED_MESSAGE },
      );
    case "file":
      return z.custom<unknown>(
        (val) => fileAnswerSchema.safeParse(val).success,
        { message: "Upload a file to continue" },
      );
    case "switch":
      return z.custom<boolean>(
        (val) => val === true || val === false,
        { message: REQUIRED_MESSAGE },
      );
    default:
      return validator;
  }
}

function optionalValidator(q: Question): z.ZodTypeAny {
  if (q.type === "matrix") {
    return z.preprocess(
      (value) => optionalMatrixPreprocessor(q, value),
      z.union([baseValidators.matrix(q), z.undefined()]),
    );
  }
  return asOptional(baseValidators[q.type](q));
}

/** Shared Zod schema for public form answers (client + server). */
export function buildSubmissionSchema(questions: Question[]) {
  const shape: Record<string, z.ZodType<unknown>> = {};

  for (const q of questions) {
    if (!(q.type in baseValidators)) continue;
    shape[q.id] = q.required
      ? requiredValidator(q)
      : optionalValidator(q);
  }

  return z.object(shape);
}

export function sanitizeSubmissionBody(
  questions: Question[],
  body: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = { ...body };

  for (const q of questions) {
    if (!(q.id in sanitized)) continue;
    let normalized = emptyToUndefined(sanitized[q.id]);
    if (q.type === "date" && normalized !== undefined) {
      normalized = formatDateAnswer(normalized) ?? undefined;
    }
    if (normalized === undefined) {
      delete sanitized[q.id];
    } else {
      sanitized[q.id] = normalized;
    }
  }

  return sanitized;
}

export function defaultAnswerForQuestion(q: Question): unknown {
  switch (q.type) {
    case "switch":
      return undefined;
    case "multi_select":
      return [];
    case "ranking":
      return q.required ? optionValues(q) : [];
    case "matrix":
      return {};
    case "file":
      return null;
    case "number":
    case "rating":
    case "nps":
      return undefined;
    default:
      return "";
  }
}

/** Coerce draft/restored answers to types the form renderer expects. */
export function normalizeAnswersForQuestions(
  questions: Question[],
  answers: Record<string, unknown>,
): Record<string, unknown> {
  const normalized = { ...answers };

  for (const q of questions) {
    if (!(q.id in normalized)) continue;

    if (q.type === "date") {
      const formatted = formatDateAnswer(normalized[q.id]);
      if (formatted) {
        normalized[q.id] = formatted;
      } else {
        delete normalized[q.id];
      }
    }
  }

  return normalized;
}
