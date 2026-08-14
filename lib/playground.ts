import type { Question, QuestionType } from "@/lib/types";

export const PLAYGROUND_OWNER_EMAIL = "playground@recto.local";

/** Anonymous AI generations allowed per IP per hour. */
export const PLAYGROUND_AI_RATE_LIMIT = 3;

/** Playground forms are deleted from public access after this many hours. */
export const PLAYGROUND_TTL_HOURS = 48;

const DISALLOWED_QUESTION_TYPES = new Set<QuestionType>(["file", "signature"]);

export function playgroundExpiresAt(from = new Date()): Date {
  return new Date(from.getTime() + PLAYGROUND_TTL_HOURS * 60 * 60 * 1000);
}

export function isPlaygroundFormExpired(
  isPlayground: boolean,
  expiresAt: Date | null | undefined,
  now = new Date(),
): boolean {
  if (!isPlayground) return false;
  if (!expiresAt) return false;
  return expiresAt.getTime() <= now.getTime();
}

export function sanitizePlaygroundQuestions(questions: Question[]): Question[] {
  return questions.filter((q) => !DISALLOWED_QUESTION_TYPES.has(q.type));
}

export const PLAYGROUND_PROMPT_EXAMPLES = [
  "Event RSVP with name, email, and meal preference",
  "Customer feedback survey with NPS and open comments",
  "Job application with experience and portfolio URL",
  "Beta waitlist signup with role and use case",
] as const;
