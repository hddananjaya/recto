import { expect, type Page } from "@playwright/test";

import type { QuestionType } from "@/lib/types";

import {
  ALL_QUESTION_TYPES,
  EDITOR_TYPE_LABEL,
} from "./all-types";
import {
  REALISTIC_FORM_META,
  matrixColumnsLines,
  matrixRowsLines,
  optionsLines,
  questionTitle,
} from "./realistic-data";
import { dismissSignOutDialog, fillFormTitle } from "./editor-page";

export interface BuildFormOptions {
  title?: string;
  description?: string;
}

function questionCard(page: Page, questionIndex: number) {
  return page
    .getByPlaceholder("Question")
    .nth(questionIndex)
    .locator('xpath=ancestor::div[contains(@class,"shadow-none")][1]');
}

async function openTypePicker(page: Page, questionIndex: number): Promise<void> {
  const card = questionCard(page, questionIndex);
  await card.scrollIntoViewIfNeeded();
  const row = page.getByPlaceholder("Question").nth(questionIndex).locator("..");
  await row.getByRole("button").click();
}

async function setQuestionType(
  page: Page,
  questionIndex: number,
  type: QuestionType,
): Promise<void> {
  await openTypePicker(page, questionIndex);
  const label = EDITOR_TYPE_LABEL[type];
  const listbox = page.getByRole("listbox", { name: "Question types" }).last();
  await listbox.getByRole("option", { name: label, exact: true }).click();
}

async function configureQuestion(
  page: Page,
  questionIndex: number,
  type: QuestionType,
): Promise<void> {
  const card = questionCard(page, questionIndex);
  await card.scrollIntoViewIfNeeded();

  await page
    .getByPlaceholder("Question")
    .nth(questionIndex)
    .fill(questionTitle(type));

  const defaultType =
    questionIndex === 0 ? "text" : questionIndex === 1 ? "email" : "text";
  if (type !== defaultType || questionIndex >= 2) {
    await setQuestionType(page, questionIndex, type);
  }

  const optionText = optionsLines(type);
  if (optionText) {
    const optionsField = card.locator('textarea[placeholder*="Option 1"]');
    await optionsField.fill(optionText);
    await optionsField.blur();
  }

  const rowsText = matrixRowsLines(type);
  const columnsText = matrixColumnsLines(type);
  if (rowsText && columnsText) {
    const rowsField = card.locator('textarea[placeholder*="Row 1"]');
    await rowsField.fill(rowsText);
    await rowsField.blur();

    const columnsField = card.locator('textarea[placeholder*="Column 1"]');
    await columnsField.fill(columnsText);
    await columnsField.blur();
  }

  if (type === "file") {
    await card.getByRole("checkbox", { name: "Images" }).check();
  }

  if (questionIndex >= 2) {
    await card.getByRole("checkbox", { name: "Required" }).check();
  }
}

export async function createBlankForm(page: Page): Promise<string> {
  await page.goto("/forms/new");
  await dismissSignOutDialog(page);
  await page.getByRole("button", { name: "Start blank" }).click();
  await page.waitForURL(/\/forms\/[a-z0-9]{6}$/);
  return page.url().split("/").pop()!;
}

export async function buildAllTypesFormInEditor(
  page: Page,
  options: BuildFormOptions = {},
): Promise<string> {
  const formTitle = options.title ?? REALISTIC_FORM_META.title;
  const formDescription = options.description ?? REALISTIC_FORM_META.description;

  const formId = await createBlankForm(page);

  await fillFormTitle(page, formTitle);
  const descriptionField = page.getByPlaceholder(
    "Describe what this form is for",
  );
  if (await descriptionField.isVisible()) {
    await descriptionField.fill(formDescription);
  }

  for (let i = 2; i < ALL_QUESTION_TYPES.length; i++) {
    await page.getByRole("button", { name: "Add question" }).click();
  }

  for (const [index, type] of ALL_QUESTION_TYPES.entries()) {
    await configureQuestion(page, index, type);
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
