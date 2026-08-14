import { test } from "@playwright/test";

import { ALL_QUESTION_TYPES } from "../helpers/all-types";
import { E2E_OPTIONAL_FORM_ID } from "../helpers/seed-optional-all-types";
import { assertOptionalEmptySkips } from "../helpers/public-validation";

test.describe.configure({ mode: "serial" });

test.describe("optional field matrix", () => {
  test.setTimeout(300_000);

  for (const type of ALL_QUESTION_TYPES) {
    test(`empty optional skips: ${type}`, async ({ page }) => {
      await assertOptionalEmptySkips(page, E2E_OPTIONAL_FORM_ID, type);
    });
  }
});
