"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useForm,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Question, FileAnswerReference } from "@/lib/types";
import {
  buildSubmissionSchema,
  defaultAnswerForQuestion,
  formatDateAnswer,
  normalizeAnswersForQuestions,
  parseDateAnswer,
  sanitizeSubmissionBody,
} from "@/lib/validation";
import {
  ArrowLeft,
  CalendarBlank,
  Check,
  Star,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { focusControl } from "@/lib/focus-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
  ResponsiveOverlay,
  ResponsiveOverlayContent,
  ResponsiveOverlayTrigger,
} from "@/components/ui/responsive-overlay";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { format } from "date-fns";
import type { FormTheme } from "@/lib/types";
import {
  FormThemeProvider,
  FormThemeScope,
  themedButtonClasses,
} from "@/components/form-theme";
import { FileUploadInput } from "@/components/form-renderer/file-upload-input";
import {
  getFooterHint,
  getMobileFooterInstruction,
} from "@/lib/form-contextual-hints";
import {
  PublicFormBody,
  PublicFormFooter,
  PublicFormHeader,
  PublicFormIntro,
  PublicFormSuccess,
  publicFormCardClasses,
  publicFormInputClasses,
  publicFormPhoneShellClasses,
} from "@/components/form-renderer/public-form-layout";
import { PhoneInput } from "@/components/ui/phone-input";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  clearFormDraft,
  loadFormDraft,
  questionFingerprint,
  saveFormDraft,
} from "@/lib/form-draft-storage";
import {
  fieldErrorIdForQuestion,
  fieldIdForQuestion,
} from "@/lib/form-field-ids";

export interface FormRendererProps {
  formId?: string;
  title?: string;
  description?: string;
  questions: Question[];
  onSubmit?: (
    answers: Record<string, unknown>,
  ) => void | Promise<void | { preview?: boolean }>;
  onChange?: (answers: Record<string, unknown>) => void;
  brand?: React.ReactNode;
  stepped?: boolean;
  step?: number;
  onStepChange?: (step: number | null) => void;
  className?: string;
  theme?: FormTheme;
}

const stepTransition = {
  duration: 0.12,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

const successTransition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

type FormValues = Record<string, unknown>;

function focusQuestionField(questionId: string, reducedMotion: boolean) {
  const root = document.querySelector(`[data-question-id="${questionId}"]`);
  const el = root?.querySelector<HTMLElement>(
    "input, textarea, button[type='button']",
  );
  el?.focus({ preventScroll: true });
  (el ?? root)?.scrollIntoView({
    block: "center",
    behavior: reducedMotion ? "auto" : "smooth",
  });
}

export function FormRenderer({
  formId,
  title,
  description,
  questions,
  onSubmit,
  brand,
  stepped = true,
  step: controlledStep,
  onStepChange,
  className,
  theme,
}: FormRendererProps) {
  const [internalStep, setInternalStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [errorShakeKey, setErrorShakeKey] = useState(0);
  const draftLoadedRef = useRef(false);
  const reducedMotion = useReducedMotion();
  const stepMotion = reducedMotion ? { duration: 0 } : stepTransition;
  const successMotion = reducedMotion ? { duration: 0 } : successTransition;

  const isControlled = controlledStep !== undefined;
  const step = isControlled ? (controlledStep ?? 0) : internalStep;

  const setStep = useCallback(
    (next: number | ((prev: number) => number) | null) => {
      if (isControlled) {
        if (next === null) {
          onStepChange?.(null);
          return;
        }
        const value =
          typeof next === "function" ? next(controlledStep ?? 0) : next;
        onStepChange?.(value);
        return;
      }

      if (next === null) {
        setInternalStep(0);
        return;
      }

      setInternalStep((prev) =>
        typeof next === "function" ? next(prev) : next,
      );
    },
    [controlledStep, isControlled, onStepChange],
  );

  useEffect(() => {
    if (isControlled) return;
    onStepChange?.(internalStep);
  }, [internalStep, isControlled, onStepChange]);

  const schema = useMemo(() => buildSubmissionSchema(questions), [questions]);
  const defaultValues = useMemo(() => {
    const values: FormValues = {};
    for (const q of questions) {
      values[q.id] = defaultAnswerForQuestion(q);
    }
    return values;
  }, [questions]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  const questionIds = useMemo(() => questions.map((q) => q.id), [questions]);
  const draftKey = formId;

  const visibleQuestions = useMemo(() => {
    return title || description
      ? [{ id: "__intro", type: "welcome" as const, title, description }]
      : [];
  }, [title, description]);

  const allSteps = useMemo(
    () => [...visibleQuestions, ...questions],
    [visibleQuestions, questions],
  );

  useEffect(() => {
    if (!draftKey) {
      form.reset(defaultValues, { keepDefaultValues: false });
      return;
    }
    if (draftLoadedRef.current) return;
    draftLoadedRef.current = true;

    const draft = loadFormDraft(draftKey, questionIds);
    if (!draft) {
      form.reset(defaultValues, { keepDefaultValues: false });
      return;
    }

    form.reset(
      {
        ...defaultValues,
        ...normalizeAnswersForQuestions(questions, draft.answers),
      },
      { keepDefaultValues: false },
    );
    const maxStep = Math.max(0, visibleQuestions.length + questions.length - 1);
    const restoredStep = Math.min(Math.max(0, draft.step), maxStep);
    setStep(restoredStep);
  }, [
    draftKey,
    defaultValues,
    form,
    questionIds,
    questions.length,
    setStep,
    visibleQuestions.length,
  ]);

  useEffect(() => {
    if (!draftKey || complete) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const sub = form.watch(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        saveFormDraft(draftKey, {
          answers: normalizeAnswersForQuestions(questions, form.getValues()),
          step,
          questionFingerprint: questionFingerprint(questionIds),
        });
      }, 400);
    });

    return () => {
      if (timer) clearTimeout(timer);
      sub.unsubscribe();
    };
  }, [complete, draftKey, form, questionIds, questions, step]);

  const currentStep = allSteps[step];
  const currentQuestion =
    currentStep?.type === "welcome" ? null : (currentStep as Question);

  useEffect(() => {
    if (complete || !currentQuestion) return;
    const focusableTypes = [
      "text",
      "email",
      "phone",
      "number",
      "url",
      "textarea",
      "date",
      "signature",
    ];
    if (!focusableTypes.includes(currentQuestion.type)) return;
    const el = document.querySelector<HTMLElement>(
      `[data-question-id="${currentQuestion.id}"] input, [data-question-id="${currentQuestion.id}"] textarea`,
    );
    el?.focus();
  }, [step, complete, currentQuestion]);

  const handleNext = useCallback(async () => {
    setSubmitError(null);

    if (fileUploading) return;

    if (!currentQuestion) {
      setStep((s) => s + 1);
      return;
    }

    const valid = await form.trigger(currentQuestion.id);
    if (!valid) {
      focusQuestionField(currentQuestion.id, reducedMotion);
      return;
    }

    if (step < allSteps.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    await form.handleSubmit(async (data) => {
      setIsSubmitting(true);
      try {
        await onSubmit?.(
          sanitizeSubmissionBody(questions, data as Record<string, unknown>),
        );
        if (draftKey) clearFormDraft(draftKey);
        setComplete(true);
        if (isControlled) onStepChange?.(null);
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Something went wrong",
        );
        setErrorShakeKey((key) => key + 1);
      } finally {
        setIsSubmitting(false);
      }
    })();
  }, [
    allSteps.length,
    currentQuestion,
    draftKey,
    fileUploading,
    form,
    onSubmit,
    questions,
    reducedMotion,
    setStep,
    step,
    isControlled,
    onStepChange,
  ]);

  const handleSingleSelectPick = useCallback(() => {
    if (step >= allSteps.length - 1) return;
    window.setTimeout(() => void handleNext(), 100);
  }, [allSteps.length, handleNext, step]);

  useEffect(() => {
    if (!stepped || complete) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.metaKey || e.ctrlKey) return;
      const target = e.target as HTMLElement;
      if (target.isContentEditable) return;
      if (target.closest("[data-radix-popper-content-wrapper]")) return;

      if (target.tagName === "TEXTAREA") {
        if (e.shiftKey) return;
        e.preventDefault();
        void handleNext();
        return;
      }

      if (e.shiftKey) return;
      e.preventDefault();
      void handleNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [complete, handleNext, stepped]);

  const handleBack = () => {
    if (step > 0) {
      setSubmitError(null);
      setStep((s) => s - 1);
    }
  };

  const handleReset = () => {
    form.reset(defaultValues);
    setStep(0);
    if (isControlled) onStepChange?.(null);
    setSubmitError(null);
    setComplete(false);
    if (draftKey) clearFormDraft(draftKey);
  };

  const progress = useMemo(() => {
    const total = allSteps.length || 1;
    return ((step + 1) / total) * 100;
  }, [step, allSteps.length]);

  const currentError = currentQuestion
    ? (form.formState.errors[currentQuestion.id]?.message as string | undefined)
    : undefined;

  if (!stepped) {
    return (
      <FormThemeProvider
        theme={theme}
        className={cn("mx-auto max-w-xl", className)}
      >
        <form
          onSubmit={form.handleSubmit(async (data) => {
            setIsSubmitting(true);
            try {
              await onSubmit?.(
                sanitizeSubmissionBody(
                  questions,
                  data as Record<string, unknown>,
                ),
              );
              setComplete(true);
            } catch (err) {
              setSubmitError(
                err instanceof Error ? err.message : "Something went wrong",
              );
            } finally {
              setIsSubmitting(false);
            }
          })}
        >
          <div className="space-y-4">
            {title && (
              <div className="space-y-1">
                <h1 className="font-heading text-3xl font-bold tracking-tight">
                  {title}
                </h1>
                {description && (
                  <p className="text-muted-foreground">{description}</p>
                )}
              </div>
            )}
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                formId={formId}
                question={q}
                register={form.register}
                setValue={form.setValue}
                watch={form.watch}
              />
            ))}
            <AnimatePresence>
              {submitError && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-destructive"
                >
                  <Warning weight="fill" className="h-4 w-4" />
                  {submitError}
                </motion.p>
              )}
            </AnimatePresence>
            <button
              type="submit"
              disabled={isSubmitting}
              className={themedButtonClasses("w-full")}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </FormThemeProvider>
    );
  }

  const questionIndex = step - visibleQuestions.length;
  const stepLabel = currentQuestion
    ? questions.length > 1
      ? `${questionIndex + 1} of ${questions.length}`
      : "Your response"
    : "Getting started";

  const continueLabel =
    step === 0 && !currentQuestion
      ? "Start"
      : step === allSteps.length - 1
        ? "Submit"
        : "Continue";

  const footerHint = getFooterHint(currentQuestion, !currentQuestion);
  const mobileFooterInstruction = getMobileFooterInstruction(
    currentQuestion,
    !currentQuestion,
  );

  return (
    <FormThemeProvider
      theme={theme}
      className={cn(
        "@container relative z-10 mx-auto flex w-full min-h-0 max-h-full flex-col sm:max-w-2xl",
        className,
      )}
    >
      {brand ? (
        <div className="mb-0 hidden shrink-0 items-center gap-2 px-1 text-sm font-semibold text-foreground sm:mb-4 sm:flex">
          {brand}
        </div>
      ) : null}

      <div className={publicFormCardClasses(theme)}>
        {complete ? (
          <PublicFormSuccess
            onReset={handleReset}
            showReset={Boolean(onSubmit)}
            successMotion={successMotion}
          />
        ) : (
          <>
            <PublicFormHeader
              stepLabel={stepLabel}
              progress={progress}
              canGoBack={step > 0}
              onBack={handleBack}
            />

            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {currentQuestion
                ? `Question ${questionIndex + 1} of ${questions.length}: ${currentQuestion.title}`
                : title
                  ? `Getting started: ${title}`
                  : "Getting started"}
            </div>

            <PublicFormBody
              stepKey={currentStep?.id ?? "empty"}
              stepMotion={stepMotion}
              variant={currentQuestion ? "question" : "intro"}
            >
              {currentQuestion ? (
                <QuestionCard
                  formId={formId}
                  question={currentQuestion}
                  register={form.register}
                  setValue={form.setValue}
                  watch={form.watch}
                  hideCard
                  fieldError={currentError}
                  onSingleSelectPick={handleSingleSelectPick}
                  onFileUploadingChange={setFileUploading}
                />
              ) : (
                <PublicFormIntro title={title} description={description} />
              )}

              <AnimatePresence>
                {submitError && (
                  <motion.p
                    key={errorShakeKey}
                    initial={{ opacity: 0, y: -8 }}
                    animate={
                      reducedMotion
                        ? { opacity: 1, y: 0 }
                        : {
                            opacity: 1,
                            y: 0,
                            x: [0, -6, 6, -3, 3, 0],
                          }
                    }
                    exit={{ opacity: 0, y: -8 }}
                    transition={
                      reducedMotion ? { duration: 0 } : { duration: 0.2 }
                    }
                    className="mt-6 flex items-center gap-2 rounded-[var(--form-radius)] border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm font-medium text-destructive"
                    role="alert"
                  >
                    <Warning weight="fill" className="size-4 shrink-0" />
                    {submitError}
                  </motion.p>
                )}
              </AnimatePresence>
            </PublicFormBody>

            <PublicFormFooter
              onContinue={() => void handleNext()}
              disabled={isSubmitting || fileUploading}
              isSubmitting={isSubmitting}
              label={continueLabel}
              footerHint={footerHint}
              mobileInstruction={mobileFooterInstruction}
              continueDisabledReason={
                fileUploading ? "Wait for the upload to finish" : null
              }
            />
          </>
        )}
      </div>
    </FormThemeProvider>
  );
}

function QuestionCard({
  formId,
  question,
  register,
  setValue,
  watch,
  hideCard = false,
  fieldError,
  onSingleSelectPick,
  onFileUploadingChange,
}: {
  formId?: string;
  question: Question;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
  hideCard?: boolean;
  fieldError?: string;
  onSingleSelectPick?: () => void;
  onFileUploadingChange?: (uploading: boolean) => void;
}) {
  const inputId = fieldIdForQuestion(question.id);
  const errorId = fieldErrorIdForQuestion(question.id);

  const content = (
    <>
      <div className="space-y-4 sm:space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:text-[11px]",
              question.required
                ? "bg-muted text-muted-foreground"
                : "bg-muted/60 text-muted-foreground/80",
            )}
          >
            {question.required ? "Required" : "Optional"}
          </span>
        </div>
        <Label
          htmlFor={
            [
              "single_select",
              "multi_select",
              "rating",
              "nps",
              "ranking",
              "matrix",
              "switch",
              "file",
            ].includes(question.type)
              ? undefined
              : inputId
          }
          className="block whitespace-pre-wrap text-[1.75rem] font-bold leading-[1.12] tracking-tight text-balance sm:text-[clamp(1.375rem,3.5cqi+0.75rem,2rem)] sm:font-semibold sm:leading-snug"
        >
          {question.title}
        </Label>
        {question.description ? (
          <p className="max-w-prose text-[1.0625rem] leading-relaxed text-muted-foreground text-pretty sm:text-base">
            {question.description}
          </p>
        ) : null}
      </div>
      <div className="pt-2 sm:pt-1" data-question-id={question.id}>
        <QuestionInput
          formId={formId}
          question={question}
          register={register}
          setValue={setValue}
          watch={watch}
          inputId={inputId}
          fieldError={fieldError}
          onSingleSelectPick={onSingleSelectPick}
          onFileUploadingChange={onFileUploadingChange}
        />
        {fieldError ? (
          <p
            id={errorId}
            role="alert"
            className="mt-2 flex items-center gap-1.5 text-sm font-medium text-destructive"
          >
            <Warning weight="fill" className="size-4 shrink-0" />
            {fieldError}
          </p>
        ) : null}
      </div>
    </>
  );

  if (hideCard) {
    return <div className="space-y-7 sm:space-y-6">{content}</div>;
  }

  return (
    <div className="rounded-[var(--form-radius)] border border-border bg-card p-5 shadow-none sm:p-6">
      {content}
    </div>
  );
}

function QuestionInput({
  formId,
  question,
  register,
  setValue,
  watch,
  inputId,
  fieldError,
  onSingleSelectPick,
  onFileUploadingChange,
}: {
  formId?: string;
  question: Question;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
  inputId: string;
  fieldError?: string;
  onSingleSelectPick?: () => void;
  onFileUploadingChange?: (uploading: boolean) => void;
}) {
  const value = watch(question.id);
  const [openDateId, setOpenDateId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const errorId = fieldErrorIdForQuestion(question.id);
  const invalidProps = fieldError
    ? { "aria-invalid": true as const, "aria-describedby": errorId }
    : {};

  const handleChange = (next: unknown) => {
    setValue(question.id, next, { shouldValidate: true, shouldDirty: true });
  };

  switch (question.type) {
    case "text":
    case "email":
    case "number":
    case "url": {
      const registered = register(question.id);
      return (
        <Input
          {...registered}
          id={inputId}
          {...invalidProps}
          type={question.type === "number" ? "number" : question.type}
          placeholder={question.placeholder}
          autoComplete={
            question.type === "email"
              ? "email"
              : question.id.toLowerCase().includes("name")
                ? "name"
                : undefined
          }
          className={publicFormInputClasses}
        />
      );
    }
    case "phone": {
      return (
        <PhoneInput
          id={inputId}
          value={(value as string) || undefined}
          onChange={(next) => handleChange(next ?? "")}
          placeholder={question.placeholder ?? "Enter phone number"}
          shellClassName={publicFormPhoneShellClasses}
          {...invalidProps}
        />
      );
    }
    case "textarea": {
      const registered = register(question.id);
      return (
        <Textarea
          {...registered}
          id={inputId}
          {...invalidProps}
          placeholder={question.placeholder}
          rows={4}
          className={cn(publicFormInputClasses, "min-h-[8rem] resize-none")}
        />
      );
    }
    case "single_select":
      return (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
          {question.options?.map((opt) => {
            const selected = value === opt.value;
            return (
              <OptionButton
                key={opt.value}
                selected={selected}
                onClick={() => {
                  handleChange(opt.value);
                  onSingleSelectPick?.();
                }}
                title={opt.label}
              >
                {opt.label}
              </OptionButton>
            );
          })}
        </div>
      );
    case "multi_select":
      return (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
          {question.options?.map((opt) => {
            const selected = ((value as string[]) || []).includes(opt.value);
            return (
              <OptionButton
                key={opt.value}
                selected={selected}
                onClick={() => {
                  const current = (value as string[]) || [];
                  handleChange(
                    selected
                      ? current.filter((v) => v !== opt.value)
                      : [...current, opt.value],
                  );
                }}
                multiple
                title={opt.label}
              >
                {opt.label}
              </OptionButton>
            );
          })}
        </div>
      );
    case "rating": {
      const maxRating = question.maxRating ?? 5;
      return (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {Array.from({ length: maxRating }, (_, i) => i + 1).map((num) => {
            const selected = typeof value === "number" && value >= num;
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleChange(num)}
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl transition active:scale-95 sm:size-12",
                  focusControl,
                  selected
                    ? "text-amber-400"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-amber-300/80",
                )}
                aria-label={`Rate ${num} out of ${maxRating}`}
              >
                <Star
                  weight={selected ? "fill" : "regular"}
                  className="size-8 sm:size-9"
                />
              </button>
            );
          })}
        </div>
      );
    }
    case "nps": {
      return (
        <div className="space-y-3">
          <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max snap-x snap-mandatory gap-1.5 sm:min-w-0 sm:grid sm:grid-cols-11 sm:gap-2">
              {Array.from({ length: 11 }, (_, i) => i).map((num) => {
                const selected = value === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleChange(num)}
                    className={cn(
                      "flex size-11 shrink-0 snap-start items-center justify-center rounded-xl border text-sm font-semibold transition active:scale-95 sm:size-auto sm:min-h-11 sm:flex-1",
                      focusControl,
                      selected
                        ? "border-[var(--form-accent,var(--primary))] bg-[var(--form-accent,var(--primary))] text-[var(--form-accent-contrast,var(--primary-foreground))]"
                        : "border-border bg-card text-muted-foreground hover:border-[var(--form-accent,var(--primary))]/30 hover:bg-muted/40",
                    )}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Not likely</span>
            <span>Very likely</span>
          </div>
        </div>
      );
    }
    case "ranking":
      return (
        <RankingInput
          question={question}
          value={value}
          onChange={handleChange}
        />
      );
    case "matrix":
      return (
        <MatrixInput
          question={question}
          value={value}
          onChange={handleChange}
        />
      );
    case "date": {
      const open = openDateId === question.id;
      const setOpen = (next: boolean) =>
        setOpenDateId(next ? question.id : null);
      const validDate = parseDateAnswer(value);

      return (
        <ResponsiveOverlay
          open={open}
          onOpenChange={setOpen}
          title="Pick a date"
        >
          <ResponsiveOverlayTrigger
            className={cn(
              "flex w-full items-center justify-start px-4 text-left font-normal outline-none transition-colors hover:bg-muted/90",
              publicFormInputClasses,
              !validDate && "text-muted-foreground",
            )}
          >
            <CalendarBlank className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {validDate ? format(validDate, "PPP") : "Pick a date"}
            </span>
          </ResponsiveOverlayTrigger>
          <ResponsiveOverlayContent align="start" className="w-auto p-0 md:p-0">
            <FormThemeScope>
              {isMobile ? (
                <div className="w-full px-3 py-3">
                  <Calendar
                    mode="single"
                    selected={validDate}
                    className="w-full p-2 [--cell-radius:var(--form-radius,var(--radius-md))]"
                    classNames={{
                      root: "w-full",
                      month_grid: "table-fixed",
                      weekdays: "[display:table-row!]",
                      weekday: "w-[14.2857%] flex-none text-center",
                      week: "[display:table-row!]",
                      day: "h-auto w-[14.2857%] align-middle",
                    }}
                    components={{
                      DayButton: (props) => (
                        <CalendarDayButton
                          {...props}
                          className="size-full min-h-11 min-w-0 p-0 text-base"
                        />
                      ),
                    }}
                    onSelect={(date) => {
                      handleChange(date ? formatDateAnswer(date) : undefined);
                      setOpen(false);
                    }}
                  />
                </div>
              ) : (
                <Calendar
                  mode="single"
                  selected={validDate}
                  className="[--cell-radius:var(--form-radius,var(--radius-md))]"
                  onSelect={(date) => {
                    handleChange(date ? formatDateAnswer(date) : undefined);
                    setOpen(false);
                  }}
                />
              )}
            </FormThemeScope>
          </ResponsiveOverlayContent>
        </ResponsiveOverlay>
      );
    }
    case "file":
      if (!formId) {
        return (
          <p className="text-sm text-muted-foreground">
            File upload is unavailable.
          </p>
        );
      }
      return (
        <FileUploadInput
          formId={formId}
          questionId={question.id}
          allowedFilePresets={question.allowedFilePresets}
          customFileTypes={question.customFileTypes}
          value={value as FileAnswerReference | null | undefined}
          onChange={(next) => handleChange(next)}
          onUploadingChange={onFileUploadingChange}
        />
      );
    case "signature": {
      const registered = register(question.id);
      return (
        <Input
          {...registered}
          id={inputId}
          {...invalidProps}
          type="text"
          placeholder="Type your full name"
          autoComplete="name"
          className="rounded-none border-0 border-b-2 bg-transparent px-1 py-4 text-[2rem] font-medium text-foreground placeholder:text-muted-foreground/60 focus-visible:border-[var(--form-accent,var(--primary))] focus-visible:ring-0 md:py-5 md:text-[2.75rem] lg:text-[2rem]"
          style={{ fontFamily: "var(--font-signature), cursive" }}
        />
      );
    }
    case "switch": {
      const yesSelected = value === true;
      const noSelected = value === false;
      return (
        <div className="inline-flex w-full rounded-2xl border border-border bg-muted/50 p-1 md:w-fit md:rounded-[var(--form-radius)] md:bg-card">
          <button
            type="button"
            onClick={() => handleChange(true)}
            className={cn(
              "min-h-12 min-w-0 flex-1 rounded-xl px-6 text-[17px] font-semibold transition active:scale-[0.98] md:min-h-11 md:w-[5.25rem] md:flex-none md:rounded-[calc(var(--form-radius)-4px)] md:px-4 md:text-base",
              focusControl,
              yesSelected
                ? "bg-[var(--form-accent,var(--primary))] text-[var(--form-accent-contrast,var(--primary-foreground))] shadow-sm"
                : "text-muted-foreground",
            )}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleChange(false)}
            className={cn(
              "min-h-12 min-w-0 flex-1 rounded-xl px-6 text-[17px] font-semibold transition active:scale-[0.98] md:min-h-11 md:w-[5.25rem] md:flex-none md:rounded-[calc(var(--form-radius)-4px)] md:px-4 md:text-base",
              focusControl,
              noSelected
                ? "bg-[var(--form-accent,var(--primary))] text-[var(--form-accent-contrast,var(--primary-foreground))] shadow-sm"
                : "text-muted-foreground",
            )}
          >
            No
          </button>
        </div>
      );
    }
    default: {
      const registered = register(question.id);
      return (
        <Input
          {...registered}
          id={inputId}
          type="text"
          placeholder="Your answer"
          className={publicFormInputClasses}
        />
      );
    }
  }
}

function OptionButton({
  selected,
  onClick,
  children,
  multiple,
  title,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  multiple?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex min-h-[3.25rem] w-full flex-col items-start rounded-2xl border-2 px-4 py-3.5 text-left text-[17px] font-medium transition active:scale-[0.99] sm:min-h-12 sm:rounded-[var(--form-radius)] sm:border sm:px-5 sm:py-4 sm:text-base",
        focusControl,
        selected
          ? "border-[var(--form-accent,var(--primary))] bg-[var(--form-accent,var(--primary))]/8 text-foreground shadow-sm sm:bg-secondary"
          : "border-border/80 bg-muted/40 text-foreground sm:border-border sm:bg-card sm:text-muted-foreground hover:border-[var(--form-accent,var(--primary))]/30 hover:bg-muted/50",
      )}
    >
      <div className="flex w-full items-center gap-3">
        {multiple ? (
          <div
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-md border-2 sm:size-5 sm:rounded sm:border",
              selected
                ? "border-[var(--form-accent,var(--primary))] bg-[var(--form-accent,var(--primary))] text-[var(--form-accent-contrast,var(--primary-foreground))]"
                : "border-border bg-background",
            )}
          >
            {selected && (
              <Check weight="bold" className="size-3.5 sm:size-3.5" />
            )}
          </div>
        ) : (
          <div
            className={cn(
              "size-6 shrink-0 rounded-full border-2 sm:size-5 sm:border",
              selected
                ? "border-[var(--form-accent,var(--primary))] bg-[var(--form-accent,var(--primary))] shadow-[inset_0_0_0_3px_var(--background)] sm:shadow-none"
                : "border-border bg-background",
            )}
          />
        )}
        <span className="line-clamp-3 text-[17px] leading-snug sm:line-clamp-2 sm:text-base">
          {children}
        </span>
      </div>
    </button>
  );
}

function RankingInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const items =
    (value as string[])?.length > 0
      ? (value as string[])
      : (question.options?.map((o) => o.value) ?? []);

  const move = (index: number, direction: "up" | "down") => {
    const next = [...items];
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const label =
          question.options?.find((o) => o.value === item)?.label ?? item;
        return (
          <div
            key={item}
            className="flex items-center justify-between rounded-[var(--form-radius)] border border-border bg-card px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[calc(var(--form-radius)-4px)] bg-muted text-sm font-bold text-muted-foreground">
                {index + 1}
              </span>
              <span className="font-semibold">{label}</span>
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, "up")}
                disabled={index === 0}
                aria-disabled={index === 0}
                aria-label={`Move ${label} up`}
                className="disabled:opacity-30"
              >
                <ArrowLeft weight="bold" className="h-4 w-4 rotate-90" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, "down")}
                disabled={index === items.length - 1}
                aria-disabled={index === items.length - 1}
                aria-label={`Move ${label} down`}
                className="disabled:opacity-30"
              >
                <ArrowLeft weight="bold" className="h-4 w-4 -rotate-90" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatrixInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const matrix = (value as Record<string, string>) ?? {};
  const rows = question.rows ?? [];
  const columns = question.columns ?? [];

  const setValue = (row: string, col: string) => {
    onChange({ ...matrix, [row]: col });
  };

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={row}
          className="rounded-[var(--form-radius)] border border-border bg-card p-4"
        >
          <p className="mb-3 text-sm font-semibold">{row}</p>
          <div className="flex flex-wrap gap-2">
            {columns.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setValue(row, col)}
                className={cn(
                  "flex min-h-11 min-w-11 items-center justify-center rounded-[calc(var(--form-radius)-4px)] border px-3 py-2 text-sm font-semibold transition active:scale-95",
                  focusControl,
                  matrix[row] === col
                    ? "border-[var(--form-accent,var(--primary))] bg-[var(--form-accent,var(--primary))] text-[var(--form-accent-contrast,var(--primary-foreground))]"
                    : "border-border bg-card text-muted-foreground hover:border-[var(--form-accent,var(--primary))]/30",
                )}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
