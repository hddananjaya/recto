import { test, expect } from "@playwright/test";

import { fillFormTitle } from "../helpers/editor-page";

test.describe("editor publish flow", () => {
  test("creates a blank form and publishes it", async ({ page }) => {
    await page.goto("/forms/new");
    await page.getByRole("button", { name: "Start blank" }).click();
    await page.waitForURL(/\/forms\/[a-z0-9]{6}$/);

    const formUrl = page.url();
    const formId = formUrl.split("/").pop()!;

    await fillFormTitle(page, "E2E Publish Test");
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Live", { exact: true })).toBeVisible();

    await page.goto(`/f/${formId}`);
    await expect(
      page.getByRole("heading", { name: "E2E Publish Test" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Start" }).click();
    await page.getByLabel("What's your name?").fill("Playwright");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("What's your email?").fill("publish-e2e@recto.test");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page.getByText("Thanks — your answers were submitted successfully."),
    ).toBeVisible();
  });
});
