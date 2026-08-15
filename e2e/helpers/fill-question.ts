import path from "node:path";

import { expect, type Page } from "@playwright/test";

import type { QuestionType } from "@/lib/types";

import {
  REALISTIC_ANSWERS,
  REALISTIC_QUESTIONS,
  questionTitle,
} from "./realistic-data";

const SAMPLE_IMAGE = path.join(process.cwd(), "e2e/fixtures/sample.png");

function labeledField(page: Page, type: QuestionType) {
  return page.getByLabel(questionTitle(type), { exact: true });
}

async function clickContinueOrSubmit(page: Page): Promise<void> {
  await page.getByRole("button", { name: /^(Continue|Submit)$/ }).click();
}

async function expectQuestionVisible(
  page: Page,
  type: QuestionType,
): Promise<void> {
  await expect(page.getByText(questionTitle(type), { exact: true })).toBeVisible();
}

/** Fill the current stepped question and advance (handles auto-advance types). */
export async function fillQuestionStep(
  page: Page,
  type: QuestionType,
): Promise<void> {
  await expectQuestionVisible(page, type);

  switch (type) {
    case "text":
      await labeledField(page, type).fill(REALISTIC_ANSWERS.text);
      await clickContinueOrSubmit(page);
      break;

    case "email":
      await labeledField(page, type).fill(REALISTIC_ANSWERS.email);
      await clickContinueOrSubmit(page);
      break;

    case "phone": {
      await page.getByRole("button", { name: /^[A-Z]{2}$/ }).click();
      await page.getByRole("option", { name: /United States/ }).first().click();
      await page
        .getByRole("textbox", { name: new RegExp(questionTitle(type), "i") })
        .pressSequentially(REALISTIC_ANSWERS.phoneDigits);
      await clickContinueOrSubmit(page);
      break;
    }

    case "number":
      await labeledField(page, type).fill(REALISTIC_ANSWERS.number);
      await clickContinueOrSubmit(page);
      break;

    case "url":
      await labeledField(page, type).fill(REALISTIC_ANSWERS.url);
      await clickContinueOrSubmit(page);
      break;

    case "textarea":
      await labeledField(page, type).fill(REALISTIC_ANSWERS.textarea);
      await clickContinueOrSubmit(page);
      break;

    case "single_select":
      await page
        .locator("main")
        .getByRole("button", { name: REALISTIC_ANSWERS.singleSelect })
        .click();
      break;

    case "multi_select":
      for (const option of REALISTIC_ANSWERS.multiSelect) {
        await page.locator("main").getByRole("button", { name: option }).click();
      }
      await clickContinueOrSubmit(page);
      break;

    case "rating":
      await page
        .getByRole("button", {
          name: new RegExp(`Rate ${REALISTIC_ANSWERS.ratingStar} out of`),
        })
        .click();
      await clickContinueOrSubmit(page);
      break;

    case "nps":
      await page
        .locator("main")
        .getByRole("button", { name: REALISTIC_ANSWERS.npsScore, exact: true })
        .click();
      await clickContinueOrSubmit(page);
      break;

    case "ranking":
      await clickContinueOrSubmit(page);
      break;

    case "matrix": {
      const rows = REALISTIC_QUESTIONS.matrix.matrixRows ?? [];
      for (let i = 0; i < rows.length; i++) {
        await page
          .getByRole("button", {
            name: REALISTIC_ANSWERS.matrixColumn,
            exact: true,
          })
          .nth(i)
          .click();
      }
      await clickContinueOrSubmit(page);
      break;
    }

    case "date":
      await page.getByRole("button", { name: /Pick a date/ }).click();
      await page.locator("button[data-day]").first().click();
      await clickContinueOrSubmit(page);
      break;

    case "file":
      await page.locator('input[type="file"]').setInputFiles(SAMPLE_IMAGE);
      await expect(page.getByText(/sample\.png/i)).toBeVisible({ timeout: 15_000 });
      await clickContinueOrSubmit(page);
      break;

    case "signature":
      await page
        .getByPlaceholder("Type your full name")
        .fill(REALISTIC_ANSWERS.signature);
      await clickContinueOrSubmit(page);
      break;

    case "switch":
      await page
        .locator("main")
        .getByRole("button", { name: REALISTIC_ANSWERS.switchChoice, exact: true })
        .click();
      await clickContinueOrSubmit(page);
      break;

    default:
      throw new Error(`Unhandled question type: ${type satisfies never}`);
  }
}
