import { beforeEach, describe, expect, it } from "vitest";

import { VALID_FILE_ANSWER } from "@/lib/__tests__/fixtures/file-answers";
import {
  optionalQuestion,
  question,
  resetQuestionIds,
  validAnswerFor,
} from "@/lib/__tests__/fixtures/questions";
import {
  expectSchemaError,
  expectSchemaOptionalOmit,
  expectSchemaSuccess,
} from "@/lib/__tests__/helpers/assert-schema-error";
import {
  buildSubmissionSchema,
  defaultAnswerForQuestion,
  formatDateAnswer,
  normalizeAnswersForQuestions,
  parseDateAnswer,
  sanitizeSubmissionBody,
} from "@/lib/validation";

beforeEach(() => {
  resetQuestionIds();
});

describe("parseDateAnswer", () => {
  it("returns undefined for null, empty, and invalid strings", () => {
    expect(parseDateAnswer(null)).toBeUndefined();
    expect(parseDateAnswer("")).toBeUndefined();
    expect(parseDateAnswer("not-a-date")).toBeUndefined();
  });

  it("parses yyyy-MM-dd strings", () => {
    const date = parseDateAnswer("2026-08-10");
    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2026);
  });

  it("parses ISO strings", () => {
    expect(parseDateAnswer("2026-08-10T12:00:00.000Z")).toBeInstanceOf(Date);
  });

  it("returns undefined for invalid Date objects", () => {
    expect(parseDateAnswer(new Date("invalid"))).toBeUndefined();
  });
});

describe("formatDateAnswer", () => {
  it("normalizes to yyyy-MM-dd", () => {
    expect(formatDateAnswer("2026-08-10")).toBe("2026-08-10");
    expect(formatDateAnswer(new Date("2026-08-10"))).toBe("2026-08-10");
  });

  it("returns undefined for invalid values", () => {
    expect(formatDateAnswer("")).toBeUndefined();
    expect(formatDateAnswer(null)).toBeUndefined();
  });
});

describe("defaultAnswerForQuestion", () => {
  const types = [
    ["text", ""],
    ["switch", undefined],
    ["multi_select", []],
    ["matrix", {}],
    ["file", null],
    ["number", undefined],
    ["rating", undefined],
    ["nps", undefined],
  ] as const;

  it.each(types)("type %s defaults correctly", (type, expected) => {
    expect(defaultAnswerForQuestion(question(type))).toEqual(expected);
  });

  it("ranking required defaults to all option values", () => {
    const q = question("ranking");
    expect(defaultAnswerForQuestion(q)).toEqual(["alpha", "beta"]);
  });

  it("ranking optional defaults to empty array", () => {
    expect(defaultAnswerForQuestion(optionalQuestion("ranking"))).toEqual([]);
  });
});

describe("sanitizeSubmissionBody", () => {
  it("removes empty values and normalizes dates", () => {
    const qText = question("text");
    const qDate = question("date", { id: "date-1" });
    const result = sanitizeSubmissionBody(
      [qText, qDate],
      {
        [qText.id]: "",
        [qDate.id]: "2026-08-10T00:00:00.000Z",
        unknown: "keep",
      },
    );
    expect(result).not.toHaveProperty(qText.id);
    expect(result[qDate.id]).toBe("2026-08-10");
    expect(result.unknown).toBe("keep");
  });

  it("removes empty arrays and objects", () => {
    const qMulti = question("multi_select");
    const qMatrix = question("matrix");
    const result = sanitizeSubmissionBody([qMulti, qMatrix], {
      [qMulti.id]: [],
      [qMatrix.id]: {},
    });
    expect(result).toEqual({});
  });
});

describe("normalizeAnswersForQuestions", () => {
  it("formats date answers and drops invalid dates", () => {
    const q = question("date");
    const result = normalizeAnswersForQuestions([q], {
      [q.id]: "2026-08-10T00:00:00.000Z",
      other: "bad-date",
    });
    expect(result[q.id]).toBe("2026-08-10");
    expect(result.other).toBe("bad-date");
  });
});

describe("buildSubmissionSchema — text", () => {
  it("required empty fails with message", () => {
    const q = question("text");
    expectSchemaError([q], { [q.id]: "" }, q.id, "This field is required");
  });

  it("required valid passes", () => {
    const q = question("text");
    expectSchemaSuccess([q], { [q.id]: "hello" });
  });

  it("optional empty omits field", () => {
    const q = optionalQuestion("text");
    expectSchemaOptionalOmit([q], { [q.id]: "" }, q.id);
  });
});

describe("buildSubmissionSchema — email", () => {
  it("required empty fails", () => {
    const q = question("email");
    expectSchemaError([q], { [q.id]: "" }, q.id, "Enter a valid email");
  });

  it("invalid email fails", () => {
    const q = question("email");
    expectSchemaError([q], { [q.id]: "not-email" }, q.id, "Enter a valid email");
  });

  it("valid email passes", () => {
    const q = question("email");
    expectSchemaSuccess([q], { [q.id]: "qa@test.com" });
  });

  it("optional empty omits", () => {
    const q = optionalQuestion("email");
    expectSchemaOptionalOmit([q], {}, q.id);
  });
});

describe("buildSubmissionSchema — phone", () => {
  it("required empty fails", () => {
    const q = question("phone");
    expectSchemaError([q], { [q.id]: "" }, q.id, "Enter a valid phone number");
  });

  it("invalid phone fails", () => {
    const q = question("phone");
    expectSchemaError([q], { [q.id]: "123" }, q.id, "Enter a valid phone number");
  });

  it("valid E.164 passes", () => {
    const q = question("phone");
    expectSchemaSuccess([q], { [q.id]: "+13125551234" });
  });
});

describe("buildSubmissionSchema — number", () => {
  it("required empty fails", () => {
    const q = question("number");
    expectSchemaError([q], { [q.id]: "" }, q.id, "This field is required");
  });

  it("coerces string numbers", () => {
    const q = question("number");
    expectSchemaSuccess([q], { [q.id]: "42" });
  });

  it("invalid number fails", () => {
    const q = question("number");
    const result = buildSubmissionSchema([q]).safeParse({ [q.id]: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("buildSubmissionSchema — url", () => {
  it("required empty fails", () => {
    const q = question("url");
    expectSchemaError([q], { [q.id]: "" }, q.id, "Enter a valid URL");
  });

  it("invalid url fails", () => {
    const q = question("url");
    expectSchemaError([q], { [q.id]: "not-a-url" }, q.id, "Enter a valid URL");
  });

  it("valid url passes", () => {
    const q = question("url");
    expectSchemaSuccess([q], { [q.id]: "https://example.com" });
  });
});

describe("buildSubmissionSchema — textarea", () => {
  it("required empty fails", () => {
    const q = question("textarea");
    expectSchemaError([q], { [q.id]: "" }, q.id, "This field is required");
  });

  it("multiline passes", () => {
    const q = question("textarea");
    expectSchemaSuccess([q], { [q.id]: "line1\nline2" });
  });
});

describe("buildSubmissionSchema — single_select", () => {
  it("required empty fails", () => {
    const q = question("single_select");
    expectSchemaError([q], { [q.id]: "" }, q.id, "Select a valid option");
  });

  it("unknown option fails", () => {
    const q = question("single_select");
    expectSchemaError([q], { [q.id]: "nope" }, q.id, "Select a valid option");
  });

  it("valid option passes", () => {
    const q = question("single_select");
    expectSchemaSuccess([q], { [q.id]: "alpha" });
  });
});

describe("buildSubmissionSchema — multi_select", () => {
  it("required empty fails", () => {
    const q = question("multi_select");
    expectSchemaError(
      [q],
      { [q.id]: [] },
      q.id,
      "Select at least one option",
    );
  });

  it("invalid option fails", () => {
    const q = question("multi_select");
    expectSchemaError([q], { [q.id]: ["nope"] }, q.id, "Select valid options");
  });

  it("valid selection passes", () => {
    const q = question("multi_select");
    expectSchemaSuccess([q], { [q.id]: ["alpha"] });
  });
});

describe("buildSubmissionSchema — rating", () => {
  it("required empty fails without raw Zod errors", () => {
    const q = question("rating");
    expectSchemaError([q], { [q.id]: undefined }, q.id, "This field is required");
  });

  it("valid rating passes", () => {
    const q = question("rating");
    expectSchemaSuccess([q], { [q.id]: 4 });
  });

  it("out of range fails", () => {
    const q = question("rating", { maxRating: 5 });
    const result = buildSubmissionSchema([q]).safeParse({ [q.id]: 0 });
    expect(result.success).toBe(false);
  });

  it("optional empty omits", () => {
    const q = optionalQuestion("rating");
    expectSchemaOptionalOmit([q], {}, q.id);
  });
});

describe("buildSubmissionSchema — nps", () => {
  it("required empty fails", () => {
    const q = question("nps");
    expectSchemaError([q], { [q.id]: undefined }, q.id, "This field is required");
  });

  it("valid score passes", () => {
    const q = question("nps");
    expectSchemaSuccess([q], { [q.id]: 8 });
  });

  it("score above 10 fails", () => {
    const q = question("nps");
    const result = buildSubmissionSchema([q]).safeParse({ [q.id]: 11 });
    expect(result.success).toBe(false);
  });
});

describe("buildSubmissionSchema — ranking", () => {
  it("required partial fails", () => {
    const q = question("ranking");
    expectSchemaError([q], { [q.id]: ["alpha"] }, q.id, "Rank all options");
  });

  it("full ranking passes", () => {
    const q = question("ranking");
    expectSchemaSuccess([q], { [q.id]: ["alpha", "beta"] });
  });

  it("optional empty omits", () => {
    const q = optionalQuestion("ranking");
    expectSchemaOptionalOmit([q], { [q.id]: [] }, q.id);
  });
});

describe("buildSubmissionSchema — matrix", () => {
  it("required empty fails", () => {
    const q = question("matrix");
    expectSchemaError([q], { [q.id]: {} }, q.id, "Answer all rows");
  });

  it("required partial fails", () => {
    const q = question("matrix");
    expectSchemaError(
      [q],
      { [q.id]: { "Row A": "Col 1" } },
      q.id,
      "Answer all rows",
    );
  });

  it("complete matrix passes", () => {
    const q = question("matrix");
    expectSchemaSuccess([q], {
      [q.id]: { "Row A": "Col 1", "Row B": "Col 2" },
    });
  });

  it("optional empty omits", () => {
    const q = optionalQuestion("matrix");
    expectSchemaOptionalOmit([q], { [q.id]: {} }, q.id);
  });

  it("optional partial omits", () => {
    const q = optionalQuestion("matrix");
    expectSchemaOptionalOmit([q], { [q.id]: { "Row A": "Col 1" } }, q.id);
  });
});

describe("buildSubmissionSchema — date", () => {
  it("required empty fails", () => {
    const q = question("date");
    expectSchemaError([q], { [q.id]: "" }, q.id, "Enter a valid date");
  });

  it("invalid date fails", () => {
    const q = question("date");
    expectSchemaError([q], { [q.id]: "not-a-date" }, q.id, "Enter a valid date");
  });

  it("valid date passes", () => {
    const q = question("date");
    expectSchemaSuccess([q], { [q.id]: "2026-08-10" });
  });
});

describe("buildSubmissionSchema — file", () => {
  it("required null fails with human message", () => {
    const q = question("file");
    expectSchemaError([q], { [q.id]: null }, q.id, "Upload a file to continue");
  });

  it("valid file reference passes", () => {
    const q = question("file");
    expectSchemaSuccess([q], { [q.id]: VALID_FILE_ANSWER });
  });

  it("optional empty omits", () => {
    const q = optionalQuestion("file");
    expectSchemaOptionalOmit([q], { [q.id]: null }, q.id);
  });
});

describe("buildSubmissionSchema — signature", () => {
  it("required empty fails", () => {
    const q = question("signature");
    expectSchemaError([q], { [q.id]: "" }, q.id, "This field is required");
  });

  it("valid signature passes", () => {
    const q = question("signature");
    expectSchemaSuccess([q], { [q.id]: "QA Tester" });
  });
});

describe("buildSubmissionSchema — switch", () => {
  it("required undefined fails with human message", () => {
    const q = question("switch");
    expectSchemaError([q], { [q.id]: undefined }, q.id, "This field is required");
  });

  it("true and false pass", () => {
    const q = question("switch");
    expectSchemaSuccess([q], { [q.id]: true });
    expectSchemaSuccess([q], { [q.id]: false });
  });

  it("optional empty omits", () => {
    const q = optionalQuestion("switch");
    expectSchemaOptionalOmit([q], {}, q.id);
  });
});

describe("buildSubmissionSchema — cross-field", () => {
  it("only reports failing field", () => {
    const q1 = question("text");
    const q2 = question("email");
    const result = buildSubmissionSchema([q1, q2]).safeParse({
      [q1.id]: "ok",
      [q2.id]: "bad",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues).toHaveLength(1);
    expect(result.error.issues[0]?.path[0]).toBe(q2.id);
  });

  it("all types valid together", () => {
    const types = [
      "text",
      "email",
      "phone",
      "number",
      "url",
      "textarea",
      "single_select",
      "multi_select",
      "rating",
      "nps",
      "ranking",
      "matrix",
      "date",
      "file",
      "signature",
      "switch",
    ] as const;
    const questions = types.map((type) => question(type));
    const data = Object.fromEntries(
      questions.map((q) => [q.id, validAnswerFor(q, VALID_FILE_ANSWER)]),
    );
    expectSchemaSuccess(questions, data);
  });
});
