import { test, expect } from "@playwright/test";

import { fillFormTitle } from "../helpers/editor-page";
import { EDITOR_PUBLISH_ERRORS } from "../helpers/validation-expectations";

test.describe.configure({ mode: "serial" });

test.describe("editor publish validation", () => {
  test.setTimeout(120_000);

  test("blocks publish without a form title", async ({ page }) => {
    await page.goto("/forms/new");
    await page.getByRole("button", { name: "Start blank" }).click();
    await page.waitForURL(/\/forms\/[a-z0-9]{6}$/);

    await fillFormTitle(page, "");
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(
      page.getByText(EDITOR_PUBLISH_ERRORS.missingTitle).first(),
    ).toBeVisible();
  });

  test("blocks publish when a question has no title", async ({ page }) => {
    await page.goto("/forms/new");
    await page.getByRole("button", { name: "Start blank" }).click();
    await page.waitForURL(/\/forms\/[a-z0-9]{6}$/);

    await page.getByPlaceholder("Question").first().fill("");
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(
      page.getByText(EDITOR_PUBLISH_ERRORS.missingQuestionTitle).first(),
    ).toBeVisible();
  });

  test("blocks publish when single select has no options", async ({ page }) => {
    await page.goto("/forms/new");
    await page.getByRole("button", { name: "Start blank" }).click();
    await page.waitForURL(/\/forms\/[a-z0-9]{6}$/);

    await fillFormTitle(page, "Editor validation QA");
    await page.getByRole("button", { name: "Add question" }).click();

    const newQuestion = page.getByPlaceholder("Question").nth(2);
    await newQuestion.scrollIntoViewIfNeeded();
    await newQuestion.fill("Pick a plan");

    const row = newQuestion.locator("..");
    await row.getByRole("button").click();
    const listbox = page.getByRole("listbox", { name: "Question types" }).last();
    await listbox.getByRole("option", { name: "Single select", exact: true }).click();

    const card = newQuestion.locator(
      'xpath=ancestor::div[contains(@class,"shadow-none")][1]',
    );
    const optionsField = card.locator('textarea[placeholder*="Option 1"]');
    await optionsField.fill("");
    await optionsField.blur();

    await page.getByRole("button", { name: "Publish" }).click();
    await expect(
      page.getByText(EDITOR_PUBLISH_ERRORS.selectNeedsOptions).first(),
    ).toBeVisible();
  });

  test("blocks publish when matrix has no rows", async ({ page }) => {
    await page.goto("/forms/new");
    await page.getByRole("button", { name: "Start blank" }).click();
    await page.waitForURL(/\/forms\/[a-z0-9]{6}$/);

    await fillFormTitle(page, "Matrix validation QA");
    await page.getByRole("button", { name: "Add question" }).click();

    const newQuestion = page.getByPlaceholder("Question").nth(2);
    await newQuestion.scrollIntoViewIfNeeded();
    await newQuestion.fill("Satisfaction grid");

    const row = newQuestion.locator("..");
    await row.getByRole("button").click();
    const listbox = page.getByRole("listbox", { name: "Question types" }).last();
    await listbox.getByRole("option", { name: "Matrix", exact: true }).click();

    const card = newQuestion.locator(
      'xpath=ancestor::div[contains(@class,"shadow-none")][1]',
    );
    const rowsField = card.locator('textarea[placeholder*="Row 1"]');
    await rowsField.fill("");
    await rowsField.blur();

    await page.getByRole("button", { name: "Publish" }).click();
    await expect(
      page.getByText(EDITOR_PUBLISH_ERRORS.matrixNeedsRows).first(),
    ).toBeVisible();
  });
});
