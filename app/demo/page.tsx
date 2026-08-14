"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FormRenderer } from "@/components/form-renderer";
import { FormBackgroundGrain } from "@/components/form-theme";
import { formThemes } from "@/lib/form-themes";
import type { Question } from "@/lib/types";

const demoThemes = formThemes.filter((t) => t.id !== "none");

const demoQuestions: Question[] = [
  {
    id: "name",
    type: "text",
    title: "What's your name?",
    required: true,
    placeholder: "Ada Lovelace",
  },
  {
    id: "email",
    type: "email",
    title: "What's your email?",
    required: true,
    placeholder: "ada@example.com",
  },
  {
    id: "role",
    type: "single_select",
    title: "What best describes you?",
    required: true,
    options: [
      { label: "Founder", value: "founder" },
      { label: "Product Lead", value: "product" },
      { label: "Designer", value: "designer" },
      { label: "Engineer", value: "engineer" },
    ],
  },
  {
    id: "services",
    type: "multi_select",
    title: "What services interest you?",
    required: true,
    options: [
      { label: "Strategy", value: "strategy" },
      { label: "Branding", value: "branding" },
      { label: "Product Design", value: "design" },
      { label: "Engineering", value: "engineering" },
      { label: "Growth", value: "growth" },
    ],
  },
  {
    id: "notes",
    type: "textarea",
    title: "Anything else we should know?",
    required: false,
    placeholder: "Optional context for your request…",
  },
  {
    id: "nps",
    type: "nps",
    title: "How likely are you to recommend us?",
    required: true,
  },
  {
    id: "rating",
    type: "rating",
    title: "Rate your experience",
    required: true,
    maxRating: 5,
  },
];

export default function DemoPage() {
  const [active, setActive] = useState(demoThemes[0]);

  return (
    <>
      <motion.div
        key={active.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="fixed inset-0"
        style={{
          background:
            active.backgroundFrom && active.backgroundTo
              ? `linear-gradient(160deg, ${active.backgroundFrom} 0%, ${active.backgroundTo} 100%)`
              : undefined,
        }}
      />

      <FormBackgroundGrain className="fixed inset-0 z-1" />

      <div className="fixed inset-0 z-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={active.backgroundImage ?? ""}
              alt={active.label}
              fill
              priority
              sizes="100vw"
              className="object-cover object-bottom"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="pointer-events-none fixed inset-0 z-3"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, transparent 0%, rgba(15,23,42,0.28) 100%)",
        }}
      />

      <div className="fixed left-6 top-6 z-20">
        <span className="text-lg font-bold tracking-tight text-white/95">
          Recto
        </span>
      </div>

      <main className="relative z-10 flex min-h-dvh items-center justify-center overflow-y-auto px-4 py-20 font-sans">
        <FormRenderer
          formId="demo"
          title="Try it now"
          description="A premium form experience. One question at a time."
          questions={demoQuestions}
          theme={active}
          onSubmit={async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }}
        />
      </main>

      <div className="fixed left-1/2 top-[max(3.75rem,env(safe-area-inset-top))] z-20 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 gap-1 overflow-x-auto rounded-full border border-white/15 bg-white/10 p-1.5 shadow-lg shadow-black/10 backdrop-blur-xl sm:top-auto sm:bottom-6 sm:max-w-none">
        {demoThemes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => setActive(theme)}
            className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              active.id === theme.id
                ? "text-slate-900"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {active.id === theme.id && (
              <motion.div
                layoutId="active-bg"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{theme.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
