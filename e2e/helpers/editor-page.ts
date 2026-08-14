import { expect, type Page } from "@playwright/test";

/** Dismiss accidental sign-out confirmation during headed editor runs. */
export async function dismissSignOutDialog(page: Page): Promise<void> {
  const dialog = page.getByRole("alertdialog", { name: "Sign out?" });
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole("button", { name: "Cancel" }).click();
  }
}

/** Editor page main content — excludes the app sidebar. */
export function editorMain(page: Page) {
  return page.locator("main");
}

function formTitleField(page: Page) {
  return editorMain(page).getByPlaceholder("Untitled form");
}

/** Wait until the editor has loaded and initial server data has settled. */
export async function waitForEditorReady(page: Page): Promise<void> {
  await dismissSignOutDialog(page);
  await expect(formTitleField(page)).toBeVisible({ timeout: 20_000 });
  await expect(editorMain(page).getByPlaceholder("Question").first()).toBeVisible();
}

/** Fill the form title after the editor is ready; asserts the value stuck in the field. */
export async function fillFormTitle(page: Page, title: string): Promise<void> {
  await waitForEditorReady(page);
  const field = formTitleField(page);
  await field.fill(title);
  await expect(field).toHaveValue(title);
}
