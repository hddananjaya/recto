import type { QuestionType } from "@/lib/types";

export const VIEWPORT_DESKTOP = { width: 1280, height: 900 } as const;
export const VIEWPORT_MOBILE = { width: 390, height: 844 } as const;

export const REALISTIC_FORM_META = {
  title: "Client intake — Q1 2026",
  description:
    "Takes about four minutes. We use your answers to scope onboarding and support.",
} as const;

export interface RealisticQuestionSpec {
  title: string;
  placeholder?: string;
  options?: string[];
  matrixRows?: string[];
  matrixColumns?: string[];
}

/** Human-readable prompts shared by editor, seed, and public fill. */
export const REALISTIC_QUESTIONS: Record<QuestionType, RealisticQuestionSpec> = {
  text: {
    title: "What's your full name?",
    placeholder: "Jordan Lee",
  },
  email: {
    title: "Work email",
    placeholder: "jordan.lee@northwindstudio.com",
  },
  phone: {
    title: "Best number to reach you",
    placeholder: "+1 312 555 0198",
  },
  number: {
    title: "How many seats do you need?",
    placeholder: "18",
  },
  url: {
    title: "Company website",
    placeholder: "https://northwindstudio.com",
  },
  textarea: {
    title: "What problem are you trying to solve?",
    placeholder: "Tell us about your workflow today…",
  },
  single_select: {
    title: "Preferred check-in cadence",
    options: [
      "Weekly video call",
      "Biweekly email summary",
      "Only when blocked",
    ],
  },
  multi_select: {
    title: "Which tools does your team already use?",
    options: ["Slack", "Notion", "Google Workspace", "Linear"],
  },
  rating: {
    title: "How polished should the first release feel?",
  },
  nps: {
    title: "How likely are you to recommend us to a peer?",
  },
  ranking: {
    title: "Rank these onboarding priorities",
    options: [
      "Import existing data",
      "Team training",
      "Custom branding",
    ],
  },
  matrix: {
    title: "Rate your experience so far",
    matrixRows: ["Onboarding clarity", "Support responsiveness"],
    matrixColumns: ["Poor", "Okay", "Excellent"],
  },
  date: {
    title: "When do you want to go live?",
  },
  file: {
    title: "Upload your company logo",
  },
  signature: {
    title: "Type your name to confirm",
  },
  switch: {
    title: "Can we contact you about beta features?",
  },
};

export const REALISTIC_ANSWERS = {
  text: "Jordan Lee",
  email: "jordan.lee@northwindstudio.com",
  /** US local digits after country is set to +1 */
  phoneDigits: "3125550198",
  number: "18",
  url: "https://northwindstudio.com",
  textarea:
    "We're replacing a patchwork of Google Forms and Typeform links.\n" +
    "Need one branded flow live before our March board review.",
  singleSelect: "Weekly video call",
  multiSelect: ["Slack", "Notion"] as const,
  ratingStar: 4,
  npsScore: "9",
  matrixColumn: "Excellent",
  signature: "Jordan Lee",
  switchChoice: "Yes" as const,
} as const;

export function questionTitle(type: QuestionType): string {
  return REALISTIC_QUESTIONS[type].title;
}

export function optionsLines(type: QuestionType): string | undefined {
  const options = REALISTIC_QUESTIONS[type].options;
  return options?.join("\n");
}

export function matrixRowsLines(type: QuestionType): string | undefined {
  return REALISTIC_QUESTIONS[type].matrixRows?.join("\n");
}

export function matrixColumnsLines(type: QuestionType): string | undefined {
  return REALISTIC_QUESTIONS[type].matrixColumns?.join("\n");
}
