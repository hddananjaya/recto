const PREVIEW_INTRO_SKIP_KEY = "recto:preview-intro-skipped";

export function isPreviewIntroSkipped(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PREVIEW_INTRO_SKIP_KEY) === "1";
}

export function setPreviewIntroSkipped(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREVIEW_INTRO_SKIP_KEY, "1");
}
