import { cn } from "@/lib/utils";

type SpreadsheetGridProps = {
  className?: string;
  /** 0–1 */
  opacity?: number;
};

export function SpreadsheetGrid({
  className,
  opacity = 0.07,
}: SpreadsheetGridProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden
      style={{
        opacity,
        backgroundImage:
          "linear-gradient(#2b6ecb 1px, transparent 1px), linear-gradient(90deg, #2b6ecb 1px, transparent 1px)",
        backgroundSize: "32px 24px",
      }}
    />
  );
}
