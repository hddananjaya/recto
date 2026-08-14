import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { appendSubmissionToSheet } from "@/lib/sheets/append-submission";

function log(level: "info" | "warn" | "error", message: string, meta?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  console[level](JSON.stringify({ timestamp, level, message, ...meta }));
}

function loadServiceAccountJson() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    log("error", "GOOGLE_SERVICE_ACCOUNT_JSON is not set");
    process.exit(1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("error", "GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON", { error: message });
    process.exit(1);
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    log("error", "GOOGLE_SERVICE_ACCOUNT_JSON must be a JSON object");
    process.exit(1);
  }

  const obj = parsed as Record<string, unknown>;
  const required = ["type", "client_email", "private_key"];
  const missing = required.filter((key) => typeof obj[key] !== "string" || obj[key] === "");

  if (missing.length > 0) {
    log("error", "GOOGLE_SERVICE_ACCOUNT_JSON is missing required service-account fields", {
      missing,
      hasType: typeof obj.type === "string",
      hasClientEmail: typeof obj.client_email === "string",
      hasPrivateKey: typeof obj.private_key === "string",
      actualType: obj.type,
    });
    process.exit(1);
  }

  if (obj.type !== "service_account") {
    log("error", "GOOGLE_SERVICE_ACCOUNT_JSON must have type: service_account", {
      actualType: obj.type,
    });
    process.exit(1);
  }

  log("info", "Loaded service account credentials", { clientEmail: obj.client_email });
}

loadServiceAccountJson();

async function processPendingJobs() {
  const jobs = await prisma.syncJob.findMany({
    where: {
      status: { in: ["pending", "failed"] },
      attempts: { lt: 5 },
    },
    take: 10,
    orderBy: { createdAt: "asc" },
  });

  if (jobs.length === 0) {
    log("info", "No pending sync jobs");
    return;
  }

  log("info", `Found ${jobs.length} sync job(s) to process`, { count: jobs.length });

  for (const job of jobs) {
    try {
      await appendSubmissionToSheet(job.submissionId);
      await prisma.syncJob.update({
        where: { id: job.id },
        data: { status: "done", attempts: { increment: 1 } },
      });
      log("info", "Sync job completed", { jobId: job.id, submissionId: job.submissionId });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log("error", "Sync job failed", {
        jobId: job.id,
        submissionId: job.submissionId,
        attempts: job.attempts + 1,
        error: message,
      });
      await prisma.syncJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          attempts: { increment: 1 },
          lastError: message,
        },
      });
    }
  }
}

async function main() {
  log("info", "Sheet sync worker started", { intervalMs: 5000 });

  while (true) {
    try {
      await processPendingJobs();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log("error", "Unexpected error during poll", { error: message });
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  log("error", "Worker crashed", { error: message });
  process.exit(1);
});
