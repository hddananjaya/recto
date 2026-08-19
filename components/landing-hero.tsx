"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { motion } from "framer-motion";

import {
  GITHUB_URL,
  TRY_APP_PATH,
  TRY_FORM_PATH,
} from "@/components/landing/constants";
import {
  LANDING_BTN_PRIMARY,
  LANDING_BTN_SECONDARY,
  LANDING_CONTAINER,
} from "@/components/landing/tokens";
import { trackLandingEvent } from "@/lib/landing-analytics";

const VIDEO_ID = "gWT3sc6kBfw";

type LandingHeroProps = {
  starCount: number | null;
};

// Reusable smooth easing
const EASE = [0.16, 1, 0.3, 1];

export function LandingHero({ starCount }: LandingHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="overflow-hidden">
      <div
        className={`${LANDING_CONTAINER} pb-24 pt-[223px] text-center sm:pb-32 flex flex-col items-center`}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mx-auto max-w-4xl font-heading text-[2.75rem] font-semibold tracking-[-0.035em] text-balance leading-[1.05] text-[#152238] sm:text-[3.25rem] lg:text-[4rem]"
        >
          Open-source forms that sync to Google Sheets
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#152238]/55 sm:text-xl"
        >
          Build forms, link a Google Sheet, and publish. Every response becomes
          a new row — no export step.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
          className="mt-6"
        >
          <a
            href="https://recto.cloud/f/vlqtqi"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackLandingEvent("demo_click")}
            className="text-sm font-medium text-[#152238]/65 underline underline-offset-4 transition-colors duration-300 hover:text-[#152238]"
          >
            See the sample form
          </a>
        </motion.div>

        {/* Video embed — thumbnail with play button, swaps to iframe on click */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: EASE }}
          className="mt-16 w-full max-w-5xl mx-auto aspect-video rounded-xl overflow-hidden shadow-2xl border border-[#152238]/10"
        >
          {isPlaying ? (
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
              title="Recto demo video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <button
              onClick={() => setIsPlaying(true)}
              aria-label="Play demo video"
              className="relative w-full h-full group block"
            >
              {/* Thumbnail */}
              <img
                src="/images/landing/video-preview.png"
                alt="Recto demo video thumbnail"
                className="w-full h-full object-cover"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <svg
                    className="h-6 w-6 sm:h-8 sm:w-8 translate-x-0.5 text-[#152238]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
