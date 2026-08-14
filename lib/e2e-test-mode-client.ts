/** Client-safe flag mirrored from E2E_TEST_MODE (set by Playwright webServer / dev:e2e). */
export function isE2eTestModeClient(): boolean {
  return process.env.NEXT_PUBLIC_E2E_TEST_MODE === "true";
}
