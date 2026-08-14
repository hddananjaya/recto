import type { FileAnswerReference, Question, QuestionType } from "@/lib/types";

let idCounter = 0;

function nextId(): string {
  idCounter += 1;
  return `q-${idCounter}`;
}

export function resetQuestionIds(): void {
  idCounter = 0;
}

const DEFAULT_OPTIONS = [
  { label: "Alpha", value: "alpha" },
  { label: "Beta", value: "beta" },
];

const DEFAULT_ROWS = ["Row A", "Row B"];
const DEFAULT_COLUMNS = ["Col 1", "Col 2", "Col 3"];

export function question(
  type: QuestionType,
  overrides: Partial<Question> = {},
): Question {
  const id = overrides.id ?? nextId();
  const base: Question = {
    id,
    type,
    title: `Q: ${type}`,
    required: true,
    ...overrides,
  };

  if (
    (type === "single_select" ||
      type === "multi_select" ||
      type === "ranking") &&
    !base.options
  ) {
    base.options = DEFAULT_OPTIONS;
  }

  if (type === "matrix") {
    base.rows = base.rows ?? DEFAULT_ROWS;
    base.columns = base.columns ?? DEFAULT_COLUMNS;
  }

  if (type === "rating" && base.maxRating === undefined) {
    base.maxRating = 5;
  }

  if (type === "file") {
    base.allowedFilePresets = base.allowedFilePresets ?? ["images"];
    base.customFileTypes = base.customFileTypes ?? "";
  }

  return base;
}

export function optionalQuestion(
  type: QuestionType,
  overrides: Partial<Question> = {},
): Question {
  return question(type, { required: false, ...overrides });
}

export function validAnswerFor(
  q: Question,
  fileAnswer?: FileAnswerReference,
): unknown {
  switch (q.type) {
    case "text":
    case "textarea":
    case "signature":
      return "Hello";
    case "email":
      return "qa@test.com";
    case "phone":
      return "+13125551234";
    case "number":
      return 42;
    case "url":
      return "https://example.com";
    case "single_select":
      return q.options?.[0]?.value ?? "alpha";
    case "multi_select":
      return [q.options?.[0]?.value ?? "alpha"];
    case "rating":
      return 4;
    case "nps":
      return 8;
    case "ranking":
      return (q.options ?? []).map((o) => o.value);
    case "matrix": {
      const rows = q.rows ?? [];
      const col = q.columns?.[0] ?? "Col 1";
      return Object.fromEntries(rows.map((row) => [row, col]));
    }
    case "date":
      return "2026-08-10";
    case "file":
      return fileAnswer ?? {
        fileId: "file-1",
        name: "sample.png",
        size: 100,
        mimeType: "image/png",
      };
    case "switch":
      return true;
    default:
      return "";
  }
}
