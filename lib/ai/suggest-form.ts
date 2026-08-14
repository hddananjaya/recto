import { validateFormEditor } from "@/lib/editor-validation";
import type { AiFormSuggestion } from "@/lib/types";
import { isAiConfigured } from "./config";
import { normalizeFormSuggestion } from "./normalize";
import { OpenRouterError, requestFormSuggestionJson } from "./openrouter";
import {
  buildFormSuggestionUserPrompt,
  FORM_SUGGESTION_SYSTEM_PROMPT,
} from "./prompts";
import { aiFormSuggestionSchema } from "./schemas";

export class FormSuggestionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FormSuggestionError";
  }
}

function formatOpenRouterError(error: OpenRouterError): string {
  if (error.status === 429) {
    return "AI service is busy. Try again in a moment.";
  }
  if (error.status === 402) {
    return "OpenRouter credits are exhausted. Add credits or switch to a cheaper model.";
  }
  if (error.status === 401) {
    return "OpenRouter API key is invalid. Check OPEN_ROUTER_KEY.";
  }
  if (error.status === 404) {
    return "The configured AI model is unavailable. Set OPEN_ROUTER_MODEL to a valid model ID.";
  }
  if (error.status === 400 && error.message.includes("Invalid schema")) {
    return "AI configuration error. Please report this issue.";
  }
  return "Could not reach the AI service. Try again.";
}

function parseSuggestionContent(content: string) {
  const parsed = aiFormSuggestionSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    throw new FormSuggestionError("AI returned an invalid form structure");
  }
  return parsed.data;
}

export async function generateFormSuggestion(
  prompt: string,
): Promise<AiFormSuggestion> {
  if (!isAiConfigured()) {
    throw new FormSuggestionError("AI is not configured");
  }

  const messages = [
    { role: "system" as const, content: FORM_SUGGESTION_SYSTEM_PROMPT },
    { role: "user" as const, content: buildFormSuggestionUserPrompt(prompt) },
  ];

  let content: string;
  try {
    content = await requestFormSuggestionJson(messages);
  } catch (error) {
    if (error instanceof OpenRouterError) {
      throw new FormSuggestionError(formatOpenRouterError(error));
    }
    throw error;
  }

  let raw;
  try {
    raw = parseSuggestionContent(content);
  } catch {
    try {
      content = await requestFormSuggestionJson([
        ...messages.slice(0, 1),
        {
          role: "user",
          content: buildFormSuggestionUserPrompt(prompt, true),
        },
      ]);
      raw = parseSuggestionContent(content);
    } catch {
      throw new FormSuggestionError(
        "AI returned a form we couldn't understand. Try rephrasing your prompt.",
      );
    }
  }

  const suggestion = normalizeFormSuggestion(raw);
  const issues = validateFormEditor(
    { title: suggestion.title, questions: suggestion.questions },
    "save",
  );

  if (issues.length > 0) {
    throw new FormSuggestionError(
      "AI generated an invalid form. Try rephrasing your prompt.",
    );
  }

  return suggestion;
}
