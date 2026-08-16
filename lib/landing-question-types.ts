import type { AiQuestionType } from "@/lib/ai/question-types";
import { QUESTION_TYPE_GUIDE } from "@/lib/ai/question-types";

export type LandingQuestionType = {
  id: AiQuestionType;
  label: string;
  shortLabel?: string;
  src: string;
  whenToUse: string;
  example: string;
};

/** Question titles from /f/3jyji4 — matches the landing screenshots. */
const EXAMPLES: Record<AiQuestionType, string> = {
  text: "Full Name",
  email: "Email Address",
  phone: "Phone Number",
  number: "Years of Experience",
  url: "Portfolio or Website",
  textarea: "What problem are you hoping this product solves?",
  single_select: "How did you hear about us?",
  multi_select: "Which features matter most to you?",
  rating: "How excited are you about this product?",
  nps: "How likely are you to recommend this product once it launches?",
  ranking: "Rank your top priorities for an early version",
  matrix: "How important are these aspects to you?",
  date: "When would you like to start using the product?",
  file: "Anything you'd like to share?",
  signature: "Add your signature",
  switch: "Send me product updates",
};

/** Screenshots from /f/3jyji4 — one WebP per type in public/images/landing/ */
export const LANDING_SCREENSHOTS: Record<AiQuestionType, string> = {
  text: "/images/landing/short-text.webp",
  email: "/images/landing/email.webp",
  phone: "/images/landing/phone.webp",
  number: "/images/landing/number.webp",
  url: "/images/landing/url.webp",
  textarea: "/images/landing/long-text.webp",
  single_select: "/images/landing/option.webp",
  multi_select: "/images/landing/multi-select.webp",
  rating: "/images/landing/rating.webp",
  nps: "/images/landing/nps.webp",
  ranking: "/images/landing/ranking.webp",
  matrix: "/images/landing/matrix.webp",
  date: "/images/landing/date.webp",
  file: "/images/landing/file.webp",
  signature: "/images/landing/signature.webp",
  switch: "/images/landing/switch.webp",
};

/** Walk order matches /f/3jyji4 (Product Waitlist demo form). */
const LANDING_TYPE_ORDER: AiQuestionType[] = [
  "text",
  "email",
  "phone",
  "number",
  "url",
  "textarea",
  "single_select",
  "multi_select",
  "rating",
  "nps",
  "ranking",
  "matrix",
  "date",
  "file",
  "signature",
  "switch",
];

const SHORT_LABELS: Partial<Record<AiQuestionType, string>> = {
  text: "Short text",
  textarea: "Long text",
  single_select: "Select",
  multi_select: "Multi",
  file: "File",
};

function guideFor(type: AiQuestionType) {
  const entry = QUESTION_TYPE_GUIDE.find((item) => item.type === type);
  if (!entry) throw new Error(`Missing question type guide for ${type}`);
  return entry;
}

function landingType(id: AiQuestionType): LandingQuestionType {
  const guide = guideFor(id);
  return {
    id,
    label: guide.label,
    shortLabel: SHORT_LABELS[id],
    src: LANDING_SCREENSHOTS[id],
    whenToUse: guide.useWhen,
    example: EXAMPLES[id],
  };
}

export const LANDING_QUESTION_TYPES: LandingQuestionType[] =
  LANDING_TYPE_ORDER.map(landingType);

export const DEFAULT_LANDING_QUESTION_TYPE: AiQuestionType =
  LANDING_TYPE_ORDER[0];
