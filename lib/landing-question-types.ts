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

/** Screenshots from /f/3jyji4 — one PNG per type in public/images/landing/ */
const LANDING_SCREENSHOTS: Record<AiQuestionType, string> = {
  text: "/images/landing/short-text.png",
  email: "/images/landing/email.png",
  phone: "/images/landing/phone.png",
  number: "/images/landing/number.png",
  url: "/images/landing/url.png",
  textarea: "/images/landing/long-text.png",
  single_select: "/images/landing/option.png",
  multi_select: "/images/landing/multi-select.png",
  rating: "/images/landing/rating.png",
  nps: "/images/landing/nps.png",
  ranking: "/images/landing/ranking.png",
  matrix: "/images/landing/matrix.png",
  date: "/images/landing/date.png",
  file: "/images/landing/file.png",
  signature: "/images/landing/signature.png",
  switch: "/images/landing/switch.png",
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
