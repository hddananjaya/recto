"use client";

import Link from "next/link";
import { FloppyDisk } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import { PLAYGROUND_TTL_HOURS } from "@/lib/playground";

type PlaygroundClaimBannerProps = {
  formId: string;
  expiresAt?: string | null;
};

export function PlaygroundClaimBanner({
  formId,
  expiresAt,
}: PlaygroundClaimBannerProps) {
  const claimHref = `/playground/claim?formId=${encodeURIComponent(formId)}`;

  const expiryLabel = expiresAt
    ? new Date(expiresAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-amber-200/80 bg-amber-50/95 px-4 py-3 text-amber-950 shadow-sm backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-950/90 dark:text-amber-50">
      <div className="mx-auto flex max-w-3xl items-start gap-3 sm:items-center">
        <p className="min-w-0 flex-1 text-sm leading-snug">
          <span className="font-semibold">Playground form</span>
          {" — "}
          try it now, then sign in to save and edit
          {expiryLabel ? (
            <> (expires {expiryLabel})</>
          ) : (
            <> (expires in {PLAYGROUND_TTL_HOURS} hours)</>
          )}
          .
        </p>
        <Button asChild size="sm" className="h-8 shrink-0">
          <Link href={claimHref}>
            <FloppyDisk weight="bold" className="h-3.5 w-3.5" />
            Save form
          </Link>
        </Button>
      </div>
    </div>
  );
}
