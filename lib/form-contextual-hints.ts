import type { Question } from "@/lib/types";
import {
  getFileUploadConfig,
  normalizeFileUploadConfig,
  type FileUploadConfig,
} from "@/lib/file-upload-presets";

export type KeyboardHintVariant = "enter" | "enter-with-newline";

export type FooterHint =
  | { kind: "keyboard"; variant: KeyboardHintVariant }
  | { kind: "instruction"; text: string }
  | null;

/** Desktop footer hint — keyboard shortcut or short instruction for the current step. */
export function getFooterHint(
  currentQuestion: Question | null,
  isIntro: boolean,
): FooterHint {
  if (isIntro) {
    return { kind: "keyboard", variant: "enter" };
  }

  if (!currentQuestion) return null;

  switch (currentQuestion.type) {
    case "textarea":
      return { kind: "keyboard", variant: "enter-with-newline" };
    case "text":
    case "email":
    case "number":
    case "url":
    case "phone":
    case "signature":
      return { kind: "keyboard", variant: "enter" };
    case "multi_select":
      return { kind: "instruction", text: "Select all that apply" };
    case "ranking":
      return { kind: "instruction", text: "Use the arrows to reorder" };
    case "matrix":
      return { kind: "instruction", text: "Choose one option per row" };
    case "single_select":
      return { kind: "instruction", text: "Choose one option" };
    case "rating":
    case "nps":
      return { kind: "instruction", text: "Select a rating" };
    case "switch":
      return { kind: "instruction", text: "Choose Yes or No" };
    case "file":
      return { kind: "instruction", text: "Upload a file to continue" };
    case "date":
      return { kind: "instruction", text: "Pick a date" };
    default:
      return { kind: "keyboard", variant: "enter" };
  }
}

/** Mobile footer instruction (shown above the CTA when a keyboard hint would be irrelevant). */
export function getMobileFooterInstruction(
  currentQuestion: Question | null,
  isIntro: boolean,
): string | null {
  if (isIntro || !currentQuestion) return null;

  switch (currentQuestion.type) {
    case "multi_select":
      return "Select all that apply";
    case "ranking":
      return "Use the arrows to reorder";
    case "matrix":
      return "Choose one option per row";
    case "textarea":
      return "Use Continue when you're done";
    case "file":
      return "Tap to choose a file";
    case "date":
      return "Tap to pick a date";
    case "single_select":
      return "Tap an option";
    case "rating":
    case "nps":
      return "Tap to rate";
    case "switch":
      return "Tap Yes or No";
    default:
      return null;
  }
}

function isImagesOnlyConfig(config: FileUploadConfig): boolean {
  const normalized = normalizeFileUploadConfig(config);
  if (normalized.allowsAny || normalized.customFileTypes) return false;
  return (
    normalized.allowedFilePresets.length === 1 &&
    normalized.allowedFilePresets[0] === "images"
  );
}

function isPdfOnlyConfig(config: FileUploadConfig): boolean {
  const normalized = normalizeFileUploadConfig(config);
  if (normalized.allowsAny || normalized.customFileTypes) return false;
  return (
    normalized.allowedFilePresets.length === 1 &&
    normalized.allowedFilePresets[0] === "pdf"
  );
}

/** Primary label on the file upload drop zone when no file is selected yet. */
export function getFileUploadEmptyLabel(
  config: FileUploadConfig,
  device: "touch" | "desktop",
): string {
  const imagesOnly = isImagesOnlyConfig(config);
  const pdfOnly = isPdfOnlyConfig(config);

  if (device === "touch") {
    if (imagesOnly) return "Tap to choose a photo";
    if (pdfOnly) return "Tap to choose a PDF";
    return "Tap to choose a file";
  }

  if (imagesOnly) return "Click or drag a photo here";
  if (pdfOnly) return "Click or drag a PDF here";
  return "Click or drag a file here";
}

/** Re-export-friendly helper for file questions. */
export function getFileUploadEmptyLabelForQuestion(
  question: Pick<Question, "allowedFilePresets" | "customFileTypes">,
  device: "touch" | "desktop",
): string {
  return getFileUploadEmptyLabel(getFileUploadConfig(question), device);
}
