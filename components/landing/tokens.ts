/** Shared landing layout tokens — Soft Structuralism aesthetic */

export const LANDING_CONTAINER = "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8";
export const LANDING_SECTION = "py-24 sm:py-32";

/** Opaque double-bezel shells — solid fills so stacked frames don't show through */
export const LANDING_BEZEL_SHELL_LIGHT = "isolate bg-[#f3f3f2]";
export const LANDING_BEZEL_SHELL_DARK = "isolate bg-[#1e2738]";

/** 750×1334 mobile screenshots (editor + question types) */
export const LANDING_PHONE_ASPECT = "aspect-[750/1334]";
export const LANDING_PHONE_IMAGE = "object-contain object-center";

/** 4800×2400 desktop published-form theme screenshots */
export const LANDING_DESKTOP_ASPECT = "aspect-[2/1]";
export const LANDING_DESKTOP_IMAGE = "object-contain object-center";

/** Premium easing curve (Apple-style spring) */
export const LANDING_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

/** Rounded pill primary button with press physics */
export const LANDING_BTN_PRIMARY =
  "group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#152238] px-7 text-[15px] font-medium text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#1d2d47] active:scale-[0.98]";

/** Rounded pill secondary button with subtle ring */
export const LANDING_BTN_SECONDARY =
  "group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-medium text-[#152238] ring-1 ring-[#152238]/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#f5f5f4] hover:ring-[#152238]/20 active:scale-[0.98]";
