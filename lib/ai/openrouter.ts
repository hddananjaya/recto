import { getOpenRouterConfig } from "./config";
import { aiFormSuggestionJsonSchema } from "./schemas";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 30_000;

export class OpenRouterError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

export async function requestFormSuggestionJson(
  messages: ChatMessage[],
): Promise<string> {
  const config = getOpenRouterConfig();
  if (!config) {
    throw new OpenRouterError("OpenRouter is not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": config.siteUrl,
        "X-Title": "Recto",
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: 0.4,
        messages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "form_suggestion",
            strict: true,
            schema: aiFormSuggestionJsonSchema,
          },
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new OpenRouterError(
        body || `OpenRouter request failed (${response.status})`,
        response.status,
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new OpenRouterError("OpenRouter returned an empty response");
    }

    return content;
  } catch (error) {
    if (error instanceof OpenRouterError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new OpenRouterError("OpenRouter request timed out");
    }
    throw new OpenRouterError(
      error instanceof Error ? error.message : "OpenRouter request failed",
    );
  } finally {
    clearTimeout(timeout);
  }
}
