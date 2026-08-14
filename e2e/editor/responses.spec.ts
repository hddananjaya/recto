import { test, expect } from "@playwright/test";

import {
  gotoResponsesWorkspace,
  responsesSidebar,
} from "../helpers/responses";

test.describe("responses workspace", () => {
  test("shows breadcrumbs and auto-selects the first response on desktop", async ({
    page,
  }) => {
    await gotoResponsesWorkspace(page);

    await expect(page.getByRole("navigation", { name: "breadcrumb" })).toContainText(
      "Responses",
    );
    await expect(page.getByRole("heading", { name: "Response" })).toBeVisible();
    await expect(page).toHaveURL(/\?response=/);
  });

  test("selects another response via the sidebar using query params", async ({
    page,
  }) => {
    await gotoResponsesWorkspace(page);

    const sidebar = responsesSidebar(page);
    const secondItem = sidebar.getByRole("button").nth(1);
    const secondLabel = (await secondItem.innerText()).trim();

    await secondItem.click();

    await expect(page).toHaveURL(
      /\/forms\/e2ersp\/submissions\?response=[^&]+$/,
    );
    await expect(page.getByRole("heading", { name: "Response" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Response" }).locator("+ p"),
    ).toHaveText(secondLabel);
  });

  test("paginates responses on desktop", async ({ page }) => {
    await gotoResponsesWorkspace(page);

    await page.getByRole("button", { name: "Next page" }).click();

    await expect(page).toHaveURL(/[?&]page=2(?:&|$)/);
    await expect(page.getByText("21–25 · 2/2")).toBeVisible();
    await expect(responsesSidebar(page).getByRole("button")).toHaveCount(5);
  });
});
