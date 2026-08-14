import { test } from "@playwright/test";

import { buildAllTypesFormInEditor } from "../helpers/editor";
import { submitAllTypesForm } from "../helpers/public-form";

test.describe("editor all types", () => {
  test.setTimeout(180_000);

  test("builds every question type in the editor, publishes, and submits", async ({
    page,
  }) => {
    const formId = await buildAllTypesFormInEditor(page);
    await submitAllTypesForm(page, formId);
  });
});
