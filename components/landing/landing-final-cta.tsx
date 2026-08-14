import { GITHUB_URL, TRY_APP_PATH } from "@/components/landing/constants";
import { PremiumCta } from "@/components/landing/premium-cta";
import {
  DoubleBezel,
  Section,
} from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/reveal";

type LandingFinalCtaProps = {
  starCount: number | null;
  aiConfigured: boolean;
};

export function LandingFinalCta({
  starCount,
  aiConfigured,
}: LandingFinalCtaProps) {
  const starLabel =
    starCount !== null ? `Star on GitHub · ${starCount}` : "Star on GitHub";

  return (
    <Section className="pb-32 pt-8">
      <Reveal>
        <DoubleBezel
          dark
          className="shadow-[0_80px_160px_-80px_rgba(0,0,0,0.45)]"
        >
          <div className="flex flex-col gap-10 p-8 text-background sm:p-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-lg">
              <p className="text-[10px] font-medium tracking-[0.2em] text-background/50 uppercase">
                Get started
              </p>
              <h2 className="mt-4 font-heading text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                Own your forms. Own your data.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-background/60">
                Try the demo now — no account needed. Star the repo or self-host
                when you&apos;re ready.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PremiumCta
                href={TRY_APP_PATH}
                icon="play"
                trackEvent="try_app_click"
                className="bg-background text-foreground hover:bg-background/90"
              >
                Try Recto
              </PremiumCta>
              {aiConfigured ? (
                <PremiumCta
                  href="/playground"
                  variant="outline"
                  icon="arrow-right"
                  trackEvent="playground_click"
                  className="bg-transparent text-background ring-white/15 hover:bg-white/10"
                >
                  Try playground
                </PremiumCta>
              ) : null}
              <PremiumCta
                href={GITHUB_URL}
                external
                variant="outline"
                icon="github"
                trackEvent="github_star_click"
                className="bg-transparent text-background ring-white/15 hover:bg-white/10"
              >
                {starLabel}
              </PremiumCta>
            </div>
          </div>
        </DoubleBezel>
      </Reveal>
    </Section>
  );
}
