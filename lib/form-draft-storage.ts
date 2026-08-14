const PREFIX = "recto-form-draft:";

export interface FormDraft {
  answers: Record<string, unknown>;
  step: number;
  questionFingerprint: string;
  savedAt: number;
}

export function draftStorageKey(key: string): string {
  return `${PREFIX}${key}`;
}

export function questionFingerprint(questionIds: string[]): string {
  return questionIds.join("\0");
}

export function loadFormDraft(
  key: string,
  questionIds: string[],
): FormDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(draftStorageKey(key));
    if (!raw) return null;

    const draft = JSON.parse(raw) as FormDraft;
    const fingerprint = questionFingerprint(questionIds);

    if (draft.questionFingerprint !== fingerprint) {
      window.localStorage.removeItem(draftStorageKey(key));
      return null;
    }

    if (
      typeof draft.step !== "number" ||
      !draft.answers ||
      typeof draft.answers !== "object"
    ) {
      return null;
    }

    return draft;
  } catch {
    return null;
  }
}

export function saveFormDraft(
  key: string,
  data: Omit<FormDraft, "savedAt">,
): void {
  if (typeof window === "undefined") return;

  try {
    const draft: FormDraft = { ...data, savedAt: Date.now() };
    window.localStorage.setItem(draftStorageKey(key), JSON.stringify(draft));
  } catch {
    // Storage full or private mode — ignore.
  }
}

export function clearFormDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftStorageKey(key));
  } catch {
    // ignore
  }
}
