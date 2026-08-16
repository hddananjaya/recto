"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { DoubleBezel, Section, SectionHeading } from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/reveal";

export function LandingMobile() {
  const mobileRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: mobileRef,
    offset: ["start end", "end start"],
  });
  const phoneY = useTransform(scrollYProgress, [0, 1], [48, -48]);

  return (
    <Section id="mobile" innerClassName="overflow-hidden">
      <div ref={mobileRef} className="grid items-center gap-16 lg:grid-cols-2">
        <Reveal>
          <SectionHeading
            eyebrow="Mobile"
            title="Edit and publish from your phone"
            description="The full editor works on mobile — questions, themes, and Sheet connection included."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <motion.div
            style={{ y: phoneY }}
            className="relative mx-auto h-130 w-full max-w-105 max-md:static max-md:h-auto"
          >
            <div className="absolute right-0 top-16 z-1 w-[54%] rotate-[6deg] max-md:static max-md:mb-5 max-md:w-full max-md:rotate-0">
              <DoubleBezel className="shadow-[0_40px_100px_-40px_rgba(10,10,10,0.2)]">
                <Image
                  src="/images/landing/mobile-editor-2.webp"
                  alt="Mobile theme editor"
                  width={390}
                  height={844}
                  className="h-auto w-full"
                />
              </DoubleBezel>
            </div>
            <div className="absolute left-0 top-0 z-2 w-[54%] -rotate-5 max-md:static max-md:w-full max-md:rotate-0">
              <DoubleBezel className="shadow-[0_48px_110px_-40px_rgba(10,10,10,0.24)]">
                <Image
                  src="/images/landing/mobile-editor-1.webp"
                  alt="Mobile question editor"
                  width={390}
                  height={844}
                  className="h-auto w-full"
                />
              </DoubleBezel>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </Section>
  );
}
