import { test, expect } from "@playwright/test";

import { buildMinimalPublishedForm } from "../helpers/minimal-form";
import {
  THEME_PRESETS,
  expectAccentMatches,
  pickQuickStyle,
  readFormAccent,
} from "../helpers/theme-editor";

test.describe.configure({ mode: "serial" });

test.describe("theme on published forms", () => {
  test.setTimeout(180_000);

  for (const preset of THEME_PRESETS) {
    test(`applies ${preset.name}`, async ({ page }) => {
      const formId = await buildMinimalPublishedForm(page, {
        title: `Theme check — ${preset.name}`,
        questionTitle: "What should we call your workspace?",
        theme: preset,
      });

      await page.goto(`/f/${formId}`);
      await expect(
        page.getByRole("heading", { name: `Theme check — ${preset.name}` }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Start" }).click();

      await expectAccentMatches(page, preset.accentHex);

      const accent = await readFormAccent(page);
      expect(accent.length).toBeGreaterThan(0);
    });
  }

  test("updates accent after publish when theme is changed in editor", async ({
    page,
  }) => {
    const formId = await buildMinimalPublishedForm(page, {
      title: "Theme update check",
      questionTitle: "Workspace name",
      theme: THEME_PRESETS[0],
    });

    await page.goto(`/f/${formId}`);
    await page.getByRole("button", { name: "Start" }).click();
    await expectAccentMatches(page, "#fca5a5");

    await page.goto(`/forms/${formId}`);
    await pickQuickStyle(page, "Ocean");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("button", { name: "Saved" })).toBeVisible({
      timeout: 20_000,
    });

    await page.goto(`/f/${formId}`);
    await page.getByRole("button", { name: "Start" }).click();
    await expectAccentMatches(page, "#60a5fa");
  });
});
