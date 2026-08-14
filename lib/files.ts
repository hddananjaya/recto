import { z } from "zod";

import { ALLOWED_UPLOAD_MIME_TYPES } from "@/lib/storage/config";
import {
  getFileUploadConfig,
  normalizeFileUploadConfig,
  resolveUploadMimeTypeForConfig,
} from "@/lib/file-upload-presets";
import type { FileAnswerReference, Question } from "@/lib/types";

export const fileAnswerSchema = z.object({
  fileId: z.string().min(1),
  name: z.string().min(1),
  size: z.coerce.number().int().positive(),
  mimeType: z.string().min(1),
});

export function parseFileAnswerReference(
  value: unknown,
): FileAnswerReference | null {
  const parsed = fileAnswerSchema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.fileId !== "string" || typeof record.name !== "string") {
    return null;
  }

  const size = Number(record.size);
  const mimeType =
    typeof record.mimeType === "string" && record.mimeType.trim()
      ? record.mimeType
      : "application/octet-stream";

  if (!record.fileId || !record.name || !Number.isFinite(size) || size <= 0) {
    return null;
  }

  return {
    fileId: record.fileId,
    name: record.name,
    size: Math.trunc(size),
    mimeType,
  };
}

export function isFileAnswerReference(
  value: unknown,
): value is FileAnswerReference {
  return parseFileAnswerReference(value) !== null;
}

function getFileExtension(fileName?: string): string | null {
  const ext = fileName?.match(/\.([^.]+)$/)?.[1]?.toLowerCase();
  return ext || null;
}

export type FileTypeKind =
  | "pdf"
  | "image"
  | "csv"
  | "video"
  | "audio"
  | "text"
  | "json"
  | "zip"
  | "word"
  | "spreadsheet"
  | "other";

export function getFileTypeKind(
  mimeType: string,
  fileName?: string,
): FileTypeKind {
  const mime = mimeType.toLowerCase();
  const ext = getFileExtension(fileName);

  if (mime === "application/pdf" || ext === "pdf") return "pdf";

  if (
    mime.startsWith("image/") ||
    (ext &&
      ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico", "heic"].includes(
        ext,
      ))
  ) {
    return "image";
  }

  if (
    mime === "text/csv" ||
    mime === "application/csv" ||
    ext === "csv"
  ) {
    return "csv";
  }

  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";

  if (
    mime.startsWith("text/") ||
    ext === "txt" ||
    ext === "md" ||
    ext === "markdown"
  ) {
    return "text";
  }

  if (ext === "json") return "json";
  if (ext === "zip") return "zip";
  if (ext === "doc" || ext === "docx") return "word";
  if (ext === "xls" || ext === "xlsx") return "spreadsheet";

  return "other";
}

export function getFileTypeTableLabel(
  mimeType: string,
  fileName?: string,
): string {
  const kind = getFileTypeKind(mimeType, fileName);
  const ext = getFileExtension(fileName);

  switch (kind) {
    case "pdf":
      return "PDF";
    case "image":
      return "Image";
    case "csv":
      return "CSV";
    case "video":
      return "Video";
    case "audio":
      return "Audio";
    case "text":
      return "Text";
    case "json":
      return "JSON";
    case "zip":
      return "ZIP file";
    case "word":
      return "Word doc";
    case "spreadsheet":
      return "Spreadsheet";
    case "other":
      if (ext) return `${ext.toUpperCase()} file`;
      return "Other file";
  }
}

export function getFileTypeDetailLabel(
  mimeType: string,
  fileName?: string,
): string {
  const mime = mimeType.toLowerCase();

  if (mime === "application/pdf") return "PDF document";

  if (mime.startsWith("image/")) {
    return "Image";
  }

  if (mime.startsWith("video/")) return "Video file";
  if (mime.startsWith("audio/")) return "Audio file";
  if (mime.startsWith("text/")) {
    const subtype = mime.split("/")[1];
    if (subtype) return `${subtype.toUpperCase()} file`;
    return "Text file";
  }

  if (mime === "application/octet-stream" && fileName) {
    const ext = fileName.match(/(\.[^.]+)$/)?.[1]?.slice(1).toUpperCase();
    if (ext) return `${ext} file`;
  }

  return "File";
}

export function formatFileAnswerSummary(
  value: FileAnswerReference,
  options?: { includeFileName?: boolean },
): string {
  const label = getFileTypeDetailLabel(value.mimeType, value.name);
  if (options?.includeFileName === false) {
    return getFileTypeTableLabel(value.mimeType, value.name);
  }
  return `${label} · ${value.name}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatAnswerForDisplay(
  question: Question,
  value: unknown,
): string {
  if (value === undefined || value === null || value === "") return "—";

  const fileAnswer = parseFileAnswerReference(value);
  if (fileAnswer && (question.type === "file" || fileAnswer.fileId)) {
    return formatFileAnswerSummary(fileAnswer, { includeFileName: false });
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function formatAnswerForSheet(
  question: Question,
  value: unknown,
  appBaseUrl: string,
): string {
  if (value === undefined || value === null || value === "") return "";

  const fileAnswer = parseFileAnswerReference(value);
  if (fileAnswer && (question.type === "file" || fileAnswer.fileId)) {
    return `${formatFileAnswerSummary(fileAnswer)} (${appBaseUrl}/api/files/${fileAnswer.fileId})`;
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
}

export function sanitizeUploadFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "upload";
  return base.replace(/[^\w.\-()+\s]/g, "_").slice(0, 200) || "upload";
}

export function resolveUploadMimeType(
  fileName: string,
  mimeType?: string | null,
  fileConfig?: Pick<Question, "allowedFilePresets" | "customFileTypes">,
): string | null {
  if (fileConfig) {
    return resolveUploadMimeTypeForConfig(
      fileName,
      mimeType,
      getFileUploadConfig(fileConfig),
    );
  }

  const type = mimeType?.toLowerCase();
  if (type && ALLOWED_UPLOAD_MIME_TYPES.has(type)) {
    return type;
  }

  const name = fileName.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  return null;
}

// Re-export for client-safe constants
export { ALLOWED_UPLOAD_MIME_TYPES, MAX_UPLOAD_BYTES } from "@/lib/storage/config";
