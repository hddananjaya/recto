"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type BreadcrumbTitleContextValue = {
  formTitleOverride: string | null;
  setFormTitleOverride: (title: string | null) => void;
};

const BreadcrumbTitleContext = createContext<BreadcrumbTitleContextValue | null>(
  null,
);

/** Wrap the app shell so breadcrumbs can read live form titles from child pages. */
export function BreadcrumbTitleProvider({ children }: { children: ReactNode }) {
  const [formTitleOverride, setFormTitleOverride] = useState<string | null>(
    null,
  );

  return (
    <BreadcrumbTitleContext.Provider
      value={{ formTitleOverride, setFormTitleOverride }}
    >
      {children}
    </BreadcrumbTitleContext.Provider>
  );
}

export function useBreadcrumbFormTitleOverride() {
  return useContext(BreadcrumbTitleContext)?.formTitleOverride ?? null;
}

export function useBreadcrumbTitleContext() {
  return useContext(BreadcrumbTitleContext);
}

/** Sync a live form title into the header breadcrumb while this page is mounted. */
export function BreadcrumbFormTitleSync({ title }: { title: string }) {
  const ctx = useContext(BreadcrumbTitleContext);

  useEffect(() => {
    if (!ctx) return;
    ctx.setFormTitleOverride(title);
  }, [title, ctx]);

  return null;
}
