/**
 * Canonical question types for AI form generation.
 * Keep in sync with QuestionType in lib/types.ts.
 */
export const AI_QUESTION_TYPES = [
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
] as const;

export type AiQuestionType = (typeof AI_QUESTION_TYPES)[number];

interface QuestionTypeGuideEntry {
  type: AiQuestionType;
  label: string;
  summary: string;
  useWhen: string;
  config?: string;
}

export const QUESTION_TYPE_GUIDE: QuestionTypeGuideEntry[] = [
  {
    type: "text",
    label: "Short text",
    summary: "Single-line text input.",
    useWhen: "Names, titles, short answers, IDs, or one-word responses.",
    config: "Optional placeholder.",
  },
  {
    type: "email",
    label: "Email",
    summary: "Email address with validation.",
    useWhen: "Contact email, work email, newsletter signup.",
    config: "Optional placeholder.",
  },
  {
    type: "phone",
    label: "Phone",
    summary: "International phone number input.",
    useWhen: "Mobile or landline contact numbers.",
    config: "Optional placeholder.",
  },
  {
    type: "number",
    label: "Number",
    summary: "Numeric input.",
    useWhen: "Age, quantity, budget, years of experience, counts.",
    config: "Optional placeholder.",
  },
  {
    type: "url",
    label: "URL",
    summary: "Website or link with URL validation.",
    useWhen: "Portfolio, company site, social profile, repo links.",
    config: "Optional placeholder.",
  },
  {
    type: "textarea",
    label: "Long text",
    summary: "Multi-line free-text input.",
    useWhen: "Open feedback, detailed comments, cover letters, bug reports.",
    config: "Optional placeholder.",
  },
  {
    type: "single_select",
    label: "Single select",
    summary: "Choose exactly one option from a list.",
    useWhen: "Role, department, plan tier, single-choice preferences.",
    config: "Required optionLabels (2–8 unique labels).",
  },
  {
    type: "multi_select",
    label: "Multi select",
    summary: "Choose one or more options.",
    useWhen: "Skills, interests, features used, topics of interest.",
    config: "Required optionLabels (2–8 unique labels).",
  },
  {
    type: "rating",
    label: "Rating",
    summary: "Star rating from 1 up to maxRating.",
    useWhen: "Product quality, session quality, overall satisfaction.",
    config: "Optional maxRating (3–10, default 5).",
  },
  {
    type: "nps",
    label: "NPS",
    summary: "0–10 likelihood-to-recommend scale (Net Promoter Score).",
    useWhen: '"How likely are you to recommend…?" feedback and loyalty surveys.',
    config: "No extra fields — always 0–10.",
  },
  {
    type: "ranking",
    label: "Ranking",
    summary: "Rank options in order of preference.",
    useWhen: "Feature priorities, preference ordering, top-N choices.",
    config: "Required optionLabels (2–8 unique labels).",
  },
  {
    type: "matrix",
    label: "Matrix",
    summary: "Grid — one answer per row, chosen from shared columns.",
    useWhen: "Rate multiple statements (agree/disagree, frequency, satisfaction per item).",
    config: "Required rows and columns (at least 2 each, unique labels).",
  },
  {
    type: "date",
    label: "Date",
    summary: "Calendar date picker.",
    useWhen: "Birthdays, event dates, availability, deadlines, start dates.",
  },
  {
    type: "file",
    label: "File upload",
    summary: "Upload a document or image.",
    useWhen: "Resume, portfolio file, receipt, photo — only when the user asks for uploads.",
  },
  {
    type: "signature",
    label: "Signature",
    summary: "Typed full name rendered in a signature style.",
    useWhen: "Consent, agreements, acknowledgements — only when the user asks for a signature.",
    config: "Optional placeholder (defaults to asking for full name).",
  },
  {
    type: "switch",
    label: "Switch",
    summary: "Yes / No toggle.",
    useWhen: "Opt-ins, consent checkboxes, boolean confirmations.",
  },
];

export function buildQuestionTypeGuideForPrompt(): string {
  const lines = QUESTION_TYPE_GUIDE.map((entry) => {
    const parts = [
      `- ${entry.type} (${entry.label}): ${entry.summary}`,
      `  Use when: ${entry.useWhen}`,
    ];
    if (entry.config) {
      parts.push(`  Config: ${entry.config}`);
    }
    return parts.join("\n");
  });

  return lines.join("\n");
}
