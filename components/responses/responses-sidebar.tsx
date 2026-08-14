"use client";

import { CaretRight } from "@phosphor-icons/react/dist/ssr";

import type { Submission } from "@/lib/types";
import { cn } from "@/lib/utils";

type ResponsesSidebarProps = {
  submissions: Submission[];
  selectedId?: string;
  loading?: boolean;
  className?: string;
  onSelectSubmission: (submissionId: string) => void;
};

export function ResponsesSidebar({
  submissions,
  selectedId,
  loading = false,
  className,
  onSelectSubmission,
}: ResponsesSidebarProps) {

  if (loading && submissions.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-xl bg-muted"
          />
        ))}
      </div>
    );
  }

  return (
    <nav
      aria-label="Responses"
      className={cn(
        "space-y-1 overflow-y-auto overscroll-contain pr-1",
        loading && "opacity-50",
        className,
      )}
    >
      {submissions.map((submission) => {
        const isSelected = submission.id === selectedId;
        const label = new Date(submission.submittedAt).toLocaleString(
          undefined,
          { dateStyle: "medium", timeStyle: "short" },
        );

        return (
          <button
            key={submission.id}
            type="button"
            onClick={() => onSelectSubmission(submission.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition-colors",
              isSelected
                ? "border-border bg-background shadow-sm"
                : "border-transparent hover:bg-muted/70",
            )}
            aria-current={isSelected ? "true" : undefined}
          >
            <span className="min-w-0 flex-1 font-medium">{label}</span>
            <CaretRight
              weight="bold"
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                isSelected && "translate-x-0.5 text-foreground",
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
