import Link from "next/link";

import { GITHUB_URL, TRY_APP_PATH, TRY_FORM_PATH } from "@/components/landing/constants";
import { PremiumCta } from "@/components/landing/premium-cta";
import {
  DoubleBezel,
  Section,
  SectionHeading,
} from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/reveal";

const ROWS = [
  { label: "Hosting", hosted: "Their cloud", recto: "Your server" },
  { label: "Data", hosted: "Their database", recto: "Your Postgres + your Sheet" },
  { label: "Pricing", hosted: "Tiers for features", recto: "MIT, all types included" },
  { label: "AI builder", hosted: "Paid add-on", recto: "In repo (your API key)" },
] as const;

type LandingComparisonProps = {
  aiConfigured: boolean;
};

export function LandingComparison({ aiConfigured }: LandingComparisonProps) {
  return (
    <Section className="bg-muted/30">
      <Reveal>
        <SectionHeading
          eyebrow="Compare"
          title="Hosted tools vs. self-hosted Recto"
          description={
            <>
              Factual trade-offs — no dunking. Inspect the source on{" "}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline underline-offset-4 decoration-black/15 hover:decoration-foreground"
              >
                GitHub
              </a>
              .
            </>
          }
        />
      </Reveal>

      <Reveal delay={0.1}>
        <DoubleBezel className="mt-16 shadow-[0_48px_120px_-64px_rgba(10,10,10,0.18)]">
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-muted/50 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                <div className="px-6 py-5" />
                <div className="border-l border-black/[0.05] px-6 py-5">
                  Typeform / hosted
                </div>
                <div className="border-l border-black/[0.05] px-6 py-5">Recto</div>
              </div>
              {ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[1.1fr_1fr_1fr] text-sm ${
                    i < ROWS.length - 1 ? "border-t border-black/[0.05]" : ""
                  }`}
                >
                  <div className="px-6 py-5 font-medium text-muted-foreground">
                    {row.label}
                  </div>
                  <div className="border-l border-black/[0.05] px-6 py-5 text-muted-foreground">
                    {row.hosted}
                  </div>
                  <div className="border-l border-black/[0.05] px-6 py-5 font-semibold text-foreground">
                    {row.recto}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DoubleBezel>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <PremiumCta href={TRY_APP_PATH} icon="play" trackEvent="try_app_click">
            Try Recto
          </PremiumCta>
          {aiConfigured ? (
            <PremiumCta
              href="/playground"
              variant="outline"
              icon="arrow-right"
              trackEvent="playground_click"
            >
              Open playground
            </PremiumCta>
          ) : (
            <Link
              href={TRY_FORM_PATH}
              className="text-sm font-medium text-muted-foreground underline underline-offset-4 decoration-black/15 transition-colors hover:text-foreground hover:decoration-foreground"
            >
              No AI on this server — sample form still works
            </Link>
          )}
        </div>
      </Reveal>
    </Section>
  );
}
