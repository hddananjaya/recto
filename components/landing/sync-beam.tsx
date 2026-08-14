"use client";

import { motion, useReducedMotion } from "framer-motion";

export function SyncBeam({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 120 48"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M4 24 H44"
        stroke="url(#beam-line)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M76 24 H116"
        stroke="url(#beam-line)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="60" cy="24" r="10" fill="rgba(134,203,238,0.15)" />
      <circle cx="60" cy="24" r="5" fill="#86cbee" />
      {!reduceMotion ? (
        <motion.circle
          cx="4"
          cy="24"
          r="3"
          fill="#86cbee"
          animate={{ cx: [4, 60, 116] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.6,
          }}
        />
      ) : (
        <circle cx="60" cy="24" r="3" fill="#86cbee" />
      )}
      <defs>
        <linearGradient id="beam-line" x1="0" y1="0" x2="120" y2="0">
          <stop stopColor="#86cbee" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#86cbee" />
          <stop offset="1" stopColor="#34a853" stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
