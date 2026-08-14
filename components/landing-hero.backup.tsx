/**
 * BACKUP — original landing hero (pre design-taste-v1 redesign)
 *
 * To revert:
 * 1. In app/page.tsx, replace `<LandingHero />` with the JSX below (or import LandingHeroBackup)
 * 2. Or copy this file to landing-hero.tsx
 *
 * Saved: 2026-08-11
 */
import Image from "next/image";
import Link from "next/link";

import { LandingPromptForm } from "@/components/landing-prompt-form";

export function LandingHeroBackup() {
  return (
    <section className="px-3 pt-0 sm:px-4">
      <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(rgb(43,110,203),rgb(134,203,238))] shadow-[inset_3px_-4px_37px_0px_rgba(0,0,0,0.1)]">
        <div className="relative flex h-[min(calc(100svh-5rem),46rem)] flex-col overflow-hidden sm:h-[calc(100svh-5rem)]">
          <Image
            src="/images/2.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="pointer-events-none absolute inset-0 object-cover object-bottom opacity-90"
          />

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10 text-center text-white sm:px-8">
            <div className="w-full max-w-3xl">
              <h1 className="font-heading text-[1.85rem] leading-[1.12] font-black text-balance sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Open-source forms that write to{" "}
                <span className="italic opacity-60">Google Sheets</span>
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-white/90 md:text-lg">
                Build beautiful, self-hostable forms in minutes. Responses save
                instantly and sync to your Google Sheet.
              </p>

              <div className="mt-6 text-left sm:mt-8">
                <LandingPromptForm className="w-full shadow-[0_16px_40px_-12px_rgba(26,79,156,0.3)]" />
                <p className="mt-4 text-center text-sm text-white/75">
                  Or{" "}
                  <Link
                    href="/forms/new"
                    className="font-medium text-white underline-offset-4 hover:underline"
                  >
                    create your first form manually
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="hidden scale-75 gap-2 md:flex">
            <div className="absolute -bottom-70 left-1/2 h-96 -translate-x-40">
              {[
                { rotate: "rotate-12", left: "left-100", top: "top-80" },
                {
                  rotate: "rotate-6 hue-rotate-270",
                  left: "left-40",
                  top: "top-50",
                },
                { rotate: "-rotate-6", left: "-left-10", top: "top-50" },
                { rotate: "rotate-12", left: "-left-50", top: "top-80" },
                { rotate: "-rotate-10", left: "-left-80", top: "top-100" },
              ].map((style, i) => (
                <div
                  key={i}
                  className={`absolute aspect-[21/29] w-96 overflow-hidden rounded-md shadow-2xl transition-all hover:rotate-0 hover:-translate-y-16 ${style.rotate} ${style.left} ${style.top}`}
                >
                  <Image
                    src={`/images/${(i % 4) + 1}.png`}
                    alt={`Preview ${i + 1}`}
                    fill
                    sizes="400px"
                    className="bg-white object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex scale-75 gap-2 md:hidden">
            <div className="absolute -bottom-70 left-1/2 h-96 -translate-x-40 -translate-y-30">
              {[
                {
                  rotate: "rotate-6 hue-rotate-270",
                  left: "left-40",
                  top: "top-100",
                },
                { rotate: "-rotate-6", left: "-left-20", top: "top-100" },
              ].map((style, i) => (
                <div
                  key={i}
                  className={`absolute aspect-[21/29] w-96 overflow-hidden rounded-md shadow-2xl transition-all hover:rotate-0 hover:-translate-y-16 ${style.rotate} ${style.left} ${style.top}`}
                >
                  <Image
                    src={`/images/${(i % 4) + 1}.png`}
                    alt={`Preview ${i + 1}`}
                    fill
                    sizes="400px"
                    className="bg-white object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
