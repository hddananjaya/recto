import { isE2eTestMode } from "@/lib/e2e-test-mode";

export async function GET() {
  if (process.env.NODE_ENV === "production" && !isE2eTestMode()) {
    return new Response("Not Found", { status: 404 });
  }

  return Response.json({
    e2eTestMode: isE2eTestMode(),
    emailPasswordAuth: isE2eTestMode(),
  });
}
