import { describe, expect, it } from "vitest";

import {
  generateFormId,
  publicFormPath,
  publicFormUrl,
} from "@/lib/form-id";

describe("generateFormId", () => {
  it("returns 6 lowercase alphanumeric characters", () => {
    const ids = Array.from({ length: 20 }, () => generateFormId());
    for (const id of ids) {
      expect(id).toHaveLength(6);
      expect(id).toMatch(/^[a-z0-9]{6}$/);
    }
    expect(new Set(ids).size).toBeGreaterThan(1);
  });
});

describe("publicFormPath", () => {
  it("builds public path", () => {
    expect(publicFormPath("abc123")).toBe("/f/abc123");
  });
});

describe("publicFormUrl", () => {
  it("joins origin and path", () => {
    expect(publicFormUrl("abc123", "http://localhost:3000")).toBe(
      "http://localhost:3000/f/abc123",
    );
  });
});
