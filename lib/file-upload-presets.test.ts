import { describe, expect, it } from "vitest";

import {
  getFileUploadAcceptValue,
  getFileUploadHint,
  getFileUploadTypeError,
  getInvalidCustomFileTypeTokens,
  isFileUploadConfigValid,
  isFileUploadPresetId,
  normalizeFileUploadConfig,
  parseCustomFileTypes,
  resolveAllowedMimeTypes,
  resolveUploadMimeTypeForConfig,
  toggleFileUploadPreset,
} from "@/lib/file-upload-presets";

describe("normalizeFileUploadConfig", () => {
  it("defaults to images and pdf when empty", () => {
    const config = normalizeFileUploadConfig(undefined);
    expect(config.allowedFilePresets).toEqual(["images", "pdf"]);
    expect(config.allowsAny).toBe(false);
  });

  it("sets allowsAny when any preset selected", () => {
    const config = normalizeFileUploadConfig({ allowedFilePresets: ["any"] });
    expect(config.allowsAny).toBe(true);
  });

  it("filters invalid preset ids", () => {
    const config = normalizeFileUploadConfig({
      allowedFilePresets: ["images", "invalid" as "images"],
    });
    expect(config.allowedFilePresets).toEqual(["images"]);
  });

  it("keeps custom-only config", () => {
    const config = normalizeFileUploadConfig({
      allowedFilePresets: [],
      customFileTypes: ".png",
    });
    expect(config.customFileTypes).toBe(".png");
    expect(config.allowsAny).toBe(false);
  });
});

describe("isFileUploadPresetId", () => {
  it("recognizes valid presets", () => {
    expect(isFileUploadPresetId("images")).toBe(true);
    expect(isFileUploadPresetId("pdf")).toBe(true);
    expect(isFileUploadPresetId("any")).toBe(true);
    expect(isFileUploadPresetId("exe")).toBe(false);
  });
});

describe("parseCustomFileTypes", () => {
  it("parses extensions and mime types", () => {
    const parsed = parseCustomFileTypes(".png, image/jpeg; pdf");
    expect(parsed.extensions.has(".png")).toBe(true);
    expect(parsed.extensions.has(".pdf")).toBe(true);
    expect(parsed.mimeTypes.has("image/jpeg")).toBe(true);
  });

  it("treats bare tokens as extensions", () => {
    const parsed = parseCustomFileTypes("csv");
    expect(parsed.extensions.has(".csv")).toBe(true);
  });
});

describe("getInvalidCustomFileTypeTokens", () => {
  it("returns empty for valid tokens", () => {
    expect(getInvalidCustomFileTypeTokens(".png, image/png")).toEqual([]);
  });

  it("flags invalid tokens", () => {
    expect(getInvalidCustomFileTypeTokens("bad token!")).toContain("bad token!");
  });
});

describe("isFileUploadConfigValid", () => {
  it("valid for any preset", () => {
    expect(isFileUploadConfigValid({ allowedFilePresets: ["any"] })).toBe(true);
  });

  it("valid for images preset", () => {
    expect(isFileUploadConfigValid({ allowedFilePresets: ["images"] })).toBe(true);
  });

  it("applies defaults when nothing selected", () => {
    expect(
      isFileUploadConfigValid({ allowedFilePresets: [], customFileTypes: "" }),
    ).toBe(true);
  });
});

describe("resolveAllowedMimeTypes", () => {
  it("returns image mime types for images preset", () => {
    const allowed = resolveAllowedMimeTypes({ allowedFilePresets: ["images"] });
    expect(allowed?.has("image/png")).toBe(true);
  });

  it("returns null for any", () => {
    expect(resolveAllowedMimeTypes({ allowedFilePresets: ["any"] })).toBeNull();
  });
});

describe("resolveUploadMimeTypeForConfig", () => {
  it("allows png for images preset", () => {
    expect(
      resolveUploadMimeTypeForConfig("photo.png", "image/png", {
        allowedFilePresets: ["images"],
      }),
    ).toBe("image/png");
  });

  it("falls back for blocked executable mime with unknown extension", () => {
    expect(
      resolveUploadMimeTypeForConfig("malware.exe", "application/x-msdownload", {
        allowedFilePresets: ["any"],
      }),
    ).toBe("application/octet-stream");
  });

  it("resolves by extension when mime missing", () => {
    expect(
      resolveUploadMimeTypeForConfig("doc.pdf", null, {
        allowedFilePresets: ["pdf"],
      }),
    ).toBe("application/pdf");
  });

  it("requires presets when resolving custom-only extensions", () => {
    expect(
      resolveUploadMimeTypeForConfig("data.csv", null, {
        allowedFilePresets: [],
        customFileTypes: ".csv",
      }),
    ).toBeNull();
  });

  it("honors custom extension with a preset selected", () => {
    expect(
      resolveUploadMimeTypeForConfig("data.csv", null, {
        allowedFilePresets: ["images"],
        customFileTypes: ".csv",
      }),
    ).toBe("application/octet-stream");
  });
});

describe("getFileUploadAcceptValue", () => {
  it("includes preset extensions and mime types", () => {
    const accept = getFileUploadAcceptValue({ allowedFilePresets: ["images"] });
    expect(accept).toContain(".png");
    expect(accept).toContain("image/png");
  });

  it("returns empty string for any", () => {
    expect(getFileUploadAcceptValue({ allowedFilePresets: ["any"] })).toBe("");
  });
});

describe("getFileUploadHint", () => {
  it("describes any file type", () => {
    expect(getFileUploadHint({ allowedFilePresets: ["any"] }, 10)).toContain(
      "Any file type",
    );
  });

  it("lists preset labels", () => {
    const hint = getFileUploadHint({ allowedFilePresets: ["images", "pdf"] }, 5);
    expect(hint).toContain("Images");
    expect(hint).toContain("PDF");
  });
});

describe("getFileUploadTypeError", () => {
  it("describes allowed types for images", () => {
    const msg = getFileUploadTypeError({ allowedFilePresets: ["images"] });
    expect(msg).toContain("PNG");
  });
});

describe("toggleFileUploadPreset", () => {
  it("adds and removes presets without duplicates", () => {
    expect(toggleFileUploadPreset([], "pdf", true)).toEqual(["pdf"]);
    expect(toggleFileUploadPreset(["pdf"], "pdf", true)).toEqual(["pdf"]);
    expect(toggleFileUploadPreset(["pdf", "images"], "pdf", false)).toEqual([
      "images",
    ]);
  });
});
