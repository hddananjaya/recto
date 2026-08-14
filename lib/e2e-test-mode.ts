/** Server-only flag: enables email/password auth for Playwright E2E. Never set in production. */
export function isE2eTestMode(): boolean {
  return process.env.E2E_TEST_MODE === "true";
}
