import Image from "next/image";

import {
  DoubleBezel,
  Section,
  SectionHeading,
} from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/reveal";

const STEPS = [
  {
    title: "Describe",
    subtitle: "AI drafts the structure",
    src: "/images/landing/step-1.png",
    alt: "Describe a form with AI",
    span: "lg:col-span-7 lg:row-span-2",
  },
  {
    title: "Publish",
    subtitle: "Theme, sheet, share link",
    src: "/images/landing/step-2.png",
    alt: "Editor with themes and Sheets",
    span: "lg:col-span-5",
  },
] as const;

type LandingProductProps = {
  aiConfigured: boolean;
};

export function LandingProduct({ aiConfigured }: LandingProductProps) {
  return (
    <Section id="product" className="border-t border-black/[0.04]">
      <Reveal>
        <SectionHeading
          eyebrow="The workflow"
          title="Prompt in. Form out."
          description="Two screens you already know: what you asked for, and what you can edit before you ship."
        />
      </Reveal>

      <div className="mt-16 grid gap-5 lg:grid-cols-12 lg:grid-rows-2 lg:gap-6">
        {STEPS.map((step, i) => (
          <Reveal
            key={step.title}
            delay={0.06 + i * 0.08}
            className={step.span}
          >
            <DoubleBezel className="h-full shadow-[0_48px_120px_-56px_rgba(10,10,10,0.2)]">
              <figure className="flex h-full flex-col">
                <div className="relative aspect-16/10 w-full lg:aspect-auto lg:min-h-[280px] lg:flex-1">
                  <Image
                    src={step.src}
                    alt={step.alt}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 720px"
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-4 border-t border-black/[0.05] px-6 py-5">
                  <span className="font-heading text-base font-bold tracking-tight">
                    {step.title}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {step.subtitle}
                  </span>
                </figcaption>
              </figure>
            </DoubleBezel>
          </Reveal>
        ))}

        <Reveal delay={0.2} className="lg:col-span-5">
          <DoubleBezel className="h-full">
            <div className="flex h-full min-h-[180px] flex-col justify-between p-8">
              <div>
                <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                  Zero friction
                </p>
                <p className="mt-3 font-heading text-2xl font-black tracking-tight">
                  Try before you deploy
                </p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {aiConfigured
                  ? "Demo and playground run without sign-in. Self-host when you want persistence and Sheets sync."
                  : "The live demo runs without sign-in. Self-host when you want persistence and Sheets sync."}
              </p>
            </div>
          </DoubleBezel>
        </Reveal>
      </div>
    </Section>
  );
}
