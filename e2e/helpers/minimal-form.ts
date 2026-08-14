import { expect, type Page } from "@playwright/test";

import type { ThemePreset } from "./theme-editor";
import { dismissSignOutDialog, fillFormTitle } from "./editor-page";

export async function buildMinimalPublishedForm(
  page: Page,
  options: {
    title: string;
    questionTitle: string;
    theme?: ThemePreset;
  },
): Promise<string> {
  await page.goto("/forms/new");
  await dismissSignOutDialog(page);
  await page.getByRole("button", { name: "Start blank" }).click();
  await page.waitForURL(/\/forms\/[a-z0-9]{6}$/);
  const formId = page.url().split("/").pop()!;

  await fillFormTitle(page, options.title);
  await page.getByPlaceholder("Question").first().fill(options.questionTitle);

  if (options.theme) {
    await options.theme.apply(page);
  }

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible({
    timeout: 20_000,
  });
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Live", { exact: true })).toBeVisible({
    timeout: 20_000,
  });

  return formId;
}
