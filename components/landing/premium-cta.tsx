"use client";

import Link from "next/link";
import {
  ArrowRight,
  GithubLogo,
  Play,
} from "@phosphor-icons/react/dist/ssr";

import {
  trackLandingEvent,
  type LandingEvent,
} from "@/lib/landing-analytics";
import { cn } from "@/lib/utils";

const ICONS = {
  play: Play,
  "arrow-right": ArrowRight,
  github: GithubLogo,
} as const;

export type PremiumCtaIcon = keyof typeof ICONS;

type PremiumCtaProps = {
  href: string;
  children: React.ReactNode;
  icon?: PremiumCtaIcon;
  variant?: "primary" | "outline" | "ghost";
  external?: boolean;
  className?: string;
  trackEvent?: LandingEvent;
  onClick?: () => void;
};

export function PremiumCta({
  href,
  children,
  icon,
  variant = "primary",
  external,
  className,
  trackEvent,
  onClick,
}: PremiumCtaProps) {
  const Icon = icon ? ICONS[icon] : null;

  const base =
    "group inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "bg-background/80 text-foreground ring-1 ring-black/[0.08] hover:bg-muted/60",
    ghost: "text-foreground hover:bg-muted/60",
  };

  const iconShell =
    variant === "primary"
      ? "bg-primary-foreground/15 group-hover:bg-primary-foreground/20"
      : "bg-black/[0.05] group-hover:bg-black/[0.08]";

  const content = (
    <>
      <span>{children}</span>
      {Icon ? (
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105",
            iconShell,
          )}
        >
          <Icon weight="bold" className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </>
  );

  const classes = cn(base, variants[variant], className);

  function handleClick() {
    if (trackEvent) trackLandingEvent(trackEvent);
    onClick?.();
  }

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={classes}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={handleClick}>
      {content}
    </Link>
  );
}
