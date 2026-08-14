import { describe, expect, it } from "vitest";

import { aiFormSuggestionSchema } from "@/lib/ai/schemas";

const validPayload = {
  title: "Survey",
  description: "Help us improve",
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
};

describe("aiFormSuggestionSchema", () => {
  it("accepts valid payload", () => {
    expect(aiFormSuggestionSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects empty description", () => {
    const result = aiFormSuggestionSchema.safeParse({
      ...validPayload,
      description: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 12 questions", () => {
    const questions = Array.from({ length: 13 }, () => validPayload.questions[0]);
    const result = aiFormSuggestionSchema.safeParse({
      ...validPayload,
      questions,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid question type", () => {
    const result = aiFormSuggestionSchema.safeParse({
      ...validPayload,
      questions: [{ ...validPayload.questions[0], type: "checkbox" }],
    });
    expect(result.success).toBe(false);
  });
});
