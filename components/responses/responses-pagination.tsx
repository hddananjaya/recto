"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

import { Button } from "@/components/ui/button";
import { submissionPageRange } from "@/lib/submissions-pagination";
import { cn } from "@/lib/utils";

type ResponsesPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  loading?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
  variant?: "default" | "compact";
};

export function ResponsesPagination({
  page,
  pageSize,
  total,
  loading = false,
  onPrevious,
  onNext,
  className,
  variant = "default",
}: ResponsesPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const { start, end } = submissionPageRange(page, pageSize, total);

  if (total <= pageSize) {
    if (variant === "compact") return null;

    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {total} response{total !== 1 ? "s" : ""}
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center justify-between gap-1", className)}>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={onPrevious}
          disabled={page <= 1 || loading}
          aria-label="Previous page"
        >
          <CaretLeft weight="bold" className="h-3.5 w-3.5" />
        </Button>
        <p className="text-xs tabular-nums text-muted-foreground">
          {start}–{end} · {page}/{totalPages}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={onNext}
          disabled={page >= totalPages || loading}
          aria-label="Next page"
        >
          <CaretRight weight="bold" className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {total.toLocaleString()} responses
      </p>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={page <= 1 || loading}
          >
            <CaretLeft weight="bold" className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={page >= totalPages || loading}
          >
            Next
            <CaretRight weight="bold" className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
