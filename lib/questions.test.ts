import { describe, expect, it } from "vitest";

import { mapQuestion } from "@/lib/questions";

describe("mapQuestion", () => {
  it("maps prisma question to app question", () => {
    const mapped = mapQuestion({
      id: "q1",
      formId: "f1",
      type: "text",
      title: "Name",
      description: null,
      required: true,
      position: 0,
      config: { placeholder: "Your name" },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(mapped).toMatchObject({
      id: "q1",
      type: "text",
      title: "Name",
      required: true,
      placeholder: "Your name",
    });
  });

  it("normalizes file upload config defaults", () => {
    const mapped = mapQuestion({
      id: "q2",
      formId: "f1",
      type: "file",
      title: "Resume",
      description: null,
      required: false,
      position: 1,
      config: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(mapped.allowedFilePresets).toEqual(["images", "pdf"]);
    expect(mapped.customFileTypes).toBe("");
  });
});
