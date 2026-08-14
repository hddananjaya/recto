import { describe, expect, it } from "vitest";

import { submitErrorMessage } from "@/lib/submit-error-message";

describe("submitErrorMessage", () => {
  it("maps rate limit", () => {
    expect(submitErrorMessage(429)).toContain("Too many responses");
  });

  it("maps not found", () => {
    expect(submitErrorMessage(404)).toBe("This form is no longer available.");
  });

  it("maps validation failures", () => {
    expect(submitErrorMessage(400, { error: "Validation failed" })).toContain(
      "Some answers look invalid",
    );
  });

  it("returns api error for other 400s", () => {
    expect(submitErrorMessage(400, { error: "Custom error" })).toBe(
      "Custom error",
    );
  });

  it("maps server errors", () => {
    expect(submitErrorMessage(500)).toContain("server had a problem");
  });

  it("falls back to generic message", () => {
    expect(submitErrorMessage(418)).toContain("Something went wrong");
  });
});
