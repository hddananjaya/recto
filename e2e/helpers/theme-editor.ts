import { expect, type Page } from "@playwright/test";

import type { Roundness } from "@/lib/types";

import { dismissSignOutDialog, editorMain } from "./editor-page";

export interface ThemePreset {
  name: string;
  /** Hex accent expected on public form (--form-accent). */
  accentHex: string;
  roundness: Roundness;
  apply: (page: Page) => Promise<void>;
}

async function openThemePanel(page: Page): Promise<void> {
  await dismissSignOutDialog(page);
  const trigger = editorMain(page).getByRole("button").filter({ hasText: "Theme" });
  const expanded = await trigger.getAttribute("aria-expanded");
  if (expanded !== "true") {
    await trigger.click();
  }
  await expect(
    editorMain(page).getByText("Customize how the public form looks and feels."),
  ).toBeVisible();
}

export async function setBackgroundMode(
  page: Page,
  mode: "Color" | "Photo",
): Promise<void> {
  await openThemePanel(page);
  await editorMain(page).getByRole("button", { name: mode, exact: true }).click();
}

export async function pickQuickStyle(page: Page, label: string): Promise<void> {
  await openThemePanel(page);
  await setBackgroundMode(page, "Color");
  await page.getByTitle(label, { exact: true }).click();
}

export async function pickPhotoPreset(page: Page, label: string): Promise<void> {
  await openThemePanel(page);
  await setBackgroundMode(page, "Photo");
  await page.getByTitle(label, { exact: true }).click();
}

export async function setAccentColor(page: Page, hex: string): Promise<void> {
  await openThemePanel(page);
  const accentField = page
    .getByText("Accent color", { exact: true })
    .locator('xpath=ancestor::div[contains(@class,"justify-between")][1]');
  await accentField.getByRole("button").click();
  await page.getByPlaceholder("#000000").fill(hex);

  // Desktop: popover (no Done). Mobile: bottom sheet with Done.
  const done = page.getByRole("button", { name: "Done" });
  if (await done.isVisible()) {
    await done.click();
  } else {
    await page.keyboard.press("Escape");
  }
}

export async function setRoundness(
  page: Page,
  label: "Sharp" | "Soft" | "Round",
): Promise<void> {
  await openThemePanel(page);
  await editorMain(page).getByRole("button", { name: label, exact: true }).click();
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: "Rose + sharp (color)",
    accentHex: "#fca5a5",
    roundness: "sharp",
    apply: async (page) => {
      await pickQuickStyle(page, "Rose");
      await setRoundness(page, "Sharp");
    },
  },
  {
    name: "Ocean + soft (color)",
    accentHex: "#60a5fa",
    roundness: "soft",
    apply: async (page) => {
      await pickQuickStyle(page, "Ocean");
      await setRoundness(page, "Soft");
    },
  },
  {
    name: "Horizon + round (photo)",
    accentHex: "#0a0a0a",
    roundness: "round",
    apply: async (page) => {
      await pickPhotoPreset(page, "Horizon");
      await setRoundness(page, "Round");
    },
  },
];

export async function readFormAccent(page: Page): Promise<string> {
  const scope = page.locator("[data-form-theme]").first();
  await expect(scope).toBeVisible();
  return scope.evaluate((el) =>
    getComputedStyle(el).getPropertyValue("--form-accent").trim(),
  );
}

export function hexToRgb(hex: string): string {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function normalizeAccentColor(color: string): string {
  const trimmed = color.replace(/\s/g, "").toLowerCase();

  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return `#${hex
        .split("")
        .map((ch) => ch + ch)
        .join("")}`;
    }
    return `#${hex}`;
  }

  const rgbMatch = trimmed.match(/^rgb\((\d+),(\d+),(\d+)\)$/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    const toHex = (n: string) =>
      Number(n).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  return trimmed;
}

export async function expectAccentMatches(
  page: Page,
  accentHex: string,
): Promise<void> {
  const accent = await readFormAccent(page);
  expect(normalizeAccentColor(accent)).toBe(normalizeAccentColor(accentHex));
}
