import { describe, expect, it } from "vitest";

import {
  parseSubmissionPage,
  submissionPageFromRank,
  submissionPageRange,
  SUBMISSIONS_PAGE_SIZE,
} from "./submissions-pagination";

describe("parseSubmissionPage", () => {
  it("defaults invalid values to page 1", () => {
    expect(parseSubmissionPage(null)).toBe(1);
    expect(parseSubmissionPage("0")).toBe(1);
    expect(parseSubmissionPage("abc")).toBe(1);
  });

  it("parses positive integers", () => {
    expect(parseSubmissionPage("3")).toBe(3);
  });
});

describe("submissionPageFromRank", () => {
  it("maps zero-based ranks to pages", () => {
    expect(submissionPageFromRank(0, SUBMISSIONS_PAGE_SIZE)).toBe(1);
    expect(submissionPageFromRank(19, SUBMISSIONS_PAGE_SIZE)).toBe(1);
    expect(submissionPageFromRank(20, SUBMISSIONS_PAGE_SIZE)).toBe(2);
  });
});

describe("submissionPageRange", () => {
  it("returns the visible range for a page", () => {
    expect(submissionPageRange(2, 20, 45)).toEqual({ start: 21, end: 40 });
  });
});
