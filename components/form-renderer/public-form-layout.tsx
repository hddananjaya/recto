"use client";

import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import { motion } from "framer-motion";
import Link from "next/link";
import type { FormTheme } from "@/lib/types";
import { isLightBackground } from "@/lib/theme";
import { cn } from "@/lib/utils";
import {
  focusPublicFieldWithin,
  publicFormFieldSurface,
} from "@/lib/focus-styles";
import { Button } from "@/components/ui/button";
import { themedPrimaryCtaClasses } from "@/components/form-theme";
import type { FooterHint } from "@/lib/form-contextual-hints";

function hasRichBackground(theme?: FormTheme): boolean {
  if (!theme) return false;
  if (theme.backgroundImage || theme.backgroundFrom) return true;
  if (theme.backgroundMode === "color" && theme.backgroundColor) {
    return !isLightBackground(theme.backgroundColor);
  }
  return false;
}

/** Outer public form page shell */
export const publicFormPageShellClasses =
  "relative flex min-h-dvh flex-col sm:h-dvh sm:overflow-hidden";

/** Desktop content area — symmetric padding; card centers naturally */
export function publicFormDesktopShellClasses(extra?: string) {
  return cn(
    "flex min-h-0 flex-1 flex-col",
    "sm:items-center sm:justify-center sm:px-6 sm:py-6",
    "sm:[--public-form-card-offset:3rem]",
    extra,
  );
}

/** Card stage wrapper */
export const publicFormDesktopStageClasses =
  "@container relative z-10 mx-auto flex w-full min-h-0 max-h-full flex-col sm:max-w-2xl";

/** Desktop card height — fixed shell; long questions scroll inside PublicFormBody */
export const publicFormDesktopCardHeight =
  "sm:h-[min(52rem,calc(100dvh-var(--public-form-card-offset,3rem)))] sm:max-h-[min(52rem,calc(100dvh-var(--public-form-card-offset,3rem)))] sm:min-h-[min(52rem,calc(100dvh-var(--public-form-card-offset,3rem)))]";

export const publicFormPoweredByDesktopClasses =
  "pointer-events-none fixed inset-x-0 bottom-3 z-10 hidden pb-[env(safe-area-inset-bottom)] sm:flex";

/** Full-screen app shell on mobile; floating card on desktop. */
export function publicFormCardClasses(theme?: FormTheme, extra?: string) {
  const glass = hasRichBackground(theme);

  return cn(
    "@container public-form-app flex w-full flex-col overflow-hidden",
    // Mobile: immersive native-app takeover (solid surface — no theme wallpaper)
    "fixed inset-0 z-20 h-dvh max-h-dvh touch-manipulation bg-background",
    // Desktop: fixed-height card (Typeform-style — no resize between steps)
    "sm:static sm:z-auto sm:w-full sm:rounded-[var(--form-radius)] sm:border sm:shadow-xl",
    publicFormDesktopCardHeight,
    glass
      ? "sm:border-white/15 sm:bg-card/92 sm:shadow-black/20 sm:backdrop-blur-xl supports-[backdrop-filter]:sm:bg-card/85"
      : "sm:border-border/80 sm:bg-card sm:shadow-black/5",
    extra,
  );
}

export function PublicFormHeader({
  stepLabel,
  progress,
  canGoBack,
  onBack,
}: {
  stepLabel: string;
  progress: number;
  canGoBack: boolean;
  onBack: () => void;
}) {
  return (
    <header className="shrink-0">
      {/* Mobile: edge-to-edge progress (onboarding style) */}
      <div
        className="h-[3px] w-full bg-muted/50 sm:hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Form progress"
      >
        <div
          className="h-full bg-[var(--form-accent,var(--primary))] transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-2 px-4 pb-3 pt-[max(0.625rem,env(safe-area-inset-top))] sm:gap-3 sm:border-b sm:border-border/60 sm:px-6 sm:py-4 sm:pb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          disabled={!canGoBack}
          className={cn(
            "size-11 shrink-0 rounded-full bg-muted/70 active:scale-95 sm:size-10 sm:rounded-[var(--form-radius)] sm:bg-transparent",
            !canGoBack && "pointer-events-none opacity-0",
          )}
          aria-label="Previous question"
        >
          <ArrowLeft weight="bold" className="size-5" />
        </Button>

        {/* Mobile: step counter */}
        <span className="ml-auto text-sm font-medium tabular-nums text-muted-foreground sm:hidden">
          {stepLabel}
        </span>

        {/* Desktop: label + progress bar */}
        <div className="hidden min-w-0 flex-1 space-y-2 sm:block">
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="truncate font-medium">{stepLabel}</span>
            <span className="shrink-0 tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted/80">
            <div
              className="h-full rounded-full bg-[var(--form-accent,var(--primary))] transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export function PublicFormBody({
  children,
  stepKey,
  stepMotion,
  variant = "question",
}: {
  children: ReactNode;
  stepKey: string;
  stepMotion: { duration: number };
  variant?: "intro" | "question";
}) {
  return (
    <main
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]",
        "px-5 pt-4 pb-6 sm:px-8 sm:py-10",
        variant === "intro" && "pt-2 sm:pt-10",
      )}
    >
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={stepMotion}
        className={cn(
          "mx-auto w-full max-w-[36rem]",
          variant === "intro" &&
            "flex min-h-[calc(100dvh-12rem)] flex-col justify-center sm:min-h-full sm:flex-1 sm:justify-center",
          variant === "question" && "pt-2 sm:pt-0",
        )}
      >
        {children}
      </motion.div>
    </main>
  );
}

export function PublicFormFooter({
  onContinue,
  disabled,
  isSubmitting,
  label,
  footerHint,
  mobileInstruction,
  continueDisabledReason,
}: {
  onContinue: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  label: string;
  footerHint?: FooterHint;
  mobileInstruction?: string | null;
  continueDisabledReason?: string | null;
}) {
  return (
    <footer
      className={cn(
        "z-30 shrink-0",
        // Mobile: pinned to bottom via parent flex column (not fixed — avoids content overlap)
        "border-t border-border/60 bg-background/95 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl supports-[backdrop-filter]:bg-background/90",
        // Desktop: inline footer
        "sm:relative sm:border-t sm:border-border/60 sm:bg-card/80 sm:px-8 sm:py-4 sm:pt-4 sm:pb-4 sm:backdrop-blur-sm supports-[backdrop-filter]:sm:bg-card/70",
      )}
    >
      <div className="mx-auto flex w-full max-w-[36rem] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FooterHintText hint={footerHint ?? null} />
        <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto">
          {mobileInstruction ? (
            <p className="text-center text-xs text-muted-foreground sm:hidden">
              {mobileInstruction}
            </p>
          ) : null}
          {continueDisabledReason ? (
            <p className="text-center text-xs text-muted-foreground sm:hidden">
              {continueDisabledReason}
            </p>
          ) : null}
          <button
            type="button"
            onClick={onContinue}
            disabled={disabled || isSubmitting}
            className={themedPrimaryCtaClasses(
              "gap-2 shadow-lg shadow-black/10 active:scale-[0.98] sm:shadow-none sm:active:scale-100",
            )}
          >
            {isSubmitting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Submitting...
              </>
            ) : (
              <>
                {label}
                {label !== "Submit" && (
                  <ArrowRight weight="bold" className="size-4" />
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterHintText({ hint }: { hint: FooterHint }) {
  if (!hint) {
    return <span className="hidden min-h-5 sm:block" aria-hidden />;
  }

  if (hint.kind === "instruction") {
    return (
      <p className="hidden text-xs text-muted-foreground sm:block">
        {hint.text}
      </p>
    );
  }

  if (hint.variant === "enter-with-newline") {
    return (
      <p className="hidden text-xs text-muted-foreground sm:block">
        Press <HintKey>Enter</HintKey> to continue
        <span className="text-muted-foreground/50"> · </span>
        <HintKey>Shift</HintKey>+<HintKey>Enter</HintKey> for new line
      </p>
    );
  }

  return (
    <p className="hidden text-xs text-muted-foreground sm:block">
      Press <HintKey>Enter</HintKey> to continue
    </p>
  );
}

function HintKey({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground">
      {children}
    </kbd>
  );
}

export function PublicFormIntro({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="space-y-5 sm:space-y-4">
      <h1 className="font-heading text-[2rem] font-bold leading-[1.08] tracking-tight text-balance text-foreground sm:text-[clamp(1.75rem,4cqi+1.25rem,2.75rem)] sm:font-semibold sm:leading-[1.1]">
        {title}
      </h1>
      {description ? (
        <p className="max-w-prose text-[1.0625rem] leading-relaxed text-muted-foreground text-pretty sm:text-[clamp(1rem,2cqi+0.85rem,1.125rem)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function PublicFormSuccess({
  onReset,
  showReset,
  successMotion,
}: {
  onReset: () => void;
  showReset?: boolean;
  successMotion: { duration: number };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={successMotion}
      className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:px-10"
    >
      <div className="mb-8 flex size-20 items-center justify-center rounded-full bg-[var(--form-accent,var(--primary))] text-[var(--form-accent-contrast,var(--primary-foreground))] shadow-lg shadow-black/10 sm:mb-6 sm:size-20">
        <Check weight="bold" className="size-10 sm:size-10" />
      </div>
      <h2 className="font-heading text-[1.75rem] font-bold tracking-tight text-balance sm:text-[clamp(1.5rem,3cqi+1rem,2.25rem)] sm:font-semibold">
        Response recorded
      </h2>
      <p className="mt-3 max-w-sm text-[1.0625rem] leading-relaxed text-muted-foreground text-pretty sm:text-lg">
        Thanks — your answers were submitted successfully.
      </p>
      {showReset ? (
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="mt-10 min-h-12 w-full max-w-xs rounded-2xl text-base sm:mt-8 sm:min-h-11 sm:w-auto sm:rounded-[var(--form-radius)]"
        >
          Start over
        </Button>
      ) : null}
      <p className="mt-auto pt-16 text-xs text-muted-foreground/70 sm:hidden">
        Powered by{" "}
        <Link href="/" className="font-medium text-muted-foreground">
          Recto
        </Link>
      </p>
    </motion.div>
  );
}

/** Shared mobile-first input surface styles */
export const publicFormInputClasses = publicFormFieldSurface;

/** Unified shell for phone field — one border/ring/bg around flag + number */
export const publicFormPhoneShellClasses = cn(
  "min-h-14 rounded-2xl border-0 bg-muted/80 shadow-none ring-1 ring-border/50",
  "sm:min-h-12 sm:rounded-[var(--form-radius)] sm:border sm:border-input sm:bg-secondary sm:ring-0",
  focusPublicFieldWithin,
  "flex items-center overflow-hidden",
);
