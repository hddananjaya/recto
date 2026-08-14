import { beforeEach, describe, expect, it } from "vitest";

import { VALID_FILE_ANSWER } from "@/lib/__tests__/fixtures/file-answers";
import { question, resetQuestionIds } from "@/lib/__tests__/fixtures/questions";
import {
  fileAnswerSchema,
  formatAnswerForDisplay,
  formatAnswerForSheet,
  formatBytes,
  formatFileAnswerSummary,
  getFileTypeDetailLabel,
  getFileTypeKind,
  getFileTypeTableLabel,
  isFileAnswerReference,
  parseFileAnswerReference,
  resolveUploadMimeType,
  sanitizeUploadFilename,
} from "@/lib/files";

beforeEach(() => {
  resetQuestionIds();
});

describe("fileAnswerSchema", () => {
  it("accepts valid reference", () => {
    expect(fileAnswerSchema.safeParse(VALID_FILE_ANSWER).success).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(fileAnswerSchema.safeParse({ fileId: "" }).success).toBe(false);
  });
});

describe("parseFileAnswerReference", () => {
  it("parses strict schema input", () => {
    expect(parseFileAnswerReference(VALID_FILE_ANSWER)).toEqual(VALID_FILE_ANSWER);
  });

  it("defaults missing mimeType", () => {
    expect(
      parseFileAnswerReference({
        fileId: "f1",
        name: "x.bin",
        size: 10,
      }),
    ).toEqual({
      fileId: "f1",
      name: "x.bin",
      size: 10,
      mimeType: "application/octet-stream",
    });
  });

  it("rejects invalid size", () => {
    expect(
      parseFileAnswerReference({ fileId: "f1", name: "x", size: 0 }),
    ).toBeNull();
  });
});

describe("isFileAnswerReference", () => {
  it("narrows valid references", () => {
    expect(isFileAnswerReference(VALID_FILE_ANSWER)).toBe(true);
    expect(isFileAnswerReference(null)).toBe(false);
  });
});

describe("getFileTypeKind", () => {
  it("classifies by mime and extension", () => {
    expect(getFileTypeKind("application/pdf")).toBe("pdf");
    expect(getFileTypeKind("image/png")).toBe("image");
    expect(getFileTypeKind("application/octet-stream", "photo.jpg")).toBe("image");
    expect(getFileTypeKind("text/csv")).toBe("csv");
    expect(getFileTypeKind("video/mp4")).toBe("video");
    expect(getFileTypeKind("application/octet-stream", "unknown.xyz")).toBe("other");
  });
});

describe("getFileTypeTableLabel", () => {
  it("returns human labels", () => {
    expect(getFileTypeTableLabel("application/pdf")).toBe("PDF");
    expect(getFileTypeTableLabel("image/png")).toBe("Image");
    expect(getFileTypeTableLabel("application/octet-stream", "archive.zip")).toBe(
      "ZIP file",
    );
  });
});

describe("getFileTypeDetailLabel", () => {
  it("returns detail labels", () => {
    expect(getFileTypeDetailLabel("application/pdf")).toBe("PDF document");
    expect(getFileTypeDetailLabel("image/png")).toBe("Image");
  });
});

describe("formatBytes", () => {
  it("formats size units", () => {
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});

describe("formatFileAnswerSummary", () => {
  it("includes file name by default", () => {
    expect(formatFileAnswerSummary(VALID_FILE_ANSWER)).toContain("sample.png");
  });

  it("can omit file name", () => {
    expect(
      formatFileAnswerSummary(VALID_FILE_ANSWER, { includeFileName: false }),
    ).toBe("Image");
  });
});

describe("formatAnswerForDisplay", () => {
  it("renders empty as em dash", () => {
    expect(formatAnswerForDisplay(question("text"), "")).toBe("—");
  });

  it("renders arrays joined", () => {
    expect(formatAnswerForDisplay(question("multi_select"), ["a", "b"])).toBe(
      "a, b",
    );
  });

  it("renders file answers", () => {
    const q = question("file");
    expect(formatAnswerForDisplay(q, VALID_FILE_ANSWER)).toBe("Image");
  });

  it("renders objects as JSON", () => {
    expect(formatAnswerForDisplay(question("matrix"), { a: "b" })).toBe(
      '{"a":"b"}',
    );
  });
});

describe("formatAnswerForSheet", () => {
  it("returns empty string for missing values", () => {
    expect(formatAnswerForSheet(question("text"), "", "http://localhost:3000")).toBe(
      "",
    );
  });

  it("includes file download URL", () => {
    const q = question("file");
    const out = formatAnswerForSheet(q, VALID_FILE_ANSWER, "http://localhost:3000");
    expect(out).toContain("/api/files/file-abc123");
    expect(out).toContain("sample.png");
  });
});

describe("sanitizeUploadFilename", () => {
  it("strips paths and unsafe characters", () => {
    expect(sanitizeUploadFilename("../../evil name?.png")).toBe("evil name_.png");
  });

  it("truncates long names", () => {
    const long = `${"a".repeat(300)}.png`;
    expect(sanitizeUploadFilename(long).length).toBeLessThanOrEqual(200);
  });
});

describe("resolveUploadMimeType", () => {
  it("sniffs extension without config", () => {
    expect(resolveUploadMimeType("photo.png", null)).toBe("image/png");
    expect(resolveUploadMimeType("doc.pdf", null)).toBe("application/pdf");
  });

  it("uses file config when provided", () => {
    const q = question("file", { allowedFilePresets: ["images"] });
    expect(resolveUploadMimeType("photo.png", "image/png", q)).toBe("image/png");
  });
});
