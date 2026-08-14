"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { getPublicForm } from "@/lib/actions";
import type { FormDetail } from "@/lib/types";
import { FormRenderer } from "@/components/form-renderer";
import { PlaygroundClaimBanner } from "@/components/playground-claim-banner";
import { PoweredByRecto } from "@/components/powered-by-recto";
import { FormBackground, FormThemeProvider } from "@/components/form-theme";
import { FormPageSkeleton } from "@/components/ui/form-page-skeleton";
import {
  publicFormDesktopShellClasses,
  publicFormDesktopStageClasses,
  publicFormPageShellClasses,
  publicFormPoweredByDesktopClasses,
} from "@/components/form-renderer/public-form-layout";
import { submitErrorMessage } from "@/lib/submit-error-message";
import { cn } from "@/lib/utils";

export default function PublicFormPage() {
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useQueryState("step", parseAsInteger);
  const currentStep = step ?? 0;

  useEffect(() => {
    getPublicForm(id).then((data) => {
      setForm(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className={publicFormPageShellClasses}>
        <main
          className={cn(
            publicFormDesktopShellClasses(),
            "bg-background sm:bg-muted",
          )}
        >
          <div className={publicFormDesktopStageClasses}>
            <FormPageSkeleton variant="public" />
          </div>
        </main>
        <PoweredByRecto className={publicFormPoweredByDesktopClasses} />
      </div>
    );
  }

  if (!form) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-6 sm:bg-muted">
        <div className="max-w-md text-center">
          <p className="text-lg font-semibold">Form not found</p>
          <p className="mt-2 text-muted-foreground text-pretty">
            This form doesn&apos;t exist or is no longer accepting responses.
          </p>
        </div>
      </main>
    );
  }

  const theme = form.theme;
  const backgroundMode = theme?.backgroundMode ?? "color";
  const hasBackgroundColor =
    backgroundMode === "color" && theme?.backgroundColor;
  const hasTheme =
    theme &&
    (hasBackgroundColor ||
      theme.backgroundImage ||
      theme.backgroundFrom ||
      theme.backgroundTo);

  const content = (
    <FormRenderer
      formId={id}
      title={form.title}
      description={form.description}
      questions={form.questions}
      theme={theme}
      step={currentStep}
      onStepChange={setStep}
      onSubmit={async (answers) => {
        const res = await fetch(`/api/submit/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(answers),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(submitErrorMessage(res.status, data));
        }
        const data = (await res.json().catch(() => ({}))) as {
          preview?: boolean;
        };
        if (data.preview) {
          return { preview: true };
        }
      }}
    />
  );

  return (
    <FormThemeProvider theme={theme}>
      <div className={publicFormPageShellClasses}>
        {form.isPlayground ? (
          <PlaygroundClaimBanner formId={id} expiresAt={form.expiresAt} />
        ) : null}
        {hasTheme ? (
          <FormBackground
            theme={theme}
            className={cn(
              publicFormDesktopShellClasses(),
              form.isPlayground &&
                "pt-[4.25rem] sm:[--public-form-card-offset:12rem]",
            )}
          >
            <div className={publicFormDesktopStageClasses}>{content}</div>
          </FormBackground>
        ) : (
          <main
            className={cn(
              publicFormDesktopShellClasses(),
              "bg-background sm:bg-muted",
              form.isPlayground &&
                "pt-[4.25rem] sm:[--public-form-card-offset:12rem]",
            )}
          >
            <div className={publicFormDesktopStageClasses}>{content}</div>
          </main>
        )}
        {/* Desktop only — mobile uses in-success attribution */}
        <PoweredByRecto
          theme={theme}
          className={publicFormPoweredByDesktopClasses}
        />
      </div>
    </FormThemeProvider>
  );
}
