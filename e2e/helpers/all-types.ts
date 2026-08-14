import type { QuestionType } from "@/lib/types";

import {
  REALISTIC_FORM_META,
  questionTitle,
} from "./realistic-data";

/** All 16 question types in public walk order. */
export const ALL_QUESTION_TYPES: QuestionType[] = [
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

export const E2E_ALL_TYPES_FORM_ID = "e2eall";

export const E2E_ALL_TYPES_FORM_TITLE = REALISTIC_FORM_META.title;

export const E2E_ALL_TYPES_FORM_DESCRIPTION = REALISTIC_FORM_META.description;

/** Editor picker labels (QuestionTypeSelect). */
export const EDITOR_TYPE_LABEL: Record<QuestionType, string> = {
  text: "Short text",
  email: "Email",
  phone: "Phone",
  number: "Number",
  url: "URL",
  textarea: "Long text",
  single_select: "Single select",
  multi_select: "Multi select",
  rating: "Rating",
  nps: "NPS",
  ranking: "Ranking",
  matrix: "Matrix",
  date: "Date",
  file: "File upload",
  signature: "Signature",
  switch: "Switch",
};

export { questionTitle };
