/**
 * Premium focus styles — border-forward on fields, thin rings on controls.
 * Single source of truth for focus-visible across the app.
 */

import { cn } from "@/lib/utils";

/** Text inputs, textareas, selects */
export const focusField =
  "focus-visible:border-[var(--form-accent,var(--foreground))]/60 focus-visible:ring-0";

export const focusFieldInvalid =
  "aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/15 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/25";

/** Buttons, tabs, toggles, accordion triggers */
export const focusControl =
  "focus-visible:ring-1 focus-visible:ring-ring/25 focus-visible:ring-offset-0";

export const focusControlInvalid =
  "aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/30";

/** Checkboxes, switches — small hit targets need a light ring */
export const focusControlSmall =
  "focus-visible:border-[var(--form-accent,var(--foreground))]/60 focus-visible:ring-1 focus-visible:ring-[var(--form-accent,var(--foreground))]/15";

/** Calendar day cell */
export const focusCalendarDay =
  "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-[var(--form-accent,var(--foreground))]/60 group-data-[focused=true]/day:ring-1 group-data-[focused=true]/day:ring-[var(--form-accent,var(--foreground))]/15";

/** Input group wrapper when a child control is focused */
export const focusInputGroup =
  "has-[[data-slot=input-group-control]:focus-visible]:border-[var(--form-accent,var(--foreground))]/60 has-[[data-slot=input-group-control]:focus-visible]:ring-0";

export const focusInputGroupInvalid =
  "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-1 has-[[data-slot][aria-invalid=true]]:ring-destructive/15 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/25";

/** Borderless / ring-based fields (e.g. mobile public form inputs) */
export const focusFieldRing =
  "focus-visible:ring-1 focus-visible:ring-[var(--form-accent,var(--foreground))]/30";

/**
 * Public respondent fields — mobile: subtle accent ring; desktop: border darkens.
 * Use with `sm:border sm:border-input` on desktop (see publicFormInputClasses).
 */
export const focusPublicField = cn(
  focusFieldRing,
  "max-sm:focus-visible:border-transparent",
  "sm:focus-visible:border-[var(--form-accent,var(--foreground))]/60 sm:focus-visible:ring-0",
);

/** Same as focusPublicField but for wrappers with a focused child (e.g. file upload label) */
export const focusPublicFieldWithin = cn(
  "focus-within:ring-1 focus-within:ring-[var(--form-accent,var(--foreground))]/30",
  "max-sm:focus-within:border-transparent",
  "sm:focus-within:border-[var(--form-accent,var(--foreground))]/60 sm:focus-within:ring-0",
);

/** Shared surface for public-form text fields and triggers */
export const publicFormFieldSurface = cn(
  "min-h-14 rounded-2xl border-0 bg-muted/80 text-[17px] shadow-none ring-1 ring-border/50 placeholder:text-muted-foreground/60",
  "sm:min-h-12 sm:rounded-[var(--form-radius)] sm:border sm:border-input sm:bg-secondary sm:text-base sm:ring-0",
  focusPublicField,
);
