import type { Question, QuestionType } from "./types";
import {
  getInvalidCustomFileTypeTokens,
  isFileUploadConfigValid,
} from "./file-upload-presets";

export type EditorValidationMode = "save" | "publish";

/** Placeholder title assigned when creating a blank form. Not valid for publish. */
export const DEFAULT_FORM_TITLE = "Untitled form";

export function isMissingPublishTitle(title: string): boolean {
  const trimmed = title.trim();
  return trimmed === "" || trimmed === DEFAULT_FORM_TITLE;
}

export interface EditorValidationIssue {
  questionId?: string;
  field: string;
  message: string;
}

function parseOptionLabels(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function slugOptionValue(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function labelsToOptions(labels: string[]) {
  return labels.map((label) => ({
    label,
    value: slugOptionValue(label),
  }));
}

function parseLines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function findDuplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function findDuplicateStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) duplicates.add(value);
    seen.add(key);
  }
  return [...duplicates];
}

const OPTION_TYPES: QuestionType[] = [
  "single_select",
  "multi_select",
  "ranking",
];

function validateQuestionConfig(question: Question): EditorValidationIssue[] {
  const issues: EditorValidationIssue[] = [];
  const questionId = question.id;

  if (!question.title.trim()) {
    issues.push({
      questionId,
      field: "title",
      message: "Add a question title",
    });
  }

  if (OPTION_TYPES.includes(question.type)) {
    const options = question.options ?? [];
    const minOptions = question.type === "ranking" ? 2 : 1;

    if (options.length < minOptions) {
      issues.push({
        questionId,
        field: "options",
        message:
          question.type === "ranking"
            ? "Add at least 2 options to rank"
            : "Add at least one option",
      });
    }

    const duplicateValues = findDuplicateValues(options.map((o) => o.value));
    if (duplicateValues.length > 0) {
      issues.push({
        questionId,
        field: "options",
        message: `Options must be unique (duplicate values: ${duplicateValues.join(", ")})`,
      });
    }
  }

  if (question.type === "matrix") {
    const rows = question.rows ?? [];
    const columns = question.columns ?? [];

    if (rows.length === 0) {
      issues.push({
        questionId,
        field: "rows",
        message: "Add at least one matrix row",
      });
    }

    if (columns.length === 0) {
      issues.push({
        questionId,
        field: "columns",
        message: "Add at least one matrix column",
      });
    }

    const duplicateRows = findDuplicateStrings(rows);
    if (duplicateRows.length > 0) {
      issues.push({
        questionId,
        field: "rows",
        message: "Matrix rows must be unique",
      });
    }

    const duplicateColumns = findDuplicateStrings(columns);
    if (duplicateColumns.length > 0) {
      issues.push({
        questionId,
        field: "columns",
        message: "Matrix columns must be unique",
      });
    }
  }

  if (question.type === "rating" && question.maxRating !== undefined) {
    const max = question.maxRating;
    if (!Number.isInteger(max) || max < 1 || max > 10) {
      issues.push({
        questionId,
        field: "maxRating",
        message: "Max rating must be a whole number from 1 to 10",
      });
    }
  }

  if (question.type === "file") {
    const config = {
      allowedFilePresets: question.allowedFilePresets,
      customFileTypes: question.customFileTypes,
    };

    if (!isFileUploadConfigValid(config)) {
      issues.push({
        questionId,
        field: "allowedFilePresets",
        message: "Select at least one allowed file type or add custom types",
      });
    }

    const invalidTokens = getInvalidCustomFileTypeTokens(question.customFileTypes);
    if (invalidTokens.length > 0) {
      issues.push({
        questionId,
        field: "customFileTypes",
        message: `Invalid custom file type${invalidTokens.length > 1 ? "s" : ""}: ${invalidTokens.join(", ")}`,
      });
    }
  }

  return issues;
}

export function applyQuestionDrafts(
  questions: Question[],
  optionDrafts: Record<string, string> = {},
  matrixDrafts: Record<string, { rows: string; columns: string }> = {},
): Question[] {
  return questions.map((question) => {
    let next = question;

    if (
      question.id in optionDrafts &&
      OPTION_TYPES.includes(question.type)
    ) {
      next = {
        ...next,
        options: labelsToOptions(parseOptionLabels(optionDrafts[question.id])),
      };
    }

    if (question.type === "matrix" && question.id in matrixDrafts) {
      const draft = matrixDrafts[question.id];
      next = {
        ...next,
        rows: parseLines(draft.rows),
        columns: parseLines(draft.columns),
      };
    }

    return next;
  });
}

export function validateFormEditor(
  input: { title: string; questions: Question[] },
  mode: EditorValidationMode = "save",
): EditorValidationIssue[] {
  const issues: EditorValidationIssue[] = [];

  if (mode === "publish") {
    if (isMissingPublishTitle(input.title)) {
      issues.push({
        field: "title",
        message: "Add a form title before publishing",
      });
    }

    if (input.questions.length === 0) {
      issues.push({
        field: "questions",
        message: "Add at least one question before publishing",
      });
    }
  }

  for (const question of input.questions) {
    issues.push(...validateQuestionConfig(question));
  }

  return issues;
}

export function formatEditorValidationIssues(
  issues: EditorValidationIssue[],
): string {
  return issues.map((issue) => issue.message).join("\n");
}
