import { describe, expect, it } from "vitest";

import {
  isPlaygroundFormExpired,
  playgroundExpiresAt,
  sanitizePlaygroundQuestions,
} from "@/lib/playground";
import { question, resetQuestionIds } from "@/lib/__tests__/fixtures/questions";

describe("playground", () => {
  it("filters file and signature questions", () => {
    resetQuestionIds();
    const questions = [
      question("text"),
      question("file"),
      question("signature"),
      question("email"),
    ];
    const sanitized = sanitizePlaygroundQuestions(questions);
    expect(sanitized.map((q) => q.type)).toEqual(["text", "email"]);
  });

  it("detects expired playground forms", () => {
    const past = new Date(Date.now() - 1000);
    expect(isPlaygroundFormExpired(true, past)).toBe(true);
    expect(isPlaygroundFormExpired(false, past)).toBe(false);
    expect(isPlaygroundFormExpired(true, playgroundExpiresAt())).toBe(false);
  });
});
