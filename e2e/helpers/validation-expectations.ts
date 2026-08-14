import type { Page } from "@playwright/test";

import type { QuestionType } from "@/lib/types";

import { questionTitle } from "./realistic-data";

export interface PublicValidationCase {
  /** Message when leaving required field empty and continuing. */
  empty: string;
  /** Optional second case: bad value still on the same step. */
  invalid?: {
    message: string;
    fill: (page: Page) => Promise<void>;
  };
}

function labeled(page: Page, type: QuestionType) {
  return page.getByLabel(questionTitle(type), { exact: true });
}

/** Public stepped-form validation messages (must match lib/validation.ts). */
export const PUBLIC_VALIDATION: Record<QuestionType, PublicValidationCase> = {
  text: { empty: "This field is required" },
  email: {
    empty: "Enter a valid email",
    invalid: {
      message: "Enter a valid email",
      fill: async (page) => {
        await labeled(page, "email").fill("not-an-email");
      },
    },
  },
  phone: {
    empty: "Enter a valid phone number",
    invalid: {
      message: "Enter a valid phone number",
      fill: async (page) => {
        await page.getByRole("button", { name: /^[A-Z]{2}$/ }).click();
        await page.getByRole("option", { name: /United States/ }).first().click();
        await page
          .getByRole("textbox", { name: /Best number/i })
          .pressSequentially("123");
      },
    },
  },
  number: { empty: "This field is required" },
  url: {
    empty: "Enter a valid URL",
    invalid: {
      message: "Enter a valid URL",
      fill: async (page) => {
        await labeled(page, "url").fill("not-a-url");
      },
    },
  },
  textarea: { empty: "This field is required" },
  single_select: { empty: "Select a valid option" },
  multi_select: { empty: "Select at least one option" },
  rating: { empty: "This field is required" },
  nps: { empty: "This field is required" },
  ranking: { empty: "Rank all options" },
  matrix: { empty: "Answer all rows" },
  date: { empty: "Enter a valid date" },
  file: { empty: "Upload a file to continue" },
  signature: { empty: "This field is required" },
  switch: { empty: "This field is required" },
};

export const EDITOR_PUBLISH_ERRORS = {
  missingTitle: "Add a form title before publishing",
  missingQuestionTitle: "Add a question title",
  selectNeedsOptions: "Add at least one option",
  rankingNeedsOptions: "Add at least 2 options to rank",
  matrixNeedsRows: "Add at least one matrix row",
} as const;
