import { describe, expect, it } from "vitest";

import { AI_SUGGEST_MAX_QUESTIONS } from "@/lib/ai/config";
import { normalizeFormSuggestion } from "@/lib/ai/normalize";
import type { AiFormSuggestionRaw } from "@/lib/ai/schemas";

function baseSuggestion(
  overrides: Partial<AiFormSuggestionRaw> = {},
): AiFormSuggestionRaw {
  return {
    title: "  Feedback  ",
    description: "  Tell us more  ",
    questions: [
      {
        type: "text",
        title: "Name",
        description: null,
        required: true,
        placeholder: null,
        optionLabels: null,
        rows: null,
        columns: null,
        maxRating: null,
      },
    ],
    ...overrides,
  };
}

describe("normalizeFormSuggestion", () => {
  it("trims title and description", () => {
    const result = normalizeFormSuggestion(baseSuggestion());
    expect(result.title).toBe("Feedback");
    expect(result.description).toBe("Tell us more");
  });

  it("uses fallback description when empty", () => {
    const result = normalizeFormSuggestion(
      baseSuggestion({ description: "   " }),
    );
    expect(result.description).toContain("Feedback");
  });

  it("caps question count", () => {
    const questions = Array.from({ length: AI_SUGGEST_MAX_QUESTIONS + 5 }, () => ({
      type: "text" as const,
      title: "Q",
      description: null,
      required: true,
      placeholder: null,
      optionLabels: null,
      rows: null,
      columns: null,
      maxRating: null,
    }));
    const result = normalizeFormSuggestion(baseSuggestion({ questions }));
    expect(result.questions).toHaveLength(AI_SUGGEST_MAX_QUESTIONS);
  });

  it("slugifies select options and deduplicates labels", () => {
    const result = normalizeFormSuggestion(
      baseSuggestion({
        questions: [
          {
            type: "single_select",
            title: "Pick",
            description: "ignored",
            required: true,
            placeholder: null,
            optionLabels: ["Red", "Red", "Blue"],
            rows: null,
            columns: null,
            maxRating: null,
          },
        ],
      }),
    );
    const q = result.questions[0];
    expect(q?.options?.map((o) => o.value)).toEqual(["red", "blue"]);
    expect(q?.description).toBeUndefined();
  });

  it("suffixes slug collisions from distinct labels", () => {
    const result = normalizeFormSuggestion(
      baseSuggestion({
        questions: [
          {
            type: "single_select",
            title: "Pick",
            description: null,
            required: true,
            placeholder: null,
            optionLabels: ["A B", "A-B"],
            rows: null,
            columns: null,
            maxRating: null,
          },
        ],
      }),
    );
    expect(result.questions[0]?.options?.map((o) => o.value)).toEqual([
      "a-b",
      "a-b-2",
    ]);
  });

  it("defaults matrix rows and columns", () => {
    const result = normalizeFormSuggestion(
      baseSuggestion({
        questions: [
          {
            type: "matrix",
            title: "Grid",
            description: null,
            required: true,
            placeholder: null,
            optionLabels: null,
            rows: [],
            columns: [],
            maxRating: null,
          },
        ],
      }),
    );
    expect(result.questions[0]?.rows).toEqual(["Row 1", "Row 2"]);
    expect(result.questions[0]?.columns).toEqual(["Column 1", "Column 2"]);
  });

  it("defaults rating max and file presets", () => {
    const rating = normalizeFormSuggestion(
      baseSuggestion({
        questions: [
          {
            type: "rating",
            title: "Rate",
            description: null,
            required: true,
            placeholder: null,
            optionLabels: null,
            rows: null,
            columns: null,
            maxRating: null,
          },
        ],
      }),
    );
    expect(rating.questions[0]?.maxRating).toBe(5);

    const file = normalizeFormSuggestion(
      baseSuggestion({
        questions: [
          {
            type: "file",
            title: "Upload",
            description: null,
            required: false,
            placeholder: null,
            optionLabels: null,
            rows: null,
            columns: null,
            maxRating: null,
          },
        ],
      }),
    );
    expect(file.questions[0]?.allowedFilePresets).toEqual(["images", "pdf"]);
  });
});
