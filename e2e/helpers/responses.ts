import { expect, type Page } from "@playwright/test";

import { E2E_RESPONSES_FORM_ID } from "./constants";
import { dismissSignOutDialog } from "./editor-page";

export function responsesSidebar(page: Page) {
  return page.getByRole("navigation", { name: "Responses" });
}

export async function gotoResponsesWorkspace(
  page: Page,
  formId: string = E2E_RESPONSES_FORM_ID,
): Promise<void> {
  await page.goto(`/forms/${formId}/submissions`);
  await dismissSignOutDialog(page);
  await page.waitForURL(/\/forms\/[a-z0-9]{6}\/submissions(\?|$)/);
  await expect(
    page.getByRole("navigation", { name: "Form workspace" }).getByRole("link", {
      name: /Responses/i,
    }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page).toHaveURL(/\?response=/);
}
