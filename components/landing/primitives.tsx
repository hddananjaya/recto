import {
  LANDING_BEZEL_SHELL_DARK,
  LANDING_BEZEL_SHELL_LIGHT,
} from "@/components/landing/tokens";
import { cn } from "@/lib/utils";

export const EASE_PREMIUM = [0.32, 0.72, 0, 1] as const;

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mb-5 inline-flex rounded-full bg-muted/80 px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  dark,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <Eyebrow className={dark ? "bg-white/10 text-zinc-400" : undefined}>
        {eyebrow}
      </Eyebrow>
      <h2
        className={cn(
          "font-heading text-3xl font-black tracking-[-0.03em] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.06]",
          dark ? "text-zinc-50" : "text-foreground",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-5 max-w-xl text-base leading-relaxed sm:text-lg",
            dark ? "text-zinc-400" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function Section({
  id,
  children,
  className,
  innerClassName,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <section id={id} className={cn("relative px-4 py-24 sm:px-6 sm:py-32 lg:px-8", className)}>
      <div className={cn("mx-auto max-w-7xl", innerClassName)}>{children}</div>
    </section>
  );
}

export function DoubleBezel({
  children,
  className,
  shellClassName,
  innerClassName,
  dark,
}: {
  children: React.ReactNode;
  className?: string;
  shellClassName?: string;
  innerClassName?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[2rem] p-1.5 ring-1",
        dark
          ? cn(LANDING_BEZEL_SHELL_DARK, "ring-white/10")
          : cn(LANDING_BEZEL_SHELL_LIGHT, "ring-black/[0.06]"),
        shellClassName,
        className,
      )}
    >
      <div
        className={cn(
          "overflow-hidden rounded-[calc(2rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]",
          dark ? "bg-zinc-900" : "bg-card",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function PhoneFrame({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <DoubleBezel className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-auto w-full"
        loading={priority ? "eager" : "lazy"}
      />
    </DoubleBezel>
  );
}
