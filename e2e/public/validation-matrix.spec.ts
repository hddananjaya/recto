import { test } from "@playwright/test";

import { ALL_QUESTION_TYPES, E2E_ALL_TYPES_FORM_ID } from "../helpers/all-types";
import { PUBLIC_VALIDATION } from "../helpers/validation-expectations";
import {
  assertInvalidValidation,
  assertMatrixPartialFails,
  assertRequiredEmptyValidation,
  assertValidAnswerAdvances,
} from "../helpers/public-validation";

test.describe.configure({ mode: "serial" });

test.describe("required field validation matrix", () => {
  test.setTimeout(300_000);

  for (const type of ALL_QUESTION_TYPES) {
    test(`empty required: ${type}`, async ({ page }) => {
      test.skip(
        type === "ranking",
        "Ranking pre-fills default order in the UI",
      );
      await assertRequiredEmptyValidation(page, E2E_ALL_TYPES_FORM_ID, type);
    });

    test(`invalid value: ${type}`, async ({ page }) => {
      test.skip(
        !PUBLIC_VALIDATION[type].invalid,
        "No invalid UI case for this type",
      );
      await assertInvalidValidation(page, E2E_ALL_TYPES_FORM_ID, type);
    });

    test(`valid value advances: ${type}`, async ({ page }) => {
      await assertValidAnswerAdvances(page, E2E_ALL_TYPES_FORM_ID, type);
    });
  }

  test("matrix partial answer fails when required", async ({ page }) => {
    await assertMatrixPartialFails(page, E2E_ALL_TYPES_FORM_ID);
  });
});
