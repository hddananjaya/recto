import type { Question } from "@/lib/types";

export type FileUploadPresetId = "images" | "pdf" | "any";

export interface FileUploadConfig {
  allowedFilePresets?: FileUploadPresetId[];
  customFileTypes?: string;
}

export interface FileUploadPreset {
  id: FileUploadPresetId;
  label: string;
  description: string;
}

export const FILE_UPLOAD_PRESETS: Record<
  FileUploadPresetId,
  FileUploadPreset
> = {
  images: {
    id: "images",
    label: "Images",
    description: "PNG, JPG, WEBP, GIF",
  },
  pdf: {
    id: "pdf",
    label: "PDF",
    description: "PDF documents",
  },
  any: {
    id: "any",
    label: "Any",
    description: "Any file type",
  },
};

export const FILE_UPLOAD_PRESET_LIST = Object.values(FILE_UPLOAD_PRESETS);

export const DEFAULT_FILE_UPLOAD_PRESETS: FileUploadPresetId[] = [
  "images",
  "pdf",
];

const PRESET_MIME_TYPES: Record<"images" | "pdf", readonly string[]> = {
  images: ["image/png", "image/jpeg", "image/webp", "image/gif"],
  pdf: ["application/pdf"],
};

const PRESET_EXTENSIONS: Record<"images" | "pdf", readonly string[]> = {
  images: [".png", ".jpg", ".jpeg", ".webp", ".gif"],
  pdf: [".pdf"],
};

const EXTENSION_TO_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const BLOCKED_MIME_TYPES = new Set([
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-executable",
  "application/vnd.microsoft.portable-executable",
]);

const MIME_TYPE_PATTERN = /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/i;

export function isFileUploadPresetId(value: unknown): value is FileUploadPresetId {
  return value === "images" || value === "pdf" || value === "any";
}

export function getFileUploadConfig(
  question: Pick<Question, "allowedFilePresets" | "customFileTypes">,
): FileUploadConfig {
  return {
    allowedFilePresets: question.allowedFilePresets,
    customFileTypes: question.customFileTypes,
  };
}

export function normalizeFileUploadConfig(
  config: FileUploadConfig | undefined,
): Required<FileUploadConfig> & { allowsAny: boolean } {
  const presets = Array.isArray(config?.allowedFilePresets)
    ? config.allowedFilePresets.filter(isFileUploadPresetId)
    : [];
  const customFileTypes = config?.customFileTypes?.trim() ?? "";
  const parsed = parseCustomFileTypes(customFileTypes);
  const allowsAny = presets.includes("any");
  const hasPresetTypes = presets.some((id) => id === "images" || id === "pdf");
  const hasCustom = parsed.mimeTypes.size > 0 || parsed.extensions.size > 0;

  if (!allowsAny && !hasPresetTypes && !hasCustom) {
    return {
      allowedFilePresets: [...DEFAULT_FILE_UPLOAD_PRESETS],
      customFileTypes,
      allowsAny: false,
    };
  }

  return {
    allowedFilePresets: presets,
    customFileTypes,
    allowsAny,
  };
}

export function parseCustomFileTypes(raw: string | undefined): {
  mimeTypes: Set<string>;
  extensions: Set<string>;
} {
  const mimeTypes = new Set<string>();
  const extensions = new Set<string>();

  if (!raw?.trim()) {
    return { mimeTypes, extensions };
  }

  for (const token of raw
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)) {
    if (token.startsWith(".")) {
      extensions.add(token.toLowerCase());
      continue;
    }

    if (token.includes("/")) {
      mimeTypes.add(token.toLowerCase());
      continue;
    }

    extensions.add(`.${token.toLowerCase()}`);
  }

  return { mimeTypes, extensions };
}

export function getInvalidCustomFileTypeTokens(
  raw: string | undefined,
): string[] {
  if (!raw?.trim()) return [];

  const invalid: string[] = [];

  for (const token of raw
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)) {
    if (token.startsWith(".")) {
      if (!/^\.[a-z0-9.-]+$/i.test(token)) invalid.push(token);
      continue;
    }

    if (token.includes("/")) {
      if (!MIME_TYPE_PATTERN.test(token)) invalid.push(token);
      continue;
    }

    if (!/^[a-z0-9.-]+$/i.test(token)) invalid.push(token);
  }

  return invalid;
}

export function isFileUploadConfigValid(config: FileUploadConfig): boolean {
  const normalized = normalizeFileUploadConfig(config);
  if (normalized.allowsAny) return true;

  const hasPresetTypes = normalized.allowedFilePresets.some(
    (id) => id === "images" || id === "pdf",
  );
  const custom = parseCustomFileTypes(normalized.customFileTypes);
  return (
    hasPresetTypes ||
    custom.mimeTypes.size > 0 ||
    custom.extensions.size > 0
  );
}

function getExtension(fileName: string): string | null {
  return fileName.toLowerCase().match(/(\.[^.]+)$/)?.[1] ?? null;
}

function isAllowedMimeType(mimeType: string): boolean {
  return (
    MIME_TYPE_PATTERN.test(mimeType) && !BLOCKED_MIME_TYPES.has(mimeType.toLowerCase())
  );
}

function resolvePresetMimeTypes(
  presets: FileUploadPresetId[],
): Set<string> {
  const allowed = new Set<string>();

  for (const presetId of presets) {
    if (presetId !== "images" && presetId !== "pdf") continue;
    for (const mimeType of PRESET_MIME_TYPES[presetId]) {
      allowed.add(mimeType);
    }
  }

  return allowed;
}

export function resolveAllowedMimeTypes(config: FileUploadConfig): Set<string> | null {
  const normalized = normalizeFileUploadConfig(config);
  if (normalized.allowsAny) return null;

  const allowed = resolvePresetMimeTypes(normalized.allowedFilePresets);
  const custom = parseCustomFileTypes(normalized.customFileTypes);

  for (const mimeType of custom.mimeTypes) {
    allowed.add(mimeType);
  }

  for (const ext of custom.extensions) {
    const mapped = EXTENSION_TO_MIME[ext];
    if (mapped) allowed.add(mapped);
  }

  return allowed;
}

export function getFileUploadAcceptValue(config: FileUploadConfig): string {
  const normalized = normalizeFileUploadConfig(config);
  if (normalized.allowsAny) return "";

  const parts = new Set<string>();

  for (const presetId of normalized.allowedFilePresets) {
    if (presetId === "images" || presetId === "pdf") {
      for (const ext of PRESET_EXTENSIONS[presetId]) parts.add(ext);
      for (const mime of PRESET_MIME_TYPES[presetId]) parts.add(mime);
    }
  }

  const custom = parseCustomFileTypes(normalized.customFileTypes);
  for (const ext of custom.extensions) parts.add(ext);
  for (const mime of custom.mimeTypes) parts.add(mime);

  return [...parts].join(",");
}

export function getFileUploadHint(
  config: FileUploadConfig,
  maxMb: number,
): string {
  const normalized = normalizeFileUploadConfig(config);
  if (normalized.allowsAny) {
    return `Any file type up to ${maxMb} MB`;
  }

  const labels = normalized.allowedFilePresets
    .filter((id) => id !== "any")
    .map((id) => FILE_UPLOAD_PRESETS[id].label);

  const custom = parseCustomFileTypes(normalized.customFileTypes);
  if (custom.mimeTypes.size > 0 || custom.extensions.size > 0) {
    labels.push("custom types");
  }

  const typeLabel =
    labels.length > 0 ? labels.join(", ") : "selected file types";

  return `${typeLabel} up to ${maxMb} MB`;
}

export function getFileUploadTypeError(config: FileUploadConfig): string {
  const normalized = normalizeFileUploadConfig(config);

  if (normalized.allowsAny) {
    return "This file type is not allowed.";
  }

  const parts: string[] = [];

  for (const presetId of normalized.allowedFilePresets) {
    if (presetId === "images" || presetId === "pdf") {
      parts.push(FILE_UPLOAD_PRESETS[presetId].description);
    }
  }

  const custom = parseCustomFileTypes(normalized.customFileTypes);
  if (custom.mimeTypes.size > 0) {
    parts.push([...custom.mimeTypes].join(", "));
  }
  if (custom.extensions.size > 0) {
    parts.push([...custom.extensions].join(", "));
  }

  return `This field only accepts ${parts.join("; ")}.`;
}

function resolveAnyUploadMimeType(
  fileName: string,
  mimeType?: string | null,
): string | null {
  const normalizedType = mimeType?.toLowerCase().trim();

  if (normalizedType && isAllowedMimeType(normalizedType)) {
    return normalizedType;
  }

  const extension = getExtension(fileName);
  if (extension) {
    const mapped = EXTENSION_TO_MIME[extension] ?? "application/octet-stream";
    if (BLOCKED_MIME_TYPES.has(mapped)) return null;
    return mapped;
  }

  if (normalizedType && MIME_TYPE_PATTERN.test(normalizedType)) {
    return BLOCKED_MIME_TYPES.has(normalizedType) ? null : normalizedType;
  }

  return "application/octet-stream";
}

export function resolveUploadMimeTypeForConfig(
  fileName: string,
  mimeType: string | null | undefined,
  config: FileUploadConfig,
): string | null {
  const normalized = normalizeFileUploadConfig(config);

  if (normalized.allowsAny) {
    return resolveAnyUploadMimeType(fileName, mimeType);
  }

  const allowed = resolveAllowedMimeTypes(config);
  if (!allowed || allowed.size === 0) return null;

  const type = mimeType?.toLowerCase().trim();
  if (type && allowed.has(type)) {
    return type;
  }

  const extension = getExtension(fileName);
  if (extension) {
    const custom = parseCustomFileTypes(normalized.customFileTypes);
    if (custom.extensions.has(extension)) {
      const resolved = type && allowed.has(type)
        ? type
        : EXTENSION_TO_MIME[extension] ?? type ?? "application/octet-stream";
      return allowed.has(resolved) || custom.extensions.has(extension)
        ? resolved
        : null;
    }

    const mapped = EXTENSION_TO_MIME[extension];
    if (mapped && allowed.has(mapped)) {
      return mapped;
    }
  }

  return null;
}

export function toggleFileUploadPreset(
  presets: FileUploadPresetId[],
  presetId: FileUploadPresetId,
  checked: boolean,
): FileUploadPresetId[] {
  if (checked) {
    return presets.includes(presetId) ? presets : [...presets, presetId];
  }

  return presets.filter((id) => id !== presetId);
}
