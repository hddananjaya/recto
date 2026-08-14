"use client";

import { LandingCodeBlock } from "@/components/landing/landing-code-block";
import {
  DEV_QUICKSTART,
  GITHUB_URL,
  PROD_QUICKSTART,
} from "@/components/landing/constants";
import { SectionHeader } from "@/components/landing/section-header";
import {
  LANDING_CONTAINER,
  LANDING_SECTION,
} from "@/components/landing/tokens";
import { trackLandingEvent } from "@/lib/landing-analytics";

export function LandingDeploy() {
  return (
    <section id="self-host" className={LANDING_SECTION}>
      <div className={LANDING_CONTAINER}>
        <SectionHeader
          title="Run it on your own server"
          description={
            <>
              One <code className="text-[0.9em]">docker compose up</code> for
              local dev. Postgres, storage, and the app included. Google OAuth
              and Sheets setup for production. See the{" "}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#152238] underline underline-offset-4 transition-colors duration-300 hover:text-[#152238]/70"
                onClick={() => trackLandingEvent("github_star_click")}
              >
                README
              </a>
              .
            </>
          }
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <LandingCodeBlock code={DEV_QUICKSTART} title="local dev" />
          <LandingCodeBlock code={PROD_QUICKSTART} title="docker" />
        </div>
      </div>
    </section>
  );
}
