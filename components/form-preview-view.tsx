"use client";

import { FormRenderer } from "@/components/form-renderer";
import {
  publicFormDesktopShellClasses,
  publicFormDesktopStageClasses,
  publicFormPageShellClasses,
  publicFormPoweredByDesktopClasses,
} from "@/components/form-renderer/public-form-layout";
import { PoweredByRecto } from "@/components/powered-by-recto";
import { FormBackground, FormThemeProvider } from "@/components/form-theme";
import type { FormTheme, Question } from "@/lib/types";
import { cn } from "@/lib/utils";

export type FormPreviewSnapshot = {
  title: string;
  description: string;
  questions: Question[];
  theme?: FormTheme;
  includesUnsavedChanges?: boolean;
};

type FormPreviewViewProps = {
  formId: string;
  snapshot: FormPreviewSnapshot;
  sessionKey: number;
};

export function FormPreviewView({
  formId,
  snapshot,
  sessionKey,
}: FormPreviewViewProps) {
  const theme = snapshot.theme;
  const backgroundMode = theme?.backgroundMode ?? "color";
  const hasBackgroundColor =
    backgroundMode === "color" && theme?.backgroundColor;
  const hasTheme =
    theme &&
    (hasBackgroundColor ||
      theme.backgroundImage ||
      theme.backgroundFrom ||
      theme.backgroundTo);

  const formContent = (
    <FormRenderer
      key={sessionKey}
      formId={formId}
      title={snapshot.title}
      description={snapshot.description}
      questions={snapshot.questions}
      theme={theme}
      onSubmit={async () => {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }}
    />
  );

  return (
    <FormThemeProvider theme={theme}>
      <div className={cn(publicFormPageShellClasses, "h-full")}>
        {hasTheme ? (
          <FormBackground
            theme={theme}
            className={publicFormDesktopShellClasses()}
          >
            <div className={publicFormDesktopStageClasses}>{formContent}</div>
          </FormBackground>
        ) : (
          <main
            className={cn(
              publicFormDesktopShellClasses(),
              "bg-background sm:bg-muted",
            )}
          >
            <div className={publicFormDesktopStageClasses}>{formContent}</div>
          </main>
        )}

        <PoweredByRecto
          theme={theme}
          className={publicFormPoweredByDesktopClasses}
        />
      </div>
    </FormThemeProvider>
  );
}
