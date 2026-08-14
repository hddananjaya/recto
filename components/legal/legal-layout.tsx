import Link from "next/link";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/landing/site-footer";
import { LANDING_CONTAINER } from "@/components/landing/tokens";
import { Logo } from "@/components/logo";
import { LEGAL_EFFECTIVE_DATE, LEGAL_SITE_NAME } from "@/lib/legal";

type LegalLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function legalPageMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} — ${LEGAL_SITE_NAME}`,
    description,
  };
}

export function LegalLayout({ title, description, children }: LegalLayoutProps) {
  return (
    <main className="min-h-dvh bg-[#fafaf9] text-[#152238] antialiased">
      <header className="border-b border-[#152238]/[0.06]">
        <div
          className={`${LANDING_CONTAINER} flex items-center justify-between py-5`}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-80"
          >
            <Logo size={26} />
            <span className="font-heading text-[15px] font-semibold tracking-tight">
              {LEGAL_SITE_NAME}
            </span>
          </Link>
          <Link
            href="/"
            className="text-[13px] font-medium text-[#152238]/50 transition-colors duration-300 hover:text-[#152238]"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <article className={`${LANDING_CONTAINER} max-w-3xl py-16 sm:py-20`}>
        <header className="mb-10 border-b border-[#152238]/[0.08] pb-8">
          <h1 className="font-heading text-[2rem] font-semibold tracking-[-0.025em] sm:text-[2.25rem]">
            {title}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#152238]/55">
            {description}
          </p>
          <p className="mt-4 text-sm text-[#152238]/40">
            Last updated {LEGAL_EFFECTIVE_DATE}
          </p>
        </header>

        <div className="space-y-8 text-[15px] leading-relaxed text-[#152238]/75 [&_a]:font-medium [&_a]:text-[#152238] [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-[#152238] [&_li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
