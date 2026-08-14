import { GITHUB_URL } from "@/components/landing/constants";
import { PremiumCta } from "@/components/landing/premium-cta";
import {
  DoubleBezel,
  Section,
} from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/reveal";

type LandingOssCtaProps = {
  starCount: number | null;
};

export function LandingOssCta({ starCount }: LandingOssCtaProps) {
  const starLabel =
    starCount !== null ? `Star on GitHub · ${starCount}` : "Star on GitHub";

  return (
    <Section className="border-y border-black/[0.04] bg-muted/20">
      <Reveal>
        <DoubleBezel>
          <div className="flex flex-col gap-8 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="max-w-xl">
              <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Open source
              </p>
              <h2 className="mt-4 font-heading text-2xl font-black tracking-tight sm:text-3xl">
                MIT licensed. Built by one person.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                No company, no investors, no data harvesting. Just code you can
                read, fork, and run. If it helps you, a star helps me keep
                building.
              </p>
            </div>
            <PremiumCta
              href={GITHUB_URL}
              external
              icon="github"
              trackEvent="github_star_click"
            >
              {starLabel}
            </PremiumCta>
          </div>
        </DoubleBezel>
      </Reveal>
    </Section>
  );
}
