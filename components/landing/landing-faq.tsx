import { FAQS } from "@/components/landing/constants";
import { DoubleBezel, Section, SectionHeading } from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function LandingFaq() {
  return (
    <Section id="faq" innerClassName="max-w-3xl">
      <Reveal>
        <SectionHeading eyebrow="FAQ" title="Straight answers" />
      </Reveal>

      <Reveal delay={0.1}>
        <DoubleBezel className="mt-14">
          <Accordion defaultValue={[]} className="px-2">
            {FAQS.map((faq) => (
              <AccordionItem
                key={faq.q}
                value={faq.q}
                className="border-black/[0.06] px-4"
              >
                <AccordionTrigger className="py-5 text-left text-[15px] font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </DoubleBezel>
      </Reveal>
    </Section>
  );
}
