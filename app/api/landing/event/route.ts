import { NextResponse } from "next/server";

import { LANDING_EVENTS, type LandingEvent } from "@/lib/landing-analytics";

export async function POST(request: Request) {
  let body: { event?: string };
  try {
    body = (await request.json()) as { event?: string };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const event = body.event as LandingEvent | undefined;
  if (!event || !LANDING_EVENTS.includes(event)) {
    return NextResponse.json({ error: "Unknown event" }, { status: 400 });
  }

  // First-party launch metrics only — no third-party pixels, no PII
  console.info(`[landing] ${event} ${new Date().toISOString()}`);

  return NextResponse.json({ ok: true });
}
