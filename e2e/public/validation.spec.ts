import { test, expect } from "@playwright/test";

import { clearFormDraft, publicFormPath } from "../helpers/public-form";
import { REALISTIC_ANSWERS } from "../helpers/realistic-data";

test.describe("public form validation", () => {
  test.beforeEach(async ({ page }) => {
    await clearFormDraft(page, "e2epub");
  });

  test("shows required error on empty text field", async ({ page }) => {
    await page.goto(publicFormPath());
    await page.getByRole("button", { name: "Start" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("This field is required")).toBeVisible();
  });

  test("shows email validation error", async ({ page }) => {
    await page.goto(publicFormPath());
    await page.getByRole("button", { name: "Start" }).click();
    await page.getByPlaceholder(REALISTIC_ANSWERS.text).fill("Sam Rivera");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByPlaceholder(REALISTIC_ANSWERS.email).fill("not-an-email");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Enter a valid email")).toBeVisible();
  });
});
