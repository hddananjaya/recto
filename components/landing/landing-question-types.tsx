"use client";

import { useState } from "react";

import { Screenshot, SectionHeader } from "@/components/landing/section-header";
import {
  LANDING_CONTAINER,
  LANDING_PHONE_ASPECT,
  LANDING_PHONE_IMAGE,
  LANDING_SECTION,
} from "@/components/landing/tokens";
import {
  DEFAULT_LANDING_QUESTION_TYPE,
  LANDING_QUESTION_TYPES,
  type LandingQuestionType,
} from "@/lib/landing-question-types";
import { cn } from "@/lib/utils";

function TypeChip({
  type,
  active,
  onSelect,
}: {
  type: LandingQuestionType;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-300",
        active
          ? "bg-[#152238] text-white shadow-[0_4px_14px_-4px_rgba(21,34,56,0.35)]"
          : "bg-white text-[#152238]/60 ring-1 ring-[#152238]/10 hover:text-[#152238] hover:ring-[#152238]/20",
      )}
    >
      {type.shortLabel ?? type.label}
    </button>
  );
}

function TypeDescription({ type }: { type: LandingQuestionType }) {
  return (
    <div
      key={type.id}
      className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-[#152238]/6 sm:p-6"
    >
      <h3 className="font-heading text-[15px] font-semibold tracking-tight text-[#152238]">
        {type.label}
      </h3>
      <p className="mt-3 text-[14px] leading-relaxed text-[#152238]/55">
        <span className="font-medium text-[#152238]/70">Use when </span>
        {type.whenToUse}
      </p>
      <p className="mt-3 text-[14px] leading-relaxed text-[#152238]/45">
        <span className="font-medium text-[#152238]/55">Example </span>
        <span className="text-[#152238]/60">&ldquo;{type.example}&rdquo;</span>
      </p>
    </div>
  );
}

export function LandingQuestionTypes() {
  const [selectedId, setSelectedId] = useState(DEFAULT_LANDING_QUESTION_TYPE);
  const selected =
    LANDING_QUESTION_TYPES.find((t) => t.id === selectedId) ??
    LANDING_QUESTION_TYPES[0];

  return (
    <section className={LANDING_SECTION}>
      <div className={LANDING_CONTAINER}>
        <SectionHeader
          title="Every question type included"
          description="NPS, matrix, file upload, signatures, and more. Nothing locked behind a paywall."
        />

        <div className="mt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-start lg:gap-12 xl:gap-16">
          <div>
            <div
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
              role="tablist"
              aria-label="Question types"
            >
              {LANDING_QUESTION_TYPES.map((type) => (
                <TypeChip
                  key={type.id}
                  type={type}
                  active={type.id === selectedId}
                  onSelect={() => setSelectedId(type.id)}
                />
              ))}
            </div>

            <TypeDescription type={selected} />
          </div>

          <div className="mt-8 lg:mt-0">
            <div
              role="tabpanel"
              aria-label={selected.label}
              className="mx-auto w-full max-w-[340px]"
            >
              <Screenshot
                key={selected.id}
                src={selected.src}
                alt={`${selected.label} question type`}
                aspectClassName={LANDING_PHONE_ASPECT}
                imageClassName={LANDING_PHONE_IMAGE}
                sizes="(max-width: 1024px) 85vw, 340px"
                className="shadow-[0_40px_100px_-36px_rgba(21,34,56,0.22)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
