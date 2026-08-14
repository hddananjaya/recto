"use client";

import { useCallback, useSyncExternalStore } from "react";

export type DashboardView = "cards" | "list";

export const DASHBOARD_VIEW_STORAGE_KEY = "recto-dashboard-view";

function readDashboardView(): DashboardView {
  const stored = window.localStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY);
  return stored === "list" ? "list" : "cards";
}

function subscribeDashboardView(onStoreChange: () => void) {
  window.addEventListener("recto-dashboard-view-change", onStoreChange);
  return () =>
    window.removeEventListener("recto-dashboard-view-change", onStoreChange);
}

export function useDashboardView() {
  const view = useSyncExternalStore(
    subscribeDashboardView,
    readDashboardView,
    (): DashboardView => "cards",
  );

  const setView = useCallback((nextView: DashboardView) => {
    window.localStorage.setItem(DASHBOARD_VIEW_STORAGE_KEY, nextView);
    window.dispatchEvent(new Event("recto-dashboard-view-change"));
  }, []);

  return { view, setView };
}
