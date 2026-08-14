"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { CLOUD_WAITLIST_PATH } from "@/components/landing/constants";
import {
  LANDING_BEZEL_SHELL_LIGHT,
  LANDING_BTN_PRIMARY,
  LANDING_CONTAINER,
  LANDING_SECTION,
} from "@/components/landing/tokens";
import { trackLandingEvent } from "@/lib/landing-analytics";
import { cn } from "@/lib/utils";

export function LandingCloudWaitlist() {
  return (
    <section id="cloud-waitlist" className={LANDING_SECTION}>
      <div className={LANDING_CONTAINER}>
        <div
          className={cn(
            "rounded-[1.75rem] p-2 ring-1 ring-[#152238]/5 sm:rounded-[2rem] sm:p-2.5",
            LANDING_BEZEL_SHELL_LIGHT,
          )}
        >
          <div className="rounded-[calc(1.75rem-0.5rem)] bg-white px-8 py-16 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03),0_12px_40px_rgba(0,0,0,0.05)] sm:rounded-[calc(2rem-0.625rem)] sm:px-12 sm:py-20">
            <h2 className="font-heading text-[1.75rem] font-semibold tracking-tight text-[#152238] sm:text-[2.25rem]">
              Want hosted Recto?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#152238]/55 sm:text-lg">
              Managed hosting isn&apos;t live yet. If you&apos;d rather not run
              your own server, join the waitlist and we&apos;ll email you when
              cloud signup opens.
            </p>
            <div className="mt-8">
              <Link
                href={CLOUD_WAITLIST_PATH}
                onClick={() => trackLandingEvent("waitlist_click")}
                className={LANDING_BTN_PRIMARY}
              >
                Join cloud waitlist
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                  <ArrowRight weight="bold" className="h-3 w-3" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
