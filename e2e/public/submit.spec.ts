import { test, expect } from "@playwright/test";

import {
  clearFormDraft,
  fillAndSubmitPublicSmokeForm,
  publicFormPath,
} from "../helpers/public-form";

test.describe("public form submit", () => {
  test.beforeEach(async ({ page }) => {
    await clearFormDraft(page, "e2epub");
  });

  test("completes seeded smoke form", async ({ page }) => {
    await page.goto(publicFormPath());
    await expect(
      page.getByRole("heading", { name: "Quick contact" }),
    ).toBeVisible();
    await fillAndSubmitPublicSmokeForm(page);
  });
});
