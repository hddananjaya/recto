import type { Roundness } from "./types";

/** Default accent when the form theme has no explicit accentColor (matches editor UI). */
export const DEFAULT_FORM_ACCENT = "#0a0a0a";

export function radiusForRoundness(roundness: Roundness): string {
  switch (roundness) {
    case "sharp":
      return "0.5rem";
    case "soft":
      return "0.875rem";
    case "round":
    default:
      return "1.25rem";
  }
}

export function hexLuminance(hex: string): number {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return 0.5;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function isLightBackground(hex: string): boolean {
  return hexLuminance(hex) > 0.5;
}

export function contrastColor(hex: string): string {
  return isLightBackground(hex) ? "#0a0a0a" : "#fafafa";
}
