import { beforeEach, describe, expect, it } from "vitest";

import { question, resetQuestionIds } from "@/lib/__tests__/fixtures/questions";
import {
  getFileUploadEmptyLabel,
  getFileUploadEmptyLabelForQuestion,
  getFooterHint,
  getMobileFooterInstruction,
} from "@/lib/form-contextual-hints";

beforeEach(() => {
  resetQuestionIds();
});

describe("getFooterHint", () => {
  it("returns enter on intro", () => {
    expect(getFooterHint(null, true)).toEqual({
      kind: "keyboard",
      variant: "enter",
    });
  });

  it("returns enter-with-newline for textarea", () => {
    const q = question("textarea");
    expect(getFooterHint(q, false)).toEqual({
      kind: "keyboard",
      variant: "enter-with-newline",
    });
  });

  it("returns enter for text-like types", () => {
    for (const type of ["text", "email", "phone", "number", "url", "signature"] as const) {
      expect(getFooterHint(question(type), false)).toEqual({
        kind: "keyboard",
        variant: "enter",
      });
    }
  });

  it("returns instructions per type", () => {
    expect(getFooterHint(question("multi_select"), false)).toEqual({
      kind: "instruction",
      text: "Select all that apply",
    });
    expect(getFooterHint(question("file"), false)).toEqual({
      kind: "instruction",
      text: "Upload a file to continue",
    });
    expect(getFooterHint(question("date"), false)).toEqual({
      kind: "instruction",
      text: "Pick a date",
    });
    expect(getFooterHint(question("rating"), false)).toEqual({
      kind: "instruction",
      text: "Select a rating",
    });
  });
});

describe("getMobileFooterInstruction", () => {
  it("returns null on intro", () => {
    expect(getMobileFooterInstruction(null, true)).toBeNull();
  });

  it("uses tap language for file and date", () => {
    expect(getMobileFooterInstruction(question("file"), false)).toBe(
      "Tap to choose a file",
    );
    expect(getMobileFooterInstruction(question("date"), false)).toBe(
      "Tap to pick a date",
    );
  });

  it("never mentions drag on mobile", () => {
    const types = [
      "text",
      "email",
      "file",
      "date",
      "textarea",
      "single_select",
      "rating",
      "switch",
    ] as const;
    for (const type of types) {
      const hint = getMobileFooterInstruction(question(type), false) ?? "";
      expect(hint.toLowerCase()).not.toContain("drag");
    }
  });

  it("returns textarea continue hint", () => {
    expect(getMobileFooterInstruction(question("textarea"), false)).toBe(
      "Use Continue when you're done",
    );
  });

  it("returns null for plain text types", () => {
    expect(getMobileFooterInstruction(question("text"), false)).toBeNull();
  });
});

describe("getFileUploadEmptyLabel", () => {
  it("uses tap labels on touch", () => {
    expect(
      getFileUploadEmptyLabel({ allowedFilePresets: ["images"] }, "touch"),
    ).toBe("Tap to choose a photo");
    expect(getFileUploadEmptyLabel({ allowedFilePresets: ["pdf"] }, "touch")).toBe(
      "Tap to choose a PDF",
    );
    expect(getFileUploadEmptyLabel({ allowedFilePresets: ["any"] }, "touch")).toBe(
      "Tap to choose a file",
    );
  });

  it("uses drag labels on desktop", () => {
    expect(
      getFileUploadEmptyLabel({ allowedFilePresets: ["images"] }, "desktop"),
    ).toBe("Click or drag a photo here");
    expect(
      getFileUploadEmptyLabel({ allowedFilePresets: ["pdf"] }, "desktop"),
    ).toBe("Click or drag a PDF here");
  });
});

describe("getFileUploadEmptyLabelForQuestion", () => {
  it("delegates to question config", () => {
    const q = question("file", { allowedFilePresets: ["images"] });
    expect(getFileUploadEmptyLabelForQuestion(q, "touch")).toBe(
      "Tap to choose a photo",
    );
  });
});
