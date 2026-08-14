/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearFormDraft,
  draftStorageKey,
  loadFormDraft,
  questionFingerprint,
  saveFormDraft,
} from "@/lib/form-draft-storage";

const FORM_ID = "qa7e15c5";
const QUESTION_IDS = ["q1", "q2"];

beforeEach(() => {
  localStorage.clear();
});

describe("draftStorageKey", () => {
  it("prefixes form id", () => {
    expect(draftStorageKey(FORM_ID)).toBe(`recto-form-draft:${FORM_ID}`);
  });
});

describe("questionFingerprint", () => {
  it("joins ids with null separator", () => {
    expect(questionFingerprint(["a", "b"])).toBe("a\u0000b");
  });
});

describe("saveFormDraft / loadFormDraft", () => {
  it("roundtrips draft data", () => {
    saveFormDraft(FORM_ID, {
      answers: { q1: "hello" },
      step: 2,
      questionFingerprint: questionFingerprint(QUESTION_IDS),
    });
    const loaded = loadFormDraft(FORM_ID, QUESTION_IDS);
    expect(loaded).toMatchObject({
      answers: { q1: "hello" },
      step: 2,
    });
    expect(loaded?.savedAt).toEqual(expect.any(Number));
  });

  it("returns null when fingerprint mismatches and clears storage", () => {
    saveFormDraft(FORM_ID, {
      answers: {},
      step: 1,
      questionFingerprint: questionFingerprint(["old"]),
    });
    expect(loadFormDraft(FORM_ID, QUESTION_IDS)).toBeNull();
    expect(localStorage.getItem(draftStorageKey(FORM_ID))).toBeNull();
  });

  it("returns null for corrupt JSON", () => {
    localStorage.setItem(draftStorageKey(FORM_ID), "{not json");
    expect(loadFormDraft(FORM_ID, QUESTION_IDS)).toBeNull();
  });

  it("returns null for invalid draft shape", () => {
    localStorage.setItem(
      draftStorageKey(FORM_ID),
      JSON.stringify({ step: "bad", answers: null }),
    );
    expect(loadFormDraft(FORM_ID, QUESTION_IDS)).toBeNull();
  });
});

describe("clearFormDraft", () => {
  it("removes stored draft", () => {
    saveFormDraft(FORM_ID, {
      answers: {},
      step: 1,
      questionFingerprint: questionFingerprint(QUESTION_IDS),
    });
    clearFormDraft(FORM_ID);
    expect(localStorage.getItem(draftStorageKey(FORM_ID))).toBeNull();
  });
});

describe("SSR", () => {
  it("returns null when window is undefined", async () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error test shim
    delete globalThis.window;
    vi.resetModules();
    const mod = await import("@/lib/form-draft-storage");
    expect(mod.loadFormDraft(FORM_ID, QUESTION_IDS)).toBeNull();
    globalThis.window = originalWindow;
  });
});
