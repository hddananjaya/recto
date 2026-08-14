import { describe, expect, it } from "vitest";

import {
  buildSubmissionsUrl,
  getSelectedResponseId,
  RESPONSE_QUERY_PARAM,
} from "./submissions-url";

describe("buildSubmissionsUrl", () => {
  it("builds the base submissions path", () => {
    expect(buildSubmissionsUrl("abc123")).toBe("/forms/abc123/submissions");
  });

  it("adds page and response query params", () => {
    expect(
      buildSubmissionsUrl("abc123", { page: 3, responseId: "sub-9" }),
    ).toBe("/forms/abc123/submissions?page=3&response=sub-9");
  });

  it("omits page 1 from the query string", () => {
    expect(buildSubmissionsUrl("abc123", { page: 1, responseId: "sub-1" })).toBe(
      "/forms/abc123/submissions?response=sub-1",
    );
  });
});

describe("getSelectedResponseId", () => {
  it("reads the response query param", () => {
    const params = new URLSearchParams(`${RESPONSE_QUERY_PARAM}=sub-42`);
    expect(getSelectedResponseId(params)).toBe("sub-42");
  });

  it("returns undefined when the response param is missing", () => {
    expect(getSelectedResponseId(new URLSearchParams())).toBeUndefined();
  });
});
