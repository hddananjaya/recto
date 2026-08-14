import type { Page } from "@playwright/test";

import { VIEWPORT_DESKTOP, VIEWPORT_MOBILE } from "./realistic-data";

export async function useDesktopViewport(page: Page): Promise<void> {
  await page.setViewportSize(VIEWPORT_DESKTOP);
}

export async function useMobileViewport(page: Page): Promise<void> {
  await page.setViewportSize(VIEWPORT_MOBILE);
}
