import { describe, expect, it } from "vitest";

import { formThemes, getFormTheme } from "@/lib/form-themes";

describe("getFormTheme", () => {
  it("returns known theme", () => {
    expect(getFormTheme("image-1")?.label).toBe("Ocean");
  });

  it("returns undefined for unknown id", () => {
    expect(getFormTheme("missing")).toBeUndefined();
  });
});

describe("formThemes", () => {
  it("has unique ids", () => {
    const ids = formThemes.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
