import { beforeEach, describe, expect, it } from "vitest";

import { question, resetQuestionIds } from "@/lib/__tests__/fixtures/questions";
import {
  applyQuestionDrafts,
  formatEditorValidationIssues,
  validateFormEditor,
} from "@/lib/editor-validation";

beforeEach(() => {
  resetQuestionIds();
});

describe("validateFormEditor — save mode", () => {
  it("does not require form title or questions", () => {
    const issues = validateFormEditor({ title: "", questions: [] }, "save");
    expect(issues.find((i) => i.field === "title" && !i.questionId)).toBeUndefined();
    expect(issues.find((i) => i.field === "questions")).toBeUndefined();
  });

  it("requires question title", () => {
    const q = question("text", { title: "  " });
    const issues = validateFormEditor({ title: "Form", questions: [q] }, "save");
    expect(issues).toContainEqual(
      expect.objectContaining({
        questionId: q.id,
        field: "title",
        message: "Add a question title",
      }),
    );
  });
});

describe("validateFormEditor — publish mode", () => {
  it("requires form title", () => {
    const issues = validateFormEditor({ title: "", questions: [question("text")] }, "publish");
    expect(issues).toContainEqual(
      expect.objectContaining({
        field: "title",
        message: "Add a form title before publishing",
      }),
    );
  });

  it("rejects the default placeholder title", () => {
    const issues = validateFormEditor(
      { title: "Untitled form", questions: [question("text")] },
      "publish",
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        field: "title",
        message: "Add a form title before publishing",
      }),
    );
  });

  it("requires at least one question", () => {
    const issues = validateFormEditor({ title: "Form", questions: [] }, "publish");
    expect(issues).toContainEqual(
      expect.objectContaining({
        field: "questions",
        message: "Add at least one question before publishing",
      }),
    );
  });
});

describe("validateFormEditor — select options", () => {
  it("single_select needs at least one option", () => {
    const q = question("single_select", { options: [] });
    const issues = validateFormEditor({ title: "F", questions: [q] }, "save");
    expect(issues).toContainEqual(
      expect.objectContaining({ field: "options", message: "Add at least one option" }),
    );
  });

  it("ranking needs at least two options", () => {
    const q = question("ranking", {
      options: [{ label: "Only", value: "only" }],
    });
    const issues = validateFormEditor({ title: "F", questions: [q] }, "save");
    expect(issues).toContainEqual(
      expect.objectContaining({
        field: "options",
        message: "Add at least 2 options to rank",
      }),
    );
  });

  it("reports duplicate option values", () => {
    const q = question("single_select", {
      options: [
        { label: "A", value: "same" },
        { label: "B", value: "same" },
      ],
    });
    const issues = validateFormEditor({ title: "F", questions: [q] }, "save");
    expect(issues.some((i) => i.message.includes("duplicate values: same"))).toBe(
      true,
    );
  });
});

describe("validateFormEditor — matrix", () => {
  it("requires rows and columns", () => {
    const q = question("matrix", { rows: [], columns: [] });
    const issues = validateFormEditor({ title: "F", questions: [q] }, "save");
    expect(issues).toContainEqual(
      expect.objectContaining({ field: "rows", message: "Add at least one matrix row" }),
    );
    expect(issues).toContainEqual(
      expect.objectContaining({
        field: "columns",
        message: "Add at least one matrix column",
      }),
    );
  });

  it("rejects duplicate rows and columns", () => {
    const q = question("matrix", {
      rows: ["Row A", "row a"],
      columns: ["Col 1", "col 1"],
    });
    const issues = validateFormEditor({ title: "F", questions: [q] }, "save");
    expect(issues.some((i) => i.message === "Matrix rows must be unique")).toBe(true);
    expect(issues.some((i) => i.message === "Matrix columns must be unique")).toBe(
      true,
    );
  });
});

describe("validateFormEditor — rating", () => {
  it("rejects invalid maxRating", () => {
    const q = question("rating", { maxRating: 11 });
    const issues = validateFormEditor({ title: "F", questions: [q] }, "save");
    expect(issues).toContainEqual(
      expect.objectContaining({
        field: "maxRating",
        message: "Max rating must be a whole number from 1 to 10",
      }),
    );
  });
});

describe("validateFormEditor — file", () => {
  it("accepts empty presets because defaults are applied at runtime", () => {
    const q = question("file", {
      allowedFilePresets: [],
      customFileTypes: "",
    });
    const issues = validateFormEditor({ title: "F", questions: [q] }, "save");
    expect(
      issues.some((i) => i.field === "allowedFilePresets"),
    ).toBe(false);
  });

  it("reports invalid custom tokens", () => {
    const q = question("file", { customFileTypes: "bad token!" });
    const issues = validateFormEditor({ title: "F", questions: [q] }, "save");
    expect(issues.some((i) => i.message.includes("Invalid custom file type"))).toBe(
      true,
    );
  });
});

describe("applyQuestionDrafts", () => {
  it("parses option labels into slugs", () => {
    const q = question("single_select");
    const [updated] = applyQuestionDrafts([q], { [q.id]: "A\nB\nC" });
    expect(updated.options).toEqual([
      { label: "A", value: "a" },
      { label: "B", value: "b" },
      { label: "C", value: "c" },
    ]);
  });

  it("parses matrix draft rows and columns", () => {
    const q = question("matrix");
    const [updated] = applyQuestionDrafts(
      [q],
      {},
      { [q.id]: { rows: "R1\nR2", columns: "C1\nC2" } },
    );
    expect(updated.rows).toEqual(["R1", "R2"]);
    expect(updated.columns).toEqual(["C1", "C2"]);
  });

  it("leaves unrelated questions unchanged", () => {
    const q1 = question("text");
    const q2 = question("email");
    const result = applyQuestionDrafts([q1, q2], { [q1.id]: "Opt\nTwo" });
    expect(result[1]).toEqual(q2);
  });
});

describe("formatEditorValidationIssues", () => {
  it("joins messages with newlines", () => {
    const text = formatEditorValidationIssues([
      { field: "title", message: "First" },
      { field: "questions", message: "Second" },
    ]);
    expect(text).toBe("First\nSecond");
  });
});
