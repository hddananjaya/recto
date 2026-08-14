import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

import { AUTH_STORAGE_PATH, SITE_RESPONSE_TIMEOUT_MS } from "./e2e/helpers/constants";

const PORT = process.env.PORT ?? "3000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  globalSetup: path.join(__dirname, "e2e/global-setup.ts"),
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  expect: { timeout: SITE_RESPONSE_TIMEOUT_MS },
  use: {
    baseURL,
    headless: false,
    actionTimeout: SITE_RESPONSE_TIMEOUT_MS,
    navigationTimeout: SITE_RESPONSE_TIMEOUT_MS,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "linear",
      testMatch: [
        /linear\/.*\.spec\.ts/,
        /editor\/theme\.spec\.ts/,
        /editor\/validation\.spec\.ts/,
        /editor\/responses\.spec\.ts/,
        /public\/validation-matrix\.spec\.ts/,
        /public\/optional-fields\.spec\.ts/,
        /public\/submit\.spec\.ts/,
        /public\/validation\.spec\.ts/,
      ],
      timeout: 300_000,
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_STORAGE_PATH,
      },
    },
  ],
  webServer: {
    command: "pnpm exec next dev --port 3000",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      E2E_TEST_MODE: "true",
      NEXT_PUBLIC_E2E_TEST_MODE: "true",
      AUTH_URL: baseURL,
      NEXT_PUBLIC_AUTH_URL: baseURL,
    },
  },
});
