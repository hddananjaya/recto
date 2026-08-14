import { expect, type Page } from "@playwright/test";

import type { QuestionType } from "@/lib/types";

import { ALL_QUESTION_TYPES } from "./all-types";
import { clearFormDraft } from "./public-form";
import { questionTitle } from "./realistic-data";
import { PUBLIC_VALIDATION } from "./validation-expectations";
import { fillQuestionStep } from "./fill-question";

/** Intro step is 0 when the form has a title; questions start at 1. */
export function questionStepIndex(typeIndex: number): number {
  return typeIndex + 1;
}

export async function gotoQuestionStep(
  page: Page,
  formId: string,
  typeIndex: number,
): Promise<void> {
  await clearFormDraft(page, formId);
  await page.goto(`/f/${formId}?step=${questionStepIndex(typeIndex)}`);
  await expect(
    page.getByText(questionTitle(ALL_QUESTION_TYPES[typeIndex]), { exact: true }),
  ).toBeVisible();
}

export async function clickStepPrimary(page: Page): Promise<void> {
  await page.getByRole("button", { name: /^(Continue|Submit)$/ }).click();
}

function fieldValidationAlerts(page: Page) {
  return page.locator('[data-question-id] [role="alert"]');
}

export async function expectValidationAlert(
  page: Page,
  message: string,
): Promise<void> {
  await expect(
    fieldValidationAlerts(page).filter({ hasText: message }),
  ).toBeVisible();
}

export async function expectNoValidationAlert(page: Page): Promise<void> {
  await expect(fieldValidationAlerts(page)).toHaveCount(0);
}

export async function assertRequiredEmptyValidation(
  page: Page,
  formId: string,
  type: QuestionType,
): Promise<void> {
  const typeIndex = ALL_QUESTION_TYPES.indexOf(type);
  const spec = PUBLIC_VALIDATION[type];

  await gotoQuestionStep(page, formId, typeIndex);
  await clickStepPrimary(page);
  await expectValidationAlert(page, spec.empty);
}

export async function assertInvalidValidation(
  page: Page,
  formId: string,
  type: QuestionType,
): Promise<void> {
  const spec = PUBLIC_VALIDATION[type];
  if (!spec.invalid) return;

  const typeIndex = ALL_QUESTION_TYPES.indexOf(type);
  await gotoQuestionStep(page, formId, typeIndex);
  await spec.invalid.fill(page);
  await clickStepPrimary(page);
  await expectValidationAlert(page, spec.invalid.message);
}

export async function assertValidAnswerAdvances(
  page: Page,
  formId: string,
  type: QuestionType,
): Promise<void> {
  const typeIndex = ALL_QUESTION_TYPES.indexOf(type);
  await gotoQuestionStep(page, formId, typeIndex);
  await fillQuestionStep(page, type);

  if (type === "single_select") {
    await expectNoValidationAlert(page);
    return;
  }

  const nextIndex = typeIndex + 1;
  if (nextIndex < ALL_QUESTION_TYPES.length) {
    await expect(
      page.getByText(questionTitle(ALL_QUESTION_TYPES[nextIndex]), {
        exact: true,
      }),
    ).toBeVisible();
  } else {
    // Isolated step tests jump directly to the last question without prior
    // answers, so a full submit cannot succeed. Verify the valid value clears
    // field-level validation instead.
    await expectNoValidationAlert(page);
  }
}

export async function assertOptionalEmptySkips(
  page: Page,
  formId: string,
  type: QuestionType,
): Promise<void> {
  const typeIndex = ALL_QUESTION_TYPES.indexOf(type);
  await gotoQuestionStep(page, formId, typeIndex);
  await clickStepPrimary(page);
  await expectNoValidationAlert(page);

  const nextIndex = typeIndex + 1;
  if (nextIndex < ALL_QUESTION_TYPES.length) {
    await expect(
      page.getByText(questionTitle(ALL_QUESTION_TYPES[nextIndex]), {
        exact: true,
      }),
    ).toBeVisible();
  } else {
    await expect(
      page.getByText("Thanks — your answers were submitted successfully."),
    ).toBeVisible({ timeout: 30_000 });
  }
}

/** Matrix: partial answer should still fail when required. */
export async function assertMatrixPartialFails(
  page: Page,
  formId: string,
): Promise<void> {
  const typeIndex = ALL_QUESTION_TYPES.indexOf("matrix");
  await gotoQuestionStep(page, formId, typeIndex);
  await page
    .getByRole("button", { name: "Excellent", exact: true })
    .nth(0)
    .click();
  await clickStepPrimary(page);
  await expectValidationAlert(page, PUBLIC_VALIDATION.matrix.empty);
}
