import { describe, expect, it } from "vitest";

import { isFormWorkspaceRoute } from "./app-routes";

describe("isFormWorkspaceRoute", () => {
  it("matches form editor and responses routes", () => {
    expect(isFormWorkspaceRoute("/forms/abc123")).toBe(true);
    expect(isFormWorkspaceRoute("/forms/abc123/submissions")).toBe(true);
    expect(isFormWorkspaceRoute("/forms/abc123/submissions/sub-1")).toBe(true);
  });

  it("does not match new form or other app routes", () => {
    expect(isFormWorkspaceRoute("/forms/new")).toBe(false);
    expect(isFormWorkspaceRoute("/dashboard")).toBe(false);
  });
});
