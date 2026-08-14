"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import {
  GITHUB_URL,
  TRY_APP_PATH,
  TRY_FORM_PATH,
} from "@/components/landing/constants";
import { Screenshot } from "@/components/landing/section-header";
import {
  LANDING_BTN_PRIMARY,
  LANDING_BTN_SECONDARY,
  LANDING_CONTAINER,
} from "@/components/landing/tokens";
import { trackLandingEvent } from "@/lib/landing-analytics";

type LandingHeroProps = {
  starCount: number | null;
};

export function LandingHero({ starCount }: LandingHeroProps) {
  return (
    <section className="overflow-hidden">
      <div
        className={`${LANDING_CONTAINER} pb-24 pt-[223px] text-center sm:pb-32`}
      >
        <h1 className="mx-auto max-w-4xl font-heading text-[2.75rem] font-semibold tracking-[-0.035em] text-balance leading-[1.05] text-[#152238] sm:text-[3.25rem] lg:text-[4rem]">
          Open-source forms that sync to Google Sheets
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#152238]/55 sm:text-xl">
          Build forms, link a Google Sheet, and publish. Every response becomes
          a new row — no export step.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={TRY_APP_PATH}
            onClick={() => trackLandingEvent("try_app_click")}
            className={LANDING_BTN_PRIMARY}
          >
            Try Recto
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
              <ArrowRight weight="bold" className="h-3 w-3" />
            </span>
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackLandingEvent("github_star_click")}
            className={LANDING_BTN_SECONDARY}
          >
            Star on GitHub
          </a>
        </div>

        <p className="mt-5 text-sm text-[#152238]/45">
          Try free with Google · Self-host from GitHub · MIT
          {starCount !== null
            ? ` · ${starCount.toLocaleString()} GitHub stars`
            : ""}
        </p>

        <p className="mt-2 text-sm text-[#152238]/45">
          Just want to fill a form?{" "}
          <Link
            href={TRY_FORM_PATH}
            onClick={() => trackLandingEvent("demo_click")}
            className="font-medium text-[#152238]/65 underline underline-offset-4 transition-colors duration-300 hover:text-[#152238]"
          >
            See the sample form
          </Link>
        </p>

        <Screenshot
          src="/images/theme-dusk-desktop.png"
          alt="Published form with sky gradient theme"
          className="mt-16"
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
        />
      </div>
    </section>
  );
}
