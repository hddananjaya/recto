import Image from "next/image";

import { LANDING_BEZEL_SHELL_LIGHT } from "@/components/landing/tokens";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeader({
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <h2 className="font-heading text-[1.75rem] font-semibold tracking-[-0.025em] text-[#152238] sm:text-[2rem] lg:text-[2.25rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-[#152238]/55 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

type ScreenshotProps = {
  src: string;
  alt: string;
  className?: string;
  aspectClassName?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * Double-Bezel (Doppelrand) Screenshot Frame
 * Outer shell with subtle background + inner core with content
 */
export function Screenshot({
  src,
  alt,
  className,
  aspectClassName = "aspect-[16/10]",
  imageClassName,
  priority,
  sizes = "(max-width: 1024px) 100vw, 1024px",
}: ScreenshotProps) {
  return (
    <div
      className={cn(
        // Outer shell - the "tray"
        "rounded-[1.25rem] p-1.5 ring-1 ring-[#152238]/[0.06] sm:rounded-[1.5rem] sm:p-2",
        LANDING_BEZEL_SHELL_LIGHT,
        className,
      )}
    >
      {/* Inner core - the "glass plate" */}
      <div className="overflow-hidden rounded-[calc(1.25rem-0.375rem)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:rounded-[calc(1.5rem-0.5rem)]">
        <div className={cn("relative w-full bg-white", aspectClassName)}>
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            className={cn("object-cover object-top", imageClassName)}
          />
        </div>
      </div>
    </div>
  );
}
