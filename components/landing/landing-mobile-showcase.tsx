"use client";

import { Screenshot } from "@/components/landing/section-header";
import {
  LANDING_PHONE_ASPECT,
  LANDING_PHONE_IMAGE,
} from "@/components/landing/tokens";

const PHONES = [
  {
    src: "/images/landing/mobile-editor-1.webp",
    alt: "Mobile form editor — question list",
    className:
      "relative z-20 w-[min(84vw,340px)] -rotate-[3deg] sm:absolute sm:left-[4%] sm:top-0 sm:w-[54%] sm:max-w-[360px] sm:-rotate-[5deg]",
    shadow:
      "shadow-[0_40px_100px_-32px_rgba(21,34,56,0.22)] sm:shadow-[0_48px_120px_-36px_rgba(21,34,56,0.24)]",
  },
  {
    src: "/images/landing/mobile-editor-2.webp",
    alt: "Mobile form editor — editing a question",
    className:
      "relative z-10 -mt-20 w-[min(78vw,300px)] rotate-[4deg] sm:absolute sm:right-[2%] sm:top-20 sm:mt-0 sm:w-[50%] sm:max-w-[330px] sm:rotate-[7deg]",
    shadow:
      "shadow-[0_32px_80px_-28px_rgba(21,34,56,0.18)] sm:shadow-[0_40px_100px_-32px_rgba(21,34,56,0.2)]",
  },
] as const;

export function LandingMobileShowcase() {
  return (
    <div className="relative mx-auto mt-14 w-full max-w-4xl sm:mt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(100vw,520px)] w-[min(100vw,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(21,34,56,0.07)_0%,transparent_70%)]"
      />

      <div className="relative mx-auto flex flex-col items-center sm:block sm:min-h-[680px] sm:max-w-[780px]">
        {PHONES.map((phone) => (
          <div key={phone.src} className={phone.className}>
            <Screenshot
              src={phone.src}
              alt={phone.alt}
              aspectClassName={LANDING_PHONE_ASPECT}
              imageClassName={LANDING_PHONE_IMAGE}
              sizes="(max-width: 640px) 84vw, 360px"
              className={phone.shadow}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
