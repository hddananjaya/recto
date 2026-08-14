import Image from "next/image";

import { FIELD_TYPES } from "@/components/landing/constants";
import {
  DoubleBezel,
  Section,
  SectionHeading,
} from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/reveal";

const FEATURED_INPUTS = [
  { label: "NPS", src: "/images/landing/nps.png", span: "sm:col-span-2 lg:col-span-5" },
  { label: "Matrix", src: "/images/landing/matrix.png", span: "lg:col-span-4" },
  { label: "File upload", src: "/images/landing/file.png", span: "lg:col-span-3" },
] as const;

export function LandingInputs() {
  return (
    <Section className="border-t border-black/[0.04] bg-muted/25">
      <Reveal>
        <SectionHeading
          eyebrow="Included"
          title="Rich inputs. No tiers."
          description="NPS, matrix, and file upload — the blocks serious forms need, without a paid unlock."
        />
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-10 flex flex-wrap gap-2">
          {FIELD_TYPES.map((type) => (
            <span
              key={type}
              className="rounded-full bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-black/[0.06]"
            >
              {type}
            </span>
          ))}
        </div>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
        {FEATURED_INPUTS.map((item, i) => (
          <Reveal key={item.label} delay={0.1 + i * 0.06} className={item.span}>
            <figure>
              <DoubleBezel className="shadow-[0_40px_100px_-48px_rgba(10,10,10,0.16)]">
                <Image
                  src={item.src}
                  alt={item.label}
                  width={390}
                  height={844}
                  className="h-auto w-full"
                />
              </DoubleBezel>
              <figcaption className="mt-4 px-2 text-sm font-semibold text-muted-foreground">
                {item.label}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
