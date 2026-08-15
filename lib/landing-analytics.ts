export const LANDING_EVENTS = [
  "try_app_click",
  "demo_click",
  "waitlist_click",
  "prompt_chip_click",
  "github_star_click",
] as const;

export type LandingEvent = (typeof LANDING_EVENTS)[number];

export function trackLandingEvent(event: LandingEvent) {
  if (typeof window === "undefined") return;

  void fetch("/api/landing/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
    keepalive: true,
  }).catch(() => {
    // Non-blocking — analytics must never break navigation
  });
}
