"use client";

import { Check, Copy } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { DoubleBezel } from "@/components/landing/primitives";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

type LandingCodeBlockProps = {
  code: string;
  title?: string;
  className?: string;
};

export function LandingCodeBlock({
  code,
  title = "terminal",
  className,
}: LandingCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(code, "Copied commands");
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <DoubleBezel
      dark
      className={cn("shadow-[0_48px_120px_-64px_rgba(0,0,0,0.35)]", className)}
      innerClassName="bg-zinc-950 font-mono text-sm text-zinc-100"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-3 text-[11px] tracking-wide text-zinc-500 uppercase">
          {title}
        </span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-zinc-400 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/10 hover:text-zinc-200 active:scale-[0.98]"
        >
          {copied ? (
            <Check weight="bold" className="h-3.5 w-3.5" />
          ) : (
            <Copy weight="bold" className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed whitespace-pre-wrap sm:p-6">
        {code}
      </pre>
    </DoubleBezel>
  );
}
