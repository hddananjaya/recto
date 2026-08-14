"use client";

import { useParams, usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getForm } from "@/lib/actions";
import type { FormDetail } from "@/lib/types";
import { useBreadcrumbTitleContext } from "@/components/breadcrumb-title-provider";

type FormWorkspaceTab = "edit" | "responses";

export type FormEditToolbarState = {
  saving: boolean;
  saved: boolean;
  isDirty: boolean;
  publishing: boolean;
  unpublishing: boolean;
  deleting: boolean;
  isPublished: boolean;
};

export type FormEditToolbarCallbacks = {
  onPreview: () => void;
  onSave: () => void;
  onPublish: () => void;
  onRequestUnpublish: () => void;
  onRequestDelete: () => void;
};

type FormWorkspaceContextValue = {
  formId: string;
  form: FormDetail | null;
  loading: boolean;
  activeTab: FormWorkspaceTab | null;
  showChrome: boolean;
  editToolbarState: FormEditToolbarState | null;
  editToolbarCallbacksRef: React.MutableRefObject<FormEditToolbarCallbacks | null>;
  setEditToolbarState: (state: FormEditToolbarState | null) => void;
  refreshForm: () => Promise<void>;
};

const FormWorkspaceContext = createContext<FormWorkspaceContextValue | null>(
  null,
);

function resolveWorkspaceTab(
  pathname: string,
  formId: string,
): FormWorkspaceTab | null {
  if (pathname === `/forms/${formId}`) return "edit";
  if (pathname.startsWith(`/forms/${formId}/submissions`)) return "responses";
  return null;
}

export function FormWorkspaceProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const breadcrumbTitleContext = useBreadcrumbTitleContext();
  const formId = typeof params.id === "string" ? params.id : "";
  const activeTab = formId ? resolveWorkspaceTab(pathname, formId) : null;
  const showChrome = activeTab !== null;

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loadedFormId, setLoadedFormId] = useState<string | null>(null);
  const [editToolbarState, setEditToolbarState] =
    useState<FormEditToolbarState | null>(null);
  const editToolbarCallbacksRef = useRef<FormEditToolbarCallbacks | null>(null);
  const loading = showChrome && loadedFormId !== formId;

  const refreshForm = useCallback(async () => {
    if (!formId || !showChrome) return;
    const data = await getForm(formId);
    setForm(data);
    setLoadedFormId(formId);
  }, [formId, showChrome]);

  useEffect(() => {
    if (!showChrome) return;

    let cancelled = false;

    getForm(formId).then((data) => {
      if (cancelled) return;
      setForm(data);
      setLoadedFormId(formId);
    });

    return () => {
      cancelled = true;
    };
  }, [formId, showChrome]);

  useEffect(() => {
    if (!showChrome) {
      setEditToolbarState(null);
      editToolbarCallbacksRef.current = null;
    }
  }, [showChrome]);

  useEffect(() => {
    if (!breadcrumbTitleContext || !form) return;

    breadcrumbTitleContext.setFormTitleOverride(
      form.title.trim() || "Untitled form",
    );
  }, [activeTab, breadcrumbTitleContext, form]);

  useEffect(() => {
    return () => breadcrumbTitleContext?.setFormTitleOverride(null);
  }, [breadcrumbTitleContext]);

  const value = useMemo(
    () => ({
      formId,
      form,
      loading,
      activeTab,
      showChrome,
      editToolbarState,
      editToolbarCallbacksRef,
      setEditToolbarState,
      refreshForm,
    }),
    [formId, form, loading, activeTab, showChrome, editToolbarState, refreshForm],
  );

  return (
    <FormWorkspaceContext.Provider value={value}>
      {children}
    </FormWorkspaceContext.Provider>
  );
}

export function useFormWorkspace() {
  const context = useContext(FormWorkspaceContext);
  if (!context) {
    throw new Error("useFormWorkspace must be used within FormWorkspaceProvider");
  }
  return context;
}

export function useFormEditToolbar(
  state: FormEditToolbarState,
  callbacks: FormEditToolbarCallbacks,
) {
  const { setEditToolbarState, editToolbarCallbacksRef } = useFormWorkspace();

  editToolbarCallbacksRef.current = callbacks;

  useEffect(() => {
    setEditToolbarState((previous) => {
      const next = {
        saving: state.saving,
        saved: state.saved,
        isDirty: state.isDirty,
        publishing: state.publishing,
        unpublishing: state.unpublishing,
        deleting: state.deleting,
        isPublished: state.isPublished,
      };

      if (
        previous &&
        previous.saving === next.saving &&
        previous.saved === next.saved &&
        previous.isDirty === next.isDirty &&
        previous.publishing === next.publishing &&
        previous.unpublishing === next.unpublishing &&
        previous.deleting === next.deleting &&
        previous.isPublished === next.isPublished
      ) {
        return previous;
      }

      return next;
    });
  }, [
    state.deleting,
    state.isDirty,
    state.isPublished,
    state.publishing,
    state.saved,
    state.saving,
    state.unpublishing,
    setEditToolbarState,
  ]);

  useEffect(() => {
    return () => setEditToolbarState(null);
  }, [setEditToolbarState]);
}
