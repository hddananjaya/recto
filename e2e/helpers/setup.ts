import fs from "node:fs";
import path from "node:path";

import { request as playwrightRequest } from "@playwright/test";
import { config as loadEnv } from "dotenv";

import { prisma } from "../../lib/prisma";

import {
  AUTH_STORAGE_PATH,
  BASE_URL,
  E2E_USER_EMAIL,
  E2E_USER_PASSWORD,
  SITE_RESPONSE_TIMEOUT_MS,
} from "./constants";
import { seedPublishedForm } from "./seed";
import { seedAllTypesForm } from "./seed-all-types";
import { seedOptionalAllTypesForm } from "./seed-optional-all-types";
import { seedResponsesForm } from "./seed-responses";

loadEnv({ path: ".env" });

/** better-auth requires Origin on POST when the request carries session cookies. */
const AUTH_HEADERS = { Origin: BASE_URL };

async function assertDatabaseReady(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      [
        "Postgres is not reachable for E2E setup.",
        `DATABASE_URL=${process.env.DATABASE_URL ?? "(unset)"}`,
        message,
        "",
        "Fix:",
        "  pnpm db:start",
        "  pnpm db:migrate",
        "",
        "If Postgres panics with read-only filesystem, free disk space and restart Docker.",
      ].join("\n"),
    );
  }
}

async function assertEmailAuthEnabled(
  api: Awaited<ReturnType<typeof playwrightRequest.newContext>>,
): Promise<void> {
  const health = await api.get("/api/e2e/health", {
    timeout: SITE_RESPONSE_TIMEOUT_MS,
  });
  if (!health.ok()) {
    throw new Error(
      `E2E health check failed (${health.status()}). Is the app running at ${BASE_URL}?`,
    );
  }

  const body = (await health.json()) as { emailPasswordAuth?: boolean };
  if (!body.emailPasswordAuth) {
    throw new Error(
      [
        `Email/password auth is disabled on ${BASE_URL}.`,
        "Next.js only allows one dev server per project, so Playwright may be reusing your existing `pnpm dev` without E2E_TEST_MODE.",
        "",
        "Fix one of:",
        "  1. Stop dev, then run `pnpm e2e` (Playwright starts the server with E2E_TEST_MODE), or",
        "  2. Restart dev with `pnpm dev:e2e`, then run `pnpm e2e` in another terminal.",
      ].join("\n"),
    );
  }
}

async function ensureTestUser(): Promise<string> {
  const api = await playwrightRequest.newContext({ baseURL: BASE_URL });

  await assertEmailAuthEnabled(api);

  const signIn = await api.post("/api/auth/sign-in/email", {
    headers: AUTH_HEADERS,
    data: {
      email: E2E_USER_EMAIL,
      password: E2E_USER_PASSWORD,
    },
  });

  if (!signIn.ok()) {
    const signUp = await api.post("/api/auth/sign-up/email", {
      headers: AUTH_HEADERS,
      data: {
        email: E2E_USER_EMAIL,
        password: E2E_USER_PASSWORD,
        name: "E2E Test User",
      },
    });

    if (!signUp.ok()) {
      const body = await signUp.text();
      throw new Error(
        `E2E sign-up failed (${signUp.status()}): ${body || "(empty body)"}`,
      );
    }

    // Sign-up already sets the session cookie; a follow-up sign-in would 403
    // without Origin once cookies are present (better-auth CSRF).
  }

  fs.mkdirSync(path.dirname(AUTH_STORAGE_PATH), { recursive: true });
  await api.storageState({ path: AUTH_STORAGE_PATH });
  await api.dispose();

  const user = await prisma.user.findUnique({
    where: { email: E2E_USER_EMAIL },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`E2E user missing after sign-in: ${E2E_USER_EMAIL}`);
  }

  return user.id;
}

export async function runE2eSetup(): Promise<void> {
  await assertDatabaseReady();
  const ownerId = await ensureTestUser();
  await seedPublishedForm(ownerId);
  await seedAllTypesForm(ownerId);
  await seedOptionalAllTypesForm(ownerId);
  await seedResponsesForm(ownerId);
}
