"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUp } from "@phosphor-icons/react/dist/ssr";

import { AI_PROMPT_MAX_LENGTH } from "@/lib/ai/config";
import { trackLandingEvent } from "@/lib/landing-analytics";
import { cn } from "@/lib/utils";

type LandingPromptFormProps = {
  className?: string;
};

export function LandingPromptForm({ className }: LandingPromptFormProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  function goToPlayground(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    trackLandingEvent("playground_start");
    const params = new URLSearchParams({ prompt: trimmed });
    router.push(`/playground?${params.toString()}`);
  }

  const canSubmit = prompt.trim().length > 0;

  return (
    <div className={cn("w-full", className)}>
      <label className="sr-only" htmlFor="landing-form-prompt">
        Describe your form
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-[#152238]/12 bg-white px-4 py-2 shadow-sm focus-within:border-[#2b6ecb]/40 focus-within:ring-2 focus-within:ring-[#2b6ecb]/15">
        <textarea
          id="landing-form-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Beta waitlist with email and NPS…"
          rows={1}
          maxLength={AI_PROMPT_MAX_LENGTH}
          className="block min-h-[2.5rem] flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed text-[#152238] outline-none placeholder:text-[#152238]/40"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSubmit) goToPlayground(prompt);
            }
          }}
        />
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => goToPlayground(prompt)}
          aria-label="Generate form"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
            canSubmit
              ? "bg-[#152238] text-white hover:bg-[#152238]/90"
              : "bg-[#152238]/8 text-[#152238]/30",
          )}
        >
          <ArrowUp weight="bold" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
