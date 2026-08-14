import { test } from "@playwright/test";

import { buildAllTypesFormInEditor } from "../helpers/editor";
import { submitAllTypesForm } from "../helpers/public-form";
import { REALISTIC_FORM_META } from "../helpers/realistic-data";
import {
  useDesktopViewport,
  useMobileViewport,
} from "../helpers/viewports";

test.describe.configure({ mode: "serial" });

test.describe("linear journey", () => {
  test.setTimeout(600_000);

  test("desktop editor → submit → mobile editor → submit", async ({ page }) => {
    await useDesktopViewport(page);
    const desktopFormId = await buildAllTypesFormInEditor(page, {
      title: `${REALISTIC_FORM_META.title} (desktop)`,
    });
    await submitAllTypesForm(
      page,
      desktopFormId,
      `${REALISTIC_FORM_META.title} (desktop)`,
    );

    await useMobileViewport(page);
    const mobileFormId = await buildAllTypesFormInEditor(page, {
      title: `${REALISTIC_FORM_META.title} (mobile)`,
    });
    await submitAllTypesForm(
      page,
      mobileFormId,
      `${REALISTIC_FORM_META.title} (mobile)`,
    );
  });
});
