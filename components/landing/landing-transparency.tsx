import { GITHUB_URL } from "@/components/landing/constants";
import { DoubleBezel, Section } from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/reveal";

const PROMISES = [
  "No hosted SaaS",
  "No telemetry or analytics",
  "No data resale",
  "No feature paywalls",
] as const;

export function LandingTransparency() {
  return (
    <Section className="bg-foreground text-background">
      <Reveal>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium tracking-[0.2em] text-background/55 uppercase">
              What we don&apos;t do
            </p>
            <h2 className="font-heading text-3xl font-black tracking-[-0.03em] sm:text-4xl">
              Transparent by design
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-background/60">
              Built and maintained by{" "}
              <a
                href="https://github.com/akilasams"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-background underline underline-offset-4 decoration-white/25 hover:decoration-white/60"
              >
                @akilasams
              </a>
              . No company, no investors.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PROMISES.map((item) => (
              <DoubleBezel key={item} dark>
                <p className="px-5 py-4 text-sm text-background/75">{item}</p>
              </DoubleBezel>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <p className="mt-12 text-sm text-background/45">
          Read the source on{" "}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="text-background/70 underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
          >
            GitHub
          </a>
          .
        </p>
      </Reveal>
    </Section>
  );
}
