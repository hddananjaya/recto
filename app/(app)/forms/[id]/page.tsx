"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  getForm,
  updateForm,
  updateFormQuestions,
  publishForm,
  unpublishForm,
  deleteForm,
  connectSheet,
  disconnectSheet,
  getSheetsServiceAccountEmail,
  verifySheetAccess,
} from "@/lib/actions";

import type {
  FormDetail,
  FormTheme,
  Question,
} from "@/lib/types";
import {
  ArrowLeft,
  Check,
  DotsSixVertical,
  ImageSquare,
  Palette,
  Plus,
  Trash,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FormPageSkeleton } from "@/components/ui/form-page-skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AutoResizeTextarea } from "@/components/ui/auto-resize-textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { QuestionTypeSelect } from "@/components/form-editor/question-type-select";
import { BreadcrumbFormTitleSync } from "@/components/breadcrumb-title-provider";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ColorField } from "@/components/ui/color-picker";
import { QuestionSortableItem } from "@/components/form-editor/question-sortable-item";
import { SheetConnectionCard } from "@/components/form-editor/sheet-connection-card";
import { QuestionDragPreview } from "@/components/form-editor/question-drag-preview";
import { FileUploadPresetPicker } from "@/components/form-editor/file-upload-preset-picker";
import { ChevronDownIcon } from "lucide-react";
import { focusControl } from "@/lib/focus-styles";
import { cn } from "@/lib/utils";
import { DEFAULT_FILE_UPLOAD_PRESETS } from "@/lib/file-upload-presets";
import {
  FormPreviewModal,
} from "@/components/form-preview-modal";
import { FormPreviewIntroDialog } from "@/components/form-preview-intro-dialog";
import type { FormPreviewSnapshot } from "@/components/form-preview-view";
import {
  isPreviewIntroSkipped,
  setPreviewIntroSkipped,
} from "@/lib/form-preview-preference";
import { formThemes } from "@/lib/form-themes";
import { radiusForRoundness } from "@/lib/theme";
import {
  applyQuestionDrafts,
  formatEditorValidationIssues,
  type EditorValidationIssue,
  validateFormEditor,
} from "@/lib/editor-validation";
import {
  FormBackground,
  FormThemeProvider,
  themedButtonClasses,
} from "@/components/form-theme";
import {
  useFormEditToolbar,
  useFormWorkspace,
} from "@/components/form-workspace-context";
import { toast } from "sonner";

const photoThemes = formThemes.filter((t) => t.id !== "none");

const colorPresets: { background: string; accent: string; label: string }[] = [
  { background: "#ffffff", accent: "#0a0a0a", label: "Clean" },
  { background: "#f5f5f5", accent: "#171717", label: "Soft gray" },
  { background: "#0a0a0a", accent: "#fafafa", label: "Dark" },
  { background: "#18181b", accent: "#fbbf24", label: "Midnight" },
  { background: "#1e3a8a", accent: "#60a5fa", label: "Ocean" },
  { background: "#312e81", accent: "#818cf8", label: "Indigo" },
  { background: "#701a75", accent: "#f0abfc", label: "Berry" },
  { background: "#7f1d1d", accent: "#fca5a5", label: "Rose" },
  { background: "#9a3412", accent: "#fdba74", label: "Rust" },
  { background: "#14532d", accent: "#86efac", label: "Forest" },
  { background: "#064e3b", accent: "#34d399", label: "Emerald" },
  { background: "#713f12", accent: "#fde047", label: "Gold" },
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function FormEditPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { refreshForm } = useFormWorkspace();

  const [formMeta, setFormMeta] = useState<Pick<
    FormDetail,
    "isPublished" | "sheetUrl" | "sheetName"
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<
    { type: "href"; href: string } | { type: "back" } | null
  >(null);
  const [questionToRemove, setQuestionToRemove] = useState<string | null>(null);
  const [disconnectSheetOpen, setDisconnectSheetOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIntroOpen, setPreviewIntroOpen] = useState(false);
  const [previewSnapshot, setPreviewSnapshot] =
    useState<FormPreviewSnapshot | null>(null);
  const [previewSession, setPreviewSession] = useState(0);
  const allowNavigationRef = useRef(false);
  const pendingNavigationRef = useRef<
    { type: "href"; href: string } | { type: "back" } | null
  >(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetsEmail, setSheetsEmail] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<{
    type: "error";
    message: string;
  } | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [optionDrafts, setOptionDrafts] = useState<Record<string, string>>({});
  const [matrixDrafts, setMatrixDrafts] = useState<
    Record<string, { rows: string; columns: string }>
  >({});
  const [validationErrors, setValidationErrors] = useState<
    EditorValidationIssue[]
  >([]);
  const [formStatus, setFormStatus] = useState<{
    type: "error";
    message: string;
  } | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [activeDragWidth, setActiveDragWidth] = useState<number | undefined>();

  type FormValues = {
    title: string;
    description: string;
    theme?: FormDetail["theme"];
    questions: Question[];
  };

  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      theme: undefined,
      questions: [],
    },
  });
  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([getForm(id), getSheetsServiceAccountEmail()]).then(
      ([data, email]) => {
      if (cancelled) return;

      setSheetsEmail(email);

      if (!data) {
        setLoading(false);
        return;
      }

      const currentForm = formRef.current;
      if (!currentForm.formState.isDirty) {
        currentForm.reset({
          title: data.title,
          description: data.description,
          theme: data.theme,
          questions: data.questions,
        });
      }

      setFormMeta({
        isPublished: data.isPublished,
        sheetUrl: data.sheetUrl,
        sheetName: data.sheetName,
      });
      setLoading(false);
    },
    );

    return () => {
      cancelled = true;
    };
  }, [id]);

  const isDirty = form.formState.isDirty;

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    pendingNavigationRef.current = pendingNavigation;
  }, [pendingNavigation]);

  useEffect(() => {
    if (!isDirty) return;

    const handleClick = (e: MouseEvent) => {
      if (allowNavigationRef.current) return;
      const target = e.target as HTMLElement;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:")
      )
        return;
      e.preventDefault();
      e.stopPropagation();
      const next = { type: "href" as const, href };
      pendingNavigationRef.current = next;
      setPendingNavigation(next);
      setLeaveDialogOpen(true);
    };

    history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      if (allowNavigationRef.current) return;
      const next = { type: "back" as const };
      pendingNavigationRef.current = next;
      setPendingNavigation(next);
      setLeaveDialogOpen(true);
      history.pushState(null, "", window.location.href);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);

  const updateQuestion = (questionId: string, patch: Partial<Question>) => {
    const questions = form.getValues("questions");
    form.setValue(
      "questions",
      questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)),
      { shouldDirty: true },
    );
  };

  const commitOptions = (questionId: string, raw: string) => {
    updateQuestion(questionId, {
      options: raw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((label) => ({
          label,
          value: label.toLowerCase().replace(/\s+/g, "-"),
        })),
    });
    setOptionDrafts((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const commitMatrix = (
    questionId: string,
    rowsRaw: string,
    colsRaw: string,
  ) => {
    updateQuestion(questionId, {
      rows: rowsRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      columns: colsRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setMatrixDrafts((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const flushDraftsIntoForm = () => {
    const merged = applyQuestionDrafts(
      form.getValues("questions"),
      optionDrafts,
      matrixDrafts,
    );
    form.setValue("questions", merged, { shouldDirty: true });
    setOptionDrafts({});
    setMatrixDrafts({});
    return merged;
  };

  const runEditorValidation = (
    questions: Question[],
    mode: "save" | "publish",
  ) => {
    const issues = validateFormEditor(
      {
        title: form.getValues("title"),
        questions,
      },
      mode,
    );
    setValidationErrors(issues);
    return issues;
  };

  const updateTheme = (patch: Partial<FormTheme>) => {
    const current = values.theme ?? { id: "custom" };
    form.setValue("theme", { ...current, ...patch }, { shouldDirty: true });
  };

  const setBackgroundMode = (mode: "photo" | "color") => {
    const current = values.theme;
    if (mode === "color") {
      form.setValue(
        "theme",
        {
          id: current?.id ?? "custom",
          backgroundMode: "color",
          backgroundColor: current?.backgroundColor ?? "#ffffff",
          accentColor: current?.accentColor,
          roundness: current?.roundness,
        },
        { shouldDirty: true },
      );
    } else {
      form.setValue(
        "theme",
        {
          id: photoThemes[0]?.id ?? "custom",
          backgroundMode: "photo",
          backgroundImage: photoThemes[0]?.backgroundImage,
          backgroundFrom: photoThemes[0]?.backgroundFrom,
          backgroundTo: photoThemes[0]?.backgroundTo,
          accentColor: current?.accentColor,
          roundness: current?.roundness,
        },
        { shouldDirty: true },
      );
    }
  };

  const addQuestion = () => {
    const questions = form.getValues("questions");
    form.setValue(
      "questions",
      [
        ...questions,
        {
          id: generateId(),
          type: "text",
          title: "",
          required: false,
        },
      ],
      { shouldDirty: true },
    );
  };

  const removeQuestion = (questionId: string) => {
    const questions = form.getValues("questions");
    form.setValue(
      "questions",
      questions.filter((q) => q.id !== questionId),
      { shouldDirty: true },
    );
  };

  const reorder = (fromId: string, toId: string) => {
    const questions = form.getValues("questions");
    if (fromId === toId) return;
    const oldIndex = questions.findIndex((q) => q.id === fromId);
    const newIndex = questions.findIndex((q) => q.id === toId);
    if (oldIndex === -1 || newIndex === -1) return;
    form.setValue("questions", arrayMove(questions, oldIndex, newIndex), {
      shouldDirty: true,
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleQuestionDragStart = (event: DragStartEvent) => {
    setActiveQuestionId(String(event.active.id));
    setActiveDragWidth(event.active.rect.current.initial?.width);
  };

  const handleQuestionDragCancel = (_event: DragCancelEvent) => {
    setActiveQuestionId(null);
    setActiveDragWidth(undefined);
  };

  const handleQuestionDragEnd = (event: DragEndEvent) => {
    setActiveQuestionId(null);
    setActiveDragWidth(undefined);

    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorder(String(active.id), String(over.id));
  };

  const performSave = async (): Promise<boolean> => {
    const values = form.getValues();
    setFormStatus(null);
    const questions = flushDraftsIntoForm();
    const issues = runEditorValidation(questions, "save");
    if (issues.length > 0) {
      setFormStatus({
        type: "error",
        message: formatEditorValidationIssues(issues),
      });
      return false;
    }

    setSaving(true);
    try {
      await Promise.all([
        updateFormQuestions(id, questions),
        updateForm(id, {
          title: values.title,
          description: values.description,
          theme: values.theme,
        }),
      ]);
      form.reset({ ...values, questions }, { keepDirty: false });
      setValidationErrors([]);
      setFormStatus(null);
      setSaved(true);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
      return true;
    } catch (err) {
      setFormStatus({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to save form.",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = form.handleSubmit(async () => {
    await performSave();
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        void performSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const handleConnectSheet = async () => {
    if (!sheetUrl.trim()) return;

    setConnecting(true);
    setSheetStatus(null);

    const check = await verifySheetAccess(sheetUrl.trim());
    if (!check.ok) {
      setSheetStatus({ type: "error", message: check.message });
      setConnecting(false);
      return;
    }

    try {
      await connectSheet(id, sheetUrl.trim());
      setFormMeta((prev) =>
        prev ? { ...prev, sheetUrl, sheetName: check.sheetName } : prev,
      );
      setSheetUrl("");
      setSheetStatus(null);
      toast.success("Sheet connected");
    } catch (err) {
      setSheetStatus({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to save sheet connection.",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnectSheet = async () => {
    setDisconnecting(true);
    try {
      await disconnectSheet(id);
      setFormMeta((prev) =>
        prev ? { ...prev, sheetUrl: undefined, sheetName: undefined } : prev,
      );
      toast.success("Sheet disconnected");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to disconnect sheet",
      );
    } finally {
      setDisconnecting(false);
      setDisconnectSheetOpen(false);
    }
  };

  const handlePublish = async () => {
    setFormStatus(null);
    const questions = flushDraftsIntoForm();
    const issues = runEditorValidation(questions, "publish");
    if (issues.length > 0) {
      setFormStatus({
        type: "error",
        message: formatEditorValidationIssues(issues),
      });
      return;
    }

    setPublishing(true);
    try {
      if (form.formState.isDirty) {
        const values = form.getValues();
        await Promise.all([
          updateFormQuestions(id, questions),
          updateForm(id, {
            title: values.title,
            description: values.description,
            theme: values.theme,
          }),
        ]);
        form.reset({ ...values, questions }, { keepDirty: false });
      }

      const published = await publishForm(id);
      setFormMeta((prev) =>
        prev
          ? {
              ...prev,
              isPublished: published.isPublished,
              sheetUrl: published.sheetUrl,
              sheetName: published.sheetName,
            }
          : null,
      );
      setValidationErrors([]);
      setFormStatus(null);
      toast.success("Form is live");
      void refreshForm();
    } catch (err) {
      setFormStatus({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to publish form.",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setUnpublishing(true);
    try {
      const updated = await unpublishForm(id);
      setFormMeta((prev) =>
        prev ? { ...prev, isPublished: updated.isPublished } : null,
      );
      toast.success("Form unpublished");
      void refreshForm();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to unpublish form",
      );
    } finally {
      setUnpublishing(false);
      setUnpublishOpen(false);
    }
  };

  const confirmRemoveQuestion = () => {
    if (!questionToRemove) return;
    removeQuestion(questionToRemove);
    setQuestionToRemove(null);
  };

  const completeLeave = (
    target: { type: "href"; href: string } | { type: "back" },
  ) => {
    allowNavigationRef.current = true;
    setLeaveDialogOpen(false);
    setPendingNavigation(null);
    pendingNavigationRef.current = null;

    if (target.type === "back") {
      router.back();
      return;
    }

    router.push(target.href);
  };

  const navigateAfterLeave = () => {
    const target = pendingNavigationRef.current;
    if (!target) return;
    completeLeave(target);
  };

  const handleLeaveSaveAndGo = async () => {
    const target = pendingNavigationRef.current;
    if (!target) return;
    const ok = await performSave();
    if (!ok) return;
    completeLeave(target);
  };

  const handleDeleteForm = async () => {
    setDeleting(true);
    try {
      allowNavigationRef.current = true;
      await deleteForm(id);
      toast.success("Form deleted");
      router.push("/dashboard");
    } catch (err) {
      allowNavigationRef.current = false;
      toast.error(
        err instanceof Error ? err.message : "Failed to delete form",
      );
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const values = useWatch({ control: form.control }) as FormValues;
  const questionIds = useMemo(
    () => values.questions.map((question) => question.id),
    [values.questions],
  );
  const activeQuestion = useMemo(
    () =>
      activeQuestionId
        ? values.questions.find((question) => question.id === activeQuestionId)
        : undefined,
    [activeQuestionId, values.questions],
  );

  const themeBackgroundMode = values.theme?.backgroundMode ?? "color";
  const themeAccentColor = values.theme?.accentColor ?? "#0a0a0a";

  useFormEditToolbar(
    {
      saving,
      saved,
      isDirty,
      publishing,
      unpublishing,
      deleting,
      isPublished: formMeta?.isPublished ?? false,
    },
    {
      onPreview: () => {
        const current = form.getValues();
        setPreviewSnapshot({
          title: current.title,
          description: current.description,
          questions: current.questions,
          theme: current.theme,
          includesUnsavedChanges: form.formState.isDirty,
        });
        setPreviewSession((session) => session + 1);
        if (isPreviewIntroSkipped()) {
          setPreviewOpen(true);
        } else {
          setPreviewIntroOpen(true);
        }
      },
      onSave: () => void handleSave(),
      onPublish: () => void handlePublish(),
      onRequestUnpublish: () => setUnpublishOpen(true),
      onRequestDelete: () => setDeleteOpen(true),
    },
  );

  if (loading) {
    return <FormPageSkeleton variant="editor" />;
  }

  if (!formMeta) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center">
        <p className="text-lg font-semibold">Form not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">
            <ArrowLeft weight="bold" className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <BreadcrumbFormTitleSync
        title={values.title.trim() || "Untitled form"}
      />
      {formStatus && (
        <div className="mb-6 flex items-start gap-2 text-sm text-destructive">
          <Warning weight="fill" className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="whitespace-pre-line">{formStatus.message}</div>
        </div>
      )}

      <div className="space-y-3">
        <AutoResizeTextarea
          value={values.title}
          onChange={(e) =>
            form.setValue("title", e.target.value, { shouldDirty: true })
          }
          className="min-h-0 border-0 bg-transparent px-1 py-0 font-heading text-3xl font-bold leading-tight placeholder:text-muted-foreground/50 focus-visible:ring-0 sm:text-4xl md:text-4xl"
          placeholder="Untitled form"
        />
        <AutoResizeTextarea
          value={values.description}
          onChange={(e) =>
            form.setValue("description", e.target.value, { shouldDirty: true })
          }
          className="min-h-0 border-0 bg-transparent px-1 py-0 text-lg text-muted-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 md:text-lg"
          placeholder="Describe what this form is for"
        />
      </div>

      <Card className="mt-6 shadow-none">
        <CardContent>
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className={cn("group/collapsible-trigger flex w-full items-start justify-between gap-4 rounded-lg text-left outline-none transition hover:bg-muted/50 -mx-2 px-2 py-1", focusControl)}>
              <div>
                <Label className="text-sm font-semibold">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Customize how the public form looks and feels.
                </p>
              </div>
              <ChevronDownIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-panel-open/collapsible-trigger:rotate-180" />
            </CollapsibleTrigger>

            <CollapsibleContent keepMounted className="pt-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Background
                </Label>
                <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
                  {(
                    [
                      { value: "color", label: "Color", icon: Palette },
                      { value: "photo", label: "Photo", icon: ImageSquare },
                    ] as const
                  ).map((mode) => {
                    const Icon = mode.icon;
                    const active = themeBackgroundMode === mode.value;
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setBackgroundMode(mode.value)}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
                          active
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon weight="bold" className="h-3.5 w-3.5" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {themeBackgroundMode === "color" ? (
                <div className="space-y-4">
                  <ColorField
                    label="Background color"
                    description="The page behind your form."
                    value={values.theme?.backgroundColor ?? "#ffffff"}
                    onChange={(color) =>
                      updateTheme({
                        backgroundColor: color,
                        backgroundImage: undefined,
                        backgroundFrom: undefined,
                        backgroundTo: undefined,
                      })
                    }
                  />

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">
                      Quick styles
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {colorPresets.map((preset) => {
                        const selected =
                          values.theme?.backgroundColor?.toLowerCase() ===
                            preset.background.toLowerCase() &&
                          values.theme?.accentColor?.toLowerCase() ===
                            preset.accent.toLowerCase();
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              updateTheme({
                                backgroundColor: preset.background,
                                accentColor: preset.accent,
                                backgroundImage: undefined,
                                backgroundFrom: undefined,
                                backgroundTo: undefined,
                              })
                            }
                            className={cn(
                              "group relative h-8 w-8 overflow-hidden rounded-lg border transition hover:scale-105 focus-visible:outline-none",
                              focusControl,
                              selected ? "border-foreground" : "border-border",
                            )}
                            title={preset.label}
                          >
                            <div
                              className="absolute inset-0"
                              style={{ backgroundColor: preset.background }}
                            />
                            <div
                              className="absolute bottom-0 left-0 right-0 h-1"
                              style={{ backgroundColor: preset.accent }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
                  {photoThemes.map((theme) => {
                    const selected = values.theme?.id === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() =>
                          form.setValue(
                            "theme",
                            {
                              id: theme.id,
                              backgroundMode: "photo",
                              backgroundImage: theme.backgroundImage,
                              backgroundFrom: theme.backgroundFrom,
                              backgroundTo: theme.backgroundTo,
                              accentColor: values.theme?.accentColor,
                              roundness: values.theme?.roundness,
                            },
                            { shouldDirty: true },
                          )
                        }
                        className={cn(
                          "group relative aspect-square overflow-hidden rounded-xl border transition",
                          selected
                            ? "border-primary ring-2 ring-primary ring-offset-2"
                            : "border-border hover:border-primary/30",
                        )}
                        title={theme.label}
                      >
                        {theme.backgroundImage ? (
                          <Image
                            src={theme.backgroundImage}
                            alt={theme.label}
                            fill
                            sizes="120px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium text-muted-foreground">
                            {theme.label}
                          </div>
                        )}
                        {theme.backgroundFrom && theme.backgroundTo && (
                          <div
                            className="pointer-events-none absolute inset-0 opacity-60 mix-blend-multiply"
                            style={{
                              background: `linear-gradient(160deg, ${theme.backgroundFrom} 0%, ${theme.backgroundTo} 100%)`,
                            }}
                          />
                        )}
                        {selected && (
                          <div className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check weight="bold" className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <ColorField
                label="Accent color"
                description="Buttons, selected answers, and the progress bar."
                value={themeAccentColor}
                onChange={(color) => updateTheme({ accentColor: color })}
              />

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Roundness
                </Label>
                <div className="flex gap-2">
                  {(
                    [
                      {
                        value: "sharp",
                        label: "Sharp",
                        radius: `calc(${radiusForRoundness("sharp")} * 0.5)`,
                      },
                      {
                        value: "soft",
                        label: "Soft",
                        radius: `calc(${radiusForRoundness("soft")} * 0.5)`,
                      },
                      {
                        value: "round",
                        label: "Round",
                        radius: `calc(${radiusForRoundness("round")} * 0.5)`,
                      },
                    ] as const
                  ).map((r) => {
                    const active =
                      (values.theme?.roundness ?? "round") === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => updateTheme({ roundness: r.value })}
                        className={cn(
                          "group flex flex-1 flex-col items-center gap-2 rounded-xl border px-3 py-3 transition",
                          active
                            ? "border-primary/60 bg-secondary/60"
                            : "border-border hover:border-primary/30",
                        )}
                      >
                        <span
                          className={cn(
                            "h-6 w-6 border-2 transition-colors",
                            active
                              ? "border-foreground"
                              : "border-foreground/30 group-hover:border-foreground/50",
                          )}
                          style={{ borderRadius: r.radius }}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium",
                            active
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex h-full min-h-[280px] flex-col gap-2 lg:sticky lg:top-4">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                Preview
              </Label>
              <div className="relative min-h-[260px] flex-1 overflow-hidden rounded-xl border border-border">
                <FormBackground
                  theme={values.theme}
                  className="absolute inset-0 p-3"
                >
                  <FormThemeProvider
                    theme={values.theme}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <div className="relative z-10 w-full rounded-[var(--form-radius)] border border-border bg-card p-3.5 shadow-lg">
                      <div className="space-y-1.5 pb-4">
                        <div className="h-2 w-3/4 rounded-full bg-foreground/20" />
                        <div className="h-2 w-1/2 rounded-full bg-foreground/10" />
                      </div>

                      <div className="space-y-2">
                        <div className="h-8 w-full rounded-[var(--form-radius)] border border-input bg-secondary" />
                        <div className="h-8 w-full rounded-[var(--form-radius)] border border-input bg-secondary" />
                        <div className="h-8 w-full rounded-[var(--form-radius)] border border-input bg-secondary" />
                      </div>

                      <button
                        type="button"
                        className={themedButtonClasses(
                          "mt-4 h-8 w-full text-xs",
                        )}
                      >
                        Continue
                      </button>
                    </div>
                  </FormThemeProvider>
                </FormBackground>
              </div>
            </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <SheetConnectionCard
        sheetsEmail={sheetsEmail}
        sheetUrl={sheetUrl}
        onSheetUrlChange={setSheetUrl}
        connectedSheetUrl={formMeta?.sheetUrl}
        onConnect={handleConnectSheet}
        onDisconnect={() => setDisconnectSheetOpen(true)}
        connecting={connecting}
        disconnecting={disconnecting}
        sheetStatus={sheetStatus}
        onClearStatus={() => setSheetStatus(null)}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleQuestionDragStart}
        onDragCancel={handleQuestionDragCancel}
        onDragEnd={handleQuestionDragEnd}
      >
        <SortableContext
          items={questionIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="mt-8 space-y-4">
            <AnimatePresence initial={false}>
              {values.questions.map((q) => {
                const questionIssues = validationErrors.filter(
                  (issue) => issue.questionId === q.id,
                );

                return (
                <QuestionSortableItem key={q.id} id={q.id}>
                  {({ dragHandleProps, isDragging }) => (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                    >
                      <Card className="shadow-none">
                        <CardContent>
                          <div className="flex items-start gap-4">
                            <button
                              type="button"
                              {...dragHandleProps}
                              className={cn(
                                "mt-2 touch-none text-muted-foreground hover:text-foreground",
                                isDragging
                                  ? "cursor-grabbing"
                                  : "cursor-grab active:cursor-grabbing",
                              )}
                              aria-label="Drag to reorder"
                            >
                              <DotsSixVertical className="h-5 w-5" />
                            </button>
                      <div className="flex-1">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                          <AutoResizeTextarea
                            value={q.title}
                            onChange={(e) =>
                              updateQuestion(q.id, { title: e.target.value })
                            }
                            className="min-h-10 flex-1 bg-secondary px-3 py-2 font-semibold"
                            placeholder="Question"
                          />
                          <QuestionTypeSelect
                            value={q.type}
                            onValueChange={(type) =>
                              updateQuestion(q.id, {
                                type,
                                ...(type === "file"
                                  ? {
                                      allowedFilePresets:
                                        q.allowedFilePresets ??
                                        [...DEFAULT_FILE_UPLOAD_PRESETS],
                                      customFileTypes: q.customFileTypes ?? "",
                                    }
                                  : {}),
                              })
                            }
                          />
                        </div>

                        {(q.type === "single_select" ||
                          q.type === "multi_select" ||
                          q.type === "ranking") && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                Options (one per line)
                              </Label>
                              <Textarea
                                value={
                                  q.id in optionDrafts
                                    ? optionDrafts[q.id]
                                    : (q.options ?? [])
                                        .map((o) => o.label)
                                        .join("\n")
                                }
                                onChange={(e) =>
                                  setOptionDrafts((prev) => ({
                                    ...prev,
                                    [q.id]: e.target.value,
                                  }))
                                }
                                onBlur={(e) =>
                                  commitOptions(q.id, e.target.value)
                                }
                                rows={3}
                                className="mt-1.5 bg-secondary px-3 py-2"
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                              />
                            </div>
                          </div>
                        )}

                        {q.type === "matrix" && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                Rows (one per line)
                              </Label>
                              <Textarea
                                value={
                                  matrixDrafts[q.id]?.rows ??
                                  (q.rows ?? []).join("\n")
                                }
                                onChange={(e) =>
                                  setMatrixDrafts((prev) => ({
                                    ...prev,
                                    [q.id]: {
                                      rows: e.target.value,
                                      columns:
                                        prev[q.id]?.columns ??
                                        (q.columns ?? []).join("\n"),
                                    },
                                  }))
                                }
                                onBlur={(e) =>
                                  commitMatrix(
                                    q.id,
                                    e.target.value,
                                    matrixDrafts[q.id]?.columns ??
                                      (q.columns ?? []).join("\n"),
                                  )
                                }
                                rows={3}
                                className="mt-1.5 bg-secondary px-3 py-2"
                                placeholder="Row 1&#10;Row 2&#10;Row 3"
                              />
                            </div>
                            <div>
                              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                                Columns (one per line)
                              </Label>
                              <Textarea
                                value={
                                  matrixDrafts[q.id]?.columns ??
                                  (q.columns ?? []).join("\n")
                                }
                                onChange={(e) =>
                                  setMatrixDrafts((prev) => ({
                                    ...prev,
                                    [q.id]: {
                                      rows:
                                        prev[q.id]?.rows ??
                                        (q.rows ?? []).join("\n"),
                                      columns: e.target.value,
                                    },
                                  }))
                                }
                                onBlur={(e) =>
                                  commitMatrix(
                                    q.id,
                                    matrixDrafts[q.id]?.rows ??
                                      (q.rows ?? []).join("\n"),
                                    e.target.value,
                                  )
                                }
                                rows={3}
                                className="mt-1.5 bg-secondary px-3 py-2"
                                placeholder="Column 1&#10;Column 2&#10;Column 3"
                              />
                            </div>
                          </div>
                        )}

                        {q.type === "file" && (
                          <FileUploadPresetPicker
                            presets={q.allowedFilePresets}
                            customFileTypes={q.customFileTypes}
                            onPresetsChange={(allowedFilePresets) =>
                              updateQuestion(q.id, { allowedFilePresets })
                            }
                            onCustomFileTypesChange={(customFileTypes) =>
                              updateQuestion(q.id, { customFileTypes })
                            }
                          />
                        )}

                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`required-${q.id}`}
                              checked={q.required}
                              onCheckedChange={(checked) =>
                                updateQuestion(q.id, {
                                  required: checked === true,
                                })
                              }
                            />
                            <Label
                              htmlFor={`required-${q.id}`}
                              className="text-sm font-medium"
                            >
                              Required
                            </Label>
                          </div>
                          <Button
                            onClick={() => setQuestionToRemove(q.id)}
                            variant="ghost"
                            size="icon"
                            className="ml-auto text-destructive hover:text-destructive"
                            aria-label="Remove question"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>

                        {questionIssues.length > 0 && (
                          <div className="mt-4 space-y-1">
                            {questionIssues.map((issue) => (
                              <p
                                key={`${issue.field}-${issue.message}`}
                                className="flex items-start gap-2 text-sm text-destructive"
                              >
                                <Warning
                                  weight="fill"
                                  className="mt-0.5 h-4 w-4 shrink-0"
                                />
                                <span>{issue.message}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                        </div>
                      </CardContent>
                    </Card>
                    </motion.div>
                  )}
                </QuestionSortableItem>
                );
              })}
            </AnimatePresence>
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activeQuestion ? (
            <div style={{ width: activeDragWidth }}>
              <QuestionDragPreview question={activeQuestion} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Button
        onClick={addQuestion}
        variant="outline"
        className="mt-6 h-auto w-full rounded-[1.75rem] border-dashed py-4 text-muted-foreground hover:text-foreground"
      >
        <Plus weight="bold" className="h-4 w-4" />
        Add question
      </Button>

      <AlertDialog
        open={leaveDialogOpen}
        onOpenChange={(open) => {
          setLeaveDialogOpen(open);
          if (!open) {
            setPendingNavigation(null);
            pendingNavigationRef.current = null;
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave without saving?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Save before leaving or your edits will be
              lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingNavigation(null)}>
              Stay
            </AlertDialogCancel>
            <Button variant="outline" onClick={navigateAfterLeave}>
              Leave
            </Button>
            <Button onClick={() => void handleLeaveSaveAndGo()}>
              Save and leave
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={questionToRemove !== null}
        onOpenChange={(open) => {
          if (!open) setQuestionToRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this question?</AlertDialogTitle>
            <AlertDialogDescription>
              This question will be removed from your form. You can undo by not
              saving, or save to persist the change.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveQuestion}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={disconnectSheetOpen} onOpenChange={setDisconnectSheetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Google Sheet?</AlertDialogTitle>
            <AlertDialogDescription>
              New responses will no longer sync to this sheet until you
              connect another one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDisconnectSheet()}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={unpublishOpen} onOpenChange={setUnpublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unpublish this form?</AlertDialogTitle>
            <AlertDialogDescription>
              The public link will stop accepting responses until you publish
              again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleUnpublish()}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FormPreviewIntroDialog
        open={previewIntroOpen}
        onOpenChange={setPreviewIntroOpen}
        includesUnsavedChanges={previewSnapshot?.includesUnsavedChanges}
        onContinue={(dontShowAgain) => {
          if (dontShowAgain) {
            setPreviewIntroSkipped();
          }
          setPreviewIntroOpen(false);
          setPreviewOpen(true);
        }}
      />

      <FormPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        formId={id}
        snapshot={previewSnapshot}
        sessionKey={previewSession}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this form?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the form, all questions, responses, and
              uploaded files. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteForm()}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete form"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
