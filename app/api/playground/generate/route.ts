import { NextResponse } from "next/server";

import { AI_PROMPT_MAX_LENGTH, isAiConfigured } from "@/lib/ai/config";
import { FormSuggestionError } from "@/lib/ai/suggest-form";
import { getClientIp } from "@/lib/client-ip";
import { createPlaygroundFormFromPrompt } from "@/lib/playground-create";
import { PLAYGROUND_AI_RATE_LIMIT } from "@/lib/playground";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return NextResponse.json(
      {
        error:
          "AI generation is not available on this server. Sign in to create forms manually.",
      },
      { status: 503 },
    );
  }

  let body: { prompt?: string };
  try {
    body = (await request.json()) as { prompt?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const prompt = body.prompt?.trim() ?? "";
  if (!prompt) {
    return NextResponse.json(
      { error: "Describe your form before generating." },
      { status: 400 },
    );
  }

  if (prompt.length > AI_PROMPT_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Keep your description under ${AI_PROMPT_MAX_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const ip = await getClientIp();
  const limit = await checkRateLimit(
    `playground:ai:${ip}`,
    PLAYGROUND_AI_RATE_LIMIT,
    60 * 60,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many playground forms from this network. Try again later." },
      { status: 429 },
    );
  }

  try {
    const formId = await createPlaygroundFormFromPrompt(prompt);
    return NextResponse.json({ formId });
  } catch (error) {
    const message =
      error instanceof FormSuggestionError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Could not generate your form. Try again.";

    return NextResponse.json({ error: message }, { status: 422 });
  }
}
