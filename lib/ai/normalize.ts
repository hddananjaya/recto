import { DEFAULT_FILE_UPLOAD_PRESETS } from "@/lib/file-upload-presets";
import type { AiFormSuggestion } from "@/lib/types";
import type { Question, QuestionOption } from "@/lib/types";
import { AI_SUGGEST_MAX_QUESTIONS } from "./config";
import type { AiFormSuggestionRaw } from "./schemas";

function slugOptionValue(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

function labelsToOptions(labels: string[]): QuestionOption[] {
  const seen = new Set<string>();
  return labels.map((label) => {
    let value = slugOptionValue(label);
    let suffix = 2;
    while (seen.has(value)) {
      value = `${slugOptionValue(label)}-${suffix}`;
      suffix += 1;
    }
    seen.add(value);
    return { label, value };
  });
}

function uniqueStrings(values: string[] | undefined): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const value of values ?? []) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

function normalizeQuestion(
  raw: AiFormSuggestionRaw["questions"][number],
): Question {
  const question: Question = {
    id: crypto.randomUUID(),
    type: raw.type,
    title: raw.title.trim(),
    required: raw.required,
  };

  if (raw.placeholder?.trim()) {
    question.placeholder = raw.placeholder.trim();
  }

  // AI often adds redundant helper text; titles and placeholders are enough.
  if (
    raw.type === "single_select" ||
    raw.type === "multi_select" ||
    raw.type === "ranking"
  ) {
    const labels = uniqueStrings(raw.optionLabels);
    question.options = labelsToOptions(
      labels.length > 0 ? labels : ["Option 1", "Option 2"],
    );
  }

  if (raw.type === "matrix") {
    const rows = uniqueStrings(raw.rows);
    const columns = uniqueStrings(raw.columns);
    question.rows = rows.length > 0 ? rows : ["Row 1", "Row 2"];
    question.columns = columns.length > 0 ? columns : ["Column 1", "Column 2"];
  }

  if (raw.type === "rating") {
    question.maxRating = raw.maxRating ?? 5;
  }

  if (raw.type === "file") {
    question.allowedFilePresets = [...DEFAULT_FILE_UPLOAD_PRESETS];
    question.customFileTypes = "";
  }

  return question;
}

function fallbackFormDescription(title: string): string {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return "Please complete this form. Your responses help us improve.";
  }

  return `Thanks for your time — please share your feedback for ${trimmedTitle}.`;
}

export function normalizeFormSuggestion(
  raw: AiFormSuggestionRaw,
): AiFormSuggestion {
  const title = raw.title.trim();
  const description = raw.description.trim() || fallbackFormDescription(title);

  return {
    title,
    description,
    questions: raw.questions
      .slice(0, AI_SUGGEST_MAX_QUESTIONS)
      .map(normalizeQuestion),
  };
}
