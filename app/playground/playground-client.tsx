"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Lightning, Play, Warning } from "@phosphor-icons/react/dist/ssr";

import { TRY_APP_PATH, TRY_FORM_PATH } from "@/components/landing/constants";
import { LandingPromptForm } from "@/components/landing-prompt-form";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackLandingEvent } from "@/lib/landing-analytics";

function PlaygroundGenerate({ aiConfigured }: { aiConfigured: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt")?.trim() ?? "";

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "generating">("idle");

  useEffect(() => {
    if (!prompt || status !== "idle" || !aiConfigured) return;

    let cancelled = false;

    async function run() {
      setStatus("generating");
      setError(null);
      trackLandingEvent("playground_start");

      try {
        const res = await fetch("/api/playground/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        const data = (await res.json().catch(() => ({}))) as {
          formId?: string;
          error?: string;
        };

        if (cancelled) return;

        if (!res.ok || !data.formId) {
          setError(data.error ?? "Could not generate your form. Try again.");
          setStatus("idle");
          return;
        }

        router.replace(`/f/${data.formId}?playground=1`);
      } catch {
        if (!cancelled) {
          setError("Network error. Check your connection and try again.");
          setStatus("idle");
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [prompt, router, status, aiConfigured]);

  if (!aiConfigured) {
    return (
      <Card className="mx-auto w-full max-w-lg shadow-none">
        <CardContent className="space-y-5 pt-6 text-center">
          <p className="text-lg font-semibold">AI generation isn&apos;t enabled here</p>
          <p className="text-sm text-muted-foreground">
            This server doesn&apos;t have an API key configured. The interactive demo
            works without setup.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href={TRY_APP_PATH} onClick={() => trackLandingEvent("try_app_click")}>
                <Play weight="bold" className="h-4 w-4" />
                Try Recto
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prompt) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <LandingPromptForm />
      </div>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-lg shadow-none">
      <CardContent className="space-y-4 pt-6 text-center">
        {error ? (
          <>
            <div className="flex items-start justify-center gap-2 text-sm text-destructive">
              <Warning weight="fill" className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href={TRY_APP_PATH} onClick={() => trackLandingEvent("try_app_click")}>
                  <Play weight="bold" className="h-4 w-4" />
                  Try Recto
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/playground">Try another prompt</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lightning weight="fill" className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-lg font-semibold">Generating your form…</p>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                {prompt}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

type PlaygroundClientProps = {
  aiConfigured: boolean;
};

export function PlaygroundClient({ aiConfigured }: PlaygroundClientProps) {
  return (
    <main className="min-h-dvh bg-muted">
      <header className="border-b bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-heading text-base font-semibold">Recto</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={TRY_APP_PATH} onClick={() => trackLandingEvent("try_app_click")}>
                Try Recto
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/sign-in">Sign in to save</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-3xl items-center px-4 py-12 sm:px-6">
        <Suspense
          fallback={
            <p className="w-full text-center text-muted-foreground">Loading…</p>
          }
        >
          <PlaygroundGenerate aiConfigured={aiConfigured} />
        </Suspense>
      </div>
    </main>
  );
}
