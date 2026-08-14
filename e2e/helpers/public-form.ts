import { expect, type Page } from "@playwright/test";

import {
  ALL_QUESTION_TYPES,
  E2E_ALL_TYPES_FORM_ID,
  E2E_ALL_TYPES_FORM_TITLE,
} from "./all-types";
import { fillQuestionStep } from "./fill-question";
import { E2E_PUBLISHED_FORM_ID } from "./constants";
import { REALISTIC_ANSWERS } from "./realistic-data";

export async function clearFormDraft(page: Page, formId: string): Promise<void> {
  await page.goto(`/f/${formId}`);
  await page.evaluate((id) => {
    localStorage.removeItem(`recto-form-draft:${id}`);
  }, formId);
  await page.reload();
}

export async function fillAndSubmitPublicSmokeForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Start" }).click();
  await page.getByPlaceholder(REALISTIC_ANSWERS.text).fill(REALISTIC_ANSWERS.text);
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByPlaceholder(REALISTIC_ANSWERS.email)
    .fill(REALISTIC_ANSWERS.email);
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(
    page.getByText("Thanks — your answers were submitted successfully."),
  ).toBeVisible();
}

export function publicFormPath(formId = E2E_PUBLISHED_FORM_ID): string {
  return `/f/${formId}`;
}

export function allTypesFormPath(): string {
  return `/f/${E2E_ALL_TYPES_FORM_ID}`;
}

export async function submitAllTypesForm(
  page: Page,
  formId = E2E_ALL_TYPES_FORM_ID,
  formTitle = E2E_ALL_TYPES_FORM_TITLE,
): Promise<void> {
  await clearFormDraft(page, formId);
  await page.goto(`/f/${formId}`);
  await expect(page.getByRole("heading", { name: formTitle })).toBeVisible();
  await page.getByRole("button", { name: "Start" }).click();

  for (const type of ALL_QUESTION_TYPES) {
    await fillQuestionStep(page, type);
  }

  await expect(
    page.getByText("Thanks — your answers were submitted successfully."),
  ).toBeVisible({ timeout: 30_000 });
}
