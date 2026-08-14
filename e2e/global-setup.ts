import { BASE_URL } from "./helpers/constants";
import { runE2eSetup } from "./helpers/setup";

/** Auth + DB seed before tests (server started by playwright.config webServer). */
export default async function globalSetup(): Promise<void> {
  await runE2eSetup();
}
