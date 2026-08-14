import path from "node:path";

/** Fail fast when the app does not respond (navigation, clicks, fills, expects). */
export const SITE_RESPONSE_TIMEOUT_MS = 3_000;

export const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";

export const E2E_USER_EMAIL =
  process.env.E2E_USER_EMAIL ?? "e2e@recto.test";

export const E2E_USER_PASSWORD =
  process.env.E2E_USER_PASSWORD ?? "recto-e2e-test-password-8chars";

/** Fixed 6-char id — seeded published form for public E2E. */
export const E2E_PUBLISHED_FORM_ID = "e2epub";

/** Fixed 6-char id — seeded form with many responses for workspace E2E. */
export const E2E_RESPONSES_FORM_ID = "e2ersp";

export const AUTH_STORAGE_PATH = path.join(__dirname, "../.auth/user.json");
