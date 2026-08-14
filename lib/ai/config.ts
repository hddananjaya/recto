const DEFAULT_MODEL = "deepseek/deepseek-v4-flash-0731";
const DEFAULT_MAX_TOKENS = 4_096;

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPEN_ROUTER_KEY?.trim());
}

export function getOpenRouterConfig() {
  const apiKey = process.env.OPEN_ROUTER_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    model: process.env.OPEN_ROUTER_MODEL?.trim() || DEFAULT_MODEL,
    maxTokens: DEFAULT_MAX_TOKENS,
    siteUrl:
      process.env.OPEN_ROUTER_SITE_URL?.trim() ||
      process.env.AUTH_URL?.trim() ||
      "http://localhost:3000",
  };
}

export const AI_PROMPT_MAX_LENGTH = 2000;
export const AI_SUGGEST_MAX_QUESTIONS = 12;
