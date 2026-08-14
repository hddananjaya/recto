import { test } from "@playwright/test";

import { submitAllTypesForm } from "../helpers/public-form";

test.describe("all question types", () => {
  test.setTimeout(180_000);

  test("submits seeded form with all 16 types", async ({ page }) => {
    await submitAllTypesForm(page);
  });
});
