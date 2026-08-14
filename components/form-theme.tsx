"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { focusControl } from "@/lib/focus-styles";
import { radiusForRoundness, contrastColor, DEFAULT_FORM_ACCENT } from "@/lib/theme";
import type { FormTheme } from "@/lib/types";

const FormThemeStyleContext = React.createContext<React.CSSProperties>({});

function formThemeStyle(theme?: FormTheme): React.CSSProperties {
  const accentColor = theme?.accentColor ?? DEFAULT_FORM_ACCENT;
  const roundness = theme?.roundness ?? "round";
  const radiusValue = radiusForRoundness(roundness);
  const accentContrast = contrastColor(accentColor);

  return {
    "--form-accent": accentColor,
    "--form-accent-contrast": accentContrast,
    "--form-radius": radiusValue,
    "--cell-radius": radiusValue,
  } as React.CSSProperties;
}

interface FormThemeProviderProps {
  theme?: FormTheme;
  className?: string;
  children: React.ReactNode;
}

export function FormThemeProvider({
  theme,
  className,
  children,
}: FormThemeProviderProps) {
  const style = React.useMemo(() => formThemeStyle(theme), [theme]);

  return (
    <FormThemeStyleContext.Provider value={style}>
      <div className={className} style={style} data-form-theme="">
        {children}
      </div>
    </FormThemeStyleContext.Provider>
  );
}

/** Re-applies form theme CSS variables inside portaled overlays (popover, sheet). */
export function FormThemeScope({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const style = React.useContext(FormThemeStyleContext);

  if (!style || Object.keys(style).length === 0) {
    return <>{children}</>;
  }

  return (
    <div className={className} style={style} data-form-theme="">
      {children}
    </div>
  );
}

interface FormBackgroundGrainProps {
  className?: string;
}

/** Fine film grain stretched to the container — avoids tiled background-image patches. */
export function FormBackgroundGrain({
  className,
}: FormBackgroundGrainProps) {
  const filterId = React.useId().replace(/:/g, "");

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-soft-light",
        className,
      )}
      aria-hidden
    >
      <svg
        className="size-full"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.78"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>
    </div>
  );
}

interface FormBackgroundProps {
  theme?: FormTheme;
  className?: string;
  children: React.ReactNode;
}

export function FormBackground({
  theme,
  className,
  children,
}: FormBackgroundProps) {
  const backgroundMode = theme?.backgroundMode ?? "color";

  let backgroundStyle: React.CSSProperties = {};
  if (backgroundMode === "color" && theme?.backgroundColor) {
    backgroundStyle = { backgroundColor: theme.backgroundColor };
  } else if (theme?.backgroundFrom && theme?.backgroundTo) {
    backgroundStyle = {
      background: `linear-gradient(160deg, ${theme.backgroundFrom} 0%, ${theme.backgroundTo} 100%)`,
    };
  }

  return (
    <div className={cn("relative overflow-hidden bg-background sm:bg-transparent", className)}>
      <div
        className="pointer-events-none absolute inset-0 hidden sm:block"
        style={backgroundStyle}
        aria-hidden
      >
        {theme?.backgroundImage && (
          <Image
            src={theme.backgroundImage}
            alt=""
            fill
            priority
            sizes="(max-width: 639px) 0px, 100vw"
            className="object-cover"
          />
        )}
        <FormBackgroundGrain />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, transparent 0%, rgba(15,23,42,0.16) 100%)",
          }}
        />
      </div>
      <div className="relative z-10 size-full">{children}</div>
    </div>
  );
}

export function themedButtonClasses(extra?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-[var(--form-radius)] bg-[var(--form-accent,var(--primary))] px-4 py-2 text-sm font-medium text-[var(--form-accent-contrast,var(--primary-foreground))] transition-colors hover:bg-[var(--form-accent,var(--primary))]/90 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    focusControl,
    extra,
  );
}

export function themedPrimaryCtaClasses(extra?: string) {
  return themedButtonClasses(
    cn(
      "h-14 min-h-14 w-full rounded-2xl px-6 text-[17px] font-semibold sm:h-11 sm:min-h-11 sm:w-auto sm:min-w-[10rem] sm:rounded-[var(--form-radius)] sm:text-base",
      extra,
    ),
  );
}

export function themedCardClasses(extra?: string) {
  return cn(
    "rounded-[var(--form-radius)] border border-border bg-card shadow-none",
    extra,
  );
}
