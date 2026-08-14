import { Skeleton } from "@/components/ui/skeleton";
import { publicFormCardClasses } from "@/components/form-renderer/public-form-layout";
import { cn } from "@/lib/utils";

type FormPageSkeletonVariant = "editor" | "public" | "submissions";

export function FormPageSkeleton({
  variant,
  className,
}: {
  variant: FormPageSkeletonVariant;
  className?: string;
}) {
  if (variant === "public") {
    return (
      <div className={cn(publicFormCardClasses(), className)}>
        <div className="h-[3px] w-full bg-muted/50 sm:hidden">
          <Skeleton className="h-full w-1/3 rounded-none" />
        </div>
        <div className="flex items-center gap-2 px-4 pb-3 pt-[max(0.625rem,env(safe-area-inset-top))] sm:border-b sm:border-border/60 sm:px-6 sm:py-4">
          <Skeleton className="size-11 shrink-0 rounded-full sm:size-10 sm:rounded-[var(--form-radius,0.75rem)]" />
          <Skeleton className="ml-auto h-4 w-16 sm:ml-0 sm:flex-1" />
        </div>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 pt-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:px-8 sm:py-10 sm:pb-4">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="mt-2 h-14 w-full rounded-2xl sm:h-12 sm:rounded-[var(--form-radius,0.75rem)]" />
        </div>
        <div className="fixed inset-x-0 bottom-0 z-30 shrink-0 border-t border-border/60 bg-background/95 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl supports-[backdrop-filter]:bg-background/90 sm:relative sm:border-t sm:border-border/60 sm:bg-card/80 sm:px-8 sm:py-4 sm:pt-4 sm:pb-4 sm:backdrop-blur-sm supports-[backdrop-filter]:sm:bg-card/70">
          <Skeleton className="h-14 w-full rounded-2xl sm:ml-auto sm:h-11 sm:w-40 sm:rounded-[var(--form-radius,0.75rem)]" />
        </div>
      </div>
    );
  }

  if (variant === "submissions") {
    return (
      <div
        className={cn(
          "min-w-0 space-y-8 lg:grid lg:min-h-[60dvh] lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8 lg:space-y-0",
          className,
        )}
      >
        <div className="space-y-4 lg:border-r lg:pr-6">
          <Skeleton className="h-4 w-24" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <div className="space-y-4 lg:pl-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-56" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[1.75rem]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-4xl space-y-8", className)}>
      <div className="flex justify-end gap-2 border-b pb-3">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-6 w-full max-w-lg" />
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="mt-4 h-11 w-52" />
        </div>
      ))}
    </div>
  );
}
