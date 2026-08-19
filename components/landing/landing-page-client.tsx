"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { LandingHero } from "@/components/landing-hero";
import { LandingHeroShowcase } from "@/components/landing-hero-showcase";
import {
  CLOUD_WAITLIST_PATH,
  GITHUB_URL,
  TRY_APP_PATH,
  TRY_FORM_PATH,
} from "@/components/landing/constants";
import { LandingCloudWaitlist } from "@/components/landing/landing-cloud-waitlist";
import { LandingDeploy } from "@/components/landing/landing-deploy";
import { LandingMobileShowcase } from "@/components/landing/landing-mobile-showcase";
import { LandingQuestionTypes } from "@/components/landing/landing-question-types";
import { LandingNav } from "@/components/landing/landing-nav";
import { Screenshot, SectionHeader } from "@/components/landing/section-header";
import {
  LANDING_BEZEL_SHELL_LIGHT,
  LANDING_BTN_PRIMARY,
  LANDING_BTN_SECONDARY,
  LANDING_CONTAINER,
  LANDING_SECTION,
} from "@/components/landing/tokens";
import { SiteFooter } from "@/components/landing/site-footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trackLandingEvent } from "@/lib/landing-analytics";
import { cn } from "@/lib/utils";

const FAQS: {
  q: string;
  a: React.ReactNode;
}[] = [
  {
    q: "How is this different from Google Forms?",
    a: "More control over layout and branding, plus question types Google Forms doesn't ship. Self-hosted on your infrastructure with direct Sheets sync.",
  },
  {
    q: "How is this different from Typeform?",
    a: "You own the data and host it yourself. No per-response pricing, and every question type is included.",
  },
  {
    q: "Is it free?",
    a: "Yes. MIT licensed. Fork it, self-host it, no license fees.",
  },
  {
    q: "How hard is setup?",
    a: (
      <>
        Docker Compose gets you running locally in minutes. For production you
        need Google OAuth and a Sheets service account. See the{" "}
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
    ),
  },
  {
    q: "Is this production-ready?",
    a: "Yes. Postgres stores submissions on your server, then syncs each row to your Google Sheet.",
  },
  {
    q: "How do I try it?",
    a: (
      <>
        <Link
          href={TRY_APP_PATH}
          onClick={() => trackLandingEvent("try_app_click")}
          className="font-medium text-[#152238] underline underline-offset-4 transition-colors duration-300 hover:text-[#152238]/70"
        >
          Sign in with Google
        </Link>{" "}
        to build forms on our hosted demo — full editor, publish, and Sheets
        sync. No credit card. Or{" "}
        <Link
          href={TRY_FORM_PATH}
          onClick={() => trackLandingEvent("demo_click")}
          className="font-medium text-[#152238] underline underline-offset-4 transition-colors duration-300 hover:text-[#152238]/70"
        >
          fill the sample form
        </Link>{" "}
        if you only want to see the respondent side.
      </>
    ),
  },
  {
    q: "Is there a hosted version?",
    a: (
      <>
        You can{" "}
        <Link
          href={TRY_APP_PATH}
          onClick={() => trackLandingEvent("try_app_click")}
          className="font-medium text-[#152238] underline underline-offset-4 transition-colors duration-300 hover:text-[#152238]/70"
        >
          try Recto on our server
        </Link>{" "}
        today — it&apos;s a shared demo, not a production account. A managed
        cloud product is still on the roadmap;{" "}
        <Link
          href={CLOUD_WAITLIST_PATH}
          onClick={() => trackLandingEvent("waitlist_click")}
          className="font-medium text-[#152238] underline underline-offset-4 transition-colors duration-300 hover:text-[#152238]/70"
        >
          join the waitlist
        </Link>{" "}
        if you want that.
      </>
    ),
  },
  {
    q: "Can I edit forms on the sample?",
    a: (
      <>
        No — the sample is read-only for visitors. To build and edit forms,{" "}
        <Link
          href={TRY_APP_PATH}
          onClick={() => trackLandingEvent("try_app_click")}
          className="font-medium text-[#152238] underline underline-offset-4 transition-colors duration-300 hover:text-[#152238]/70"
        >
          sign in to the hosted demo
        </Link>
        , or self-host from GitHub.
      </>
    ),
  },
];

type LandingPageClientProps = {
  starCount: number | null;
};

export function LandingPageClient({ starCount }: LandingPageClientProps) {
  return (
    <main className="min-h-dvh bg-[#fafaf9] text-[#152238] antialiased">
      <LandingNav starCount={starCount} />
      <LandingHero starCount={starCount} />

      <section id="features" className={LANDING_SECTION}>
        <div className={LANDING_CONTAINER}>
          <SectionHeader
            title="Link a Google Sheet once"
            description="New responses append as rows. Your team keeps working in the same spreadsheet."
          />
          <Screenshot
            src="/images/landing/sheets-connect.webp"
            alt="Google Sheet with waitlist responses synced from a Recto form"
            className="mt-12"
            aspectClassName="aspect-[1440/990]"
          />
        </div>
      </section>

      <section className={LANDING_SECTION}>
        <div className={LANDING_CONTAINER}>
          <SectionHeader
            title="Build forms from your phone"
            description="Change questions, themes, and settings from your phone. Same editor, smaller screen."
          />
          <LandingMobileShowcase />
          <p className="mt-10 text-center text-[15px] text-[#152238]/55">
            <Link
              href={TRY_APP_PATH}
              onClick={() => trackLandingEvent("try_app_click")}
              className="font-medium text-[#152238] underline underline-offset-4 transition-colors duration-300 hover:text-[#152238]/70"
            >
              Try the editor on our hosted demo
            </Link>
            {" · "}
            <Link
              href={TRY_FORM_PATH}
              onClick={() => trackLandingEvent("demo_click")}
              className="font-medium text-[#152238]/70 underline underline-offset-4 transition-colors duration-300 hover:text-[#152238]"
            >
              See sample form
            </Link>
          </p>
        </div>
      </section>

      <LandingHeroShowcase />

      <LandingQuestionTypes />

      <LandingDeploy />

      <LandingCloudWaitlist />

      <section id="faq" className={LANDING_SECTION}>
        <div className={LANDING_CONTAINER}>
          <SectionHeader title="FAQ" className="w-full max-w-2xl" />
          <Accordion className="mx-auto mt-10 w-full max-w-2xl text-left">
            {FAQS.map((faq) => (
              <AccordionItem
                key={faq.q}
                value={faq.q}
                className="border-[#152238]/8"
              >
                <AccordionTrigger className="px-0 py-4 text-left text-[15px] font-medium tracking-[-0.01em] hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-4 text-[15px] leading-relaxed text-[#152238]/55">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Double-Bezel CTA card */}
      <section className={LANDING_SECTION}>
        <div className={LANDING_CONTAINER}>
          <div
            className={cn(
              "rounded-[1.75rem] p-2 ring-1 ring-[#152238]/[0.05] sm:rounded-[2rem] sm:p-2.5",
              LANDING_BEZEL_SHELL_LIGHT,
            )}
          >
            <div className="rounded-[calc(1.75rem-0.5rem)] bg-white px-8 py-16 text-center shadow-[0_2px_8px_rgba(0,0,0,0.03),0_12px_40px_rgba(0,0,0,0.05)] sm:rounded-[calc(2rem-0.625rem)] sm:px-12 sm:py-20">
              <h2 className="font-heading text-[1.75rem] font-semibold tracking-[-0.025em] sm:text-[2.25rem]">
                Build a form in minutes
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-[#152238]/55 sm:text-lg">
                Sign in with Google, create a form, link a Sheet, and publish.
                Free on our hosted demo — accounts and data may be cleared
                without notice.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href={TRY_APP_PATH}
                  onClick={() => trackLandingEvent("try_app_click")}
                  className={LANDING_BTN_PRIMARY}
                >
                  Create a Free Form
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
              <p className="mx-auto mt-6 text-[13px] text-[#152238]/40">
                Only filling out a form?{" "}
                <Link
                  href={TRY_FORM_PATH}
                  onClick={() => trackLandingEvent("demo_click")}
                  className="font-medium text-[#152238]/55 underline underline-offset-4 transition-colors hover:text-[#152238]/70"
                >
                  See the sample form
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter
        starCount={starCount}
        onGithubClick={() => trackLandingEvent("github_star_click")}
      />
    </main>
  );
}
