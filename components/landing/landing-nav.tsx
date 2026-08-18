"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";

import { GITHUB_URL, TRY_APP_PATH } from "@/components/landing/constants";
import { LANDING_BTN_PRIMARY } from "@/components/landing/tokens";
import { Logo } from "@/components/logo";
import { trackLandingEvent } from "@/lib/landing-analytics";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#themes", label: "Themes" },
  { href: "#deploy", label: "Deploy" },
  { href: "#faq", label: "FAQ" },
] as const;

type LandingNavProps = {
  starCount?: number | null;
};

export function LandingNav({ starCount }: LandingNavProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Floating glass pill navbar */}
      <header className="fixed left-1/2 top-0 z-50 mt-4 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 sm:mt-5">
        <div className="flex h-14 items-center justify-between gap-4 rounded-full border border-[#152238]/10 bg-white/80 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#152238] transition-opacity duration-300 hover:opacity-75"
          >
            <Logo size={26} />
            <span className="font-heading text-[15px] font-bold tracking-tight">
              Recto
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-[#152238]/60 transition-colors duration-200 hover:text-[#152238]"
              >
                {link.label}
              </a>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[13px] font-medium text-[#152238]/60 transition-colors duration-200 hover:text-[#152238]"
              onClick={() => trackLandingEvent("github_star_click")}
            >
              GitHub
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={TRY_APP_PATH}
              onClick={() => trackLandingEvent("try_app_click")}
              className="hidden h-9 items-center justify-center rounded-full bg-[#152238] px-5 text-[13px] font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#1d2d47] active:scale-[0.97] sm:inline-flex"
            >
              Try Recto
            </Link>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#152238] transition-colors duration-300 hover:bg-[#152238]/5 md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <X weight="bold" className="h-4 w-4" />
              ) : (
                <List weight="bold" className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay with staggered reveal */}
      {open ? (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-2xl md:hidden">
          <nav className="flex h-full flex-col items-center justify-center gap-2 px-8">
            {LINKS.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className="w-full max-w-xs rounded-2xl px-6 py-4 text-center text-lg font-medium text-[#152238]/70 transition-colors duration-300 hover:bg-[#152238]/5 hover:text-[#152238]"
                style={{
                  animation: `fadeSlideUp 400ms ${100 + i * 50}ms ease-out both`,
                }}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full max-w-xs rounded-2xl px-6 py-4 text-center text-lg font-medium text-[#152238]/70 transition-colors duration-300 hover:bg-[#152238]/5 hover:text-[#152238]"
              style={{
                animation: `fadeSlideUp 400ms ${100 + LINKS.length * 50}ms ease-out both`,
              }}
              onClick={() => {
                trackLandingEvent("github_star_click");
                setOpen(false);
              }}
            >
              GitHub
            </a>
            <Link
              href={TRY_APP_PATH}
              className={`${LANDING_BTN_PRIMARY} mt-6 w-full max-w-xs`}
              style={{
                animation: `fadeSlideUp 400ms ${150 + LINKS.length * 50}ms ease-out both`,
              }}
              onClick={() => {
                trackLandingEvent("try_app_click");
                setOpen(false);
              }}
            >
              Try Recto
            </Link>
          </nav>
        </div>
      ) : null}

      <style jsx global>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export { GITHUB_URL as LANDING_GITHUB };
