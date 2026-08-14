import Link from "next/link";

import { LogoMark } from "@/components/logo";
import { isLightBackground } from "@/lib/theme";
import type { FormTheme } from "@/lib/types";
import { cn } from "@/lib/utils";

function badgeClasses(theme?: FormTheme): string {
  const backgroundMode = theme?.backgroundMode ?? "color";
  const hasPhotoOrGradient =
    backgroundMode === "photo" ||
    Boolean(theme?.backgroundImage || theme?.backgroundFrom);

  if (hasPhotoOrGradient) {
    return "border-white/15 bg-black/35 text-white/90 shadow-sm backdrop-blur-md hover:bg-black/45";
  }

  if (theme?.backgroundColor) {
    return isLightBackground(theme.backgroundColor)
      ? "border-black/10 bg-black/[0.04] text-foreground/55 backdrop-blur-sm hover:bg-black/[0.07] hover:text-foreground/70"
      : "border-white/15 bg-white/10 text-white/85 backdrop-blur-sm hover:bg-white/15";
  }

  return "border-border/60 bg-background/80 text-muted-foreground backdrop-blur-sm hover:text-foreground";
}

interface PoweredByRectoProps {
  theme?: FormTheme;
  className?: string;
}

export function PoweredByRecto({ theme, className }: PoweredByRectoProps) {
  return (
    <div
      className={cn(
        "flex justify-center px-3 md:justify-end md:px-4",
        className,
      )}
    >
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "pointer-events-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors",
          badgeClasses(theme),
        )}
      >
        <span className="opacity-70">Made with</span>
        <span className="font-medium">Recto</span>
      </Link>
    </div>
  );
}
