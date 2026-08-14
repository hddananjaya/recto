import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { appendSubmissionToSheet } from "@/lib/sheets/append-submission";
import {
  getColumnIndices,
  isHeaderFormatted,
  markHeaderFormatted,
  type ColumnMap,
} from "@/lib/sheets/column-map";
import {
  getSheetsClient,
  parseSpreadsheetId,
} from "@/lib/sheets/client";
import { formatSheetHeaderRow } from "@/lib/sheets/format-header";
import type { Prisma } from "@prisma/client";

export async function ensureSheetHeaderFormatted(formId: string) {
  const connection = await prisma.sheetConnection.findUnique({
    where: { formId },
    include: {
      form: {
        include: {
          questions: { orderBy: { position: "asc" } },
        },
      },
    },
  });

  if (!connection) {
    throw new Error("Form has no sheet connection");
  }

  const columnMap: ColumnMap = { ...(connection.columnMap as ColumnMap) };
  const columnCount = getColumnIndices(columnMap).length;

  if (columnCount === 0 || isHeaderFormatted(columnMap)) {
    return false;
  }

  const sheets = getSheetsClient();
  const spreadsheetId = parseSpreadsheetId(connection.sheetUrl);
  const tabName = connection.sheetName || "Sheet1";

  await formatSheetHeaderRow(sheets, spreadsheetId, tabName, columnCount);

  await prisma.sheetConnection.update({
    where: { id: connection.id },
    data: {
      columnMap: markHeaderFormatted(columnMap) as unknown as Prisma.InputJsonValue,
    },
  });

  return true;
}

async function main() {
  const formId = process.argv[2] ?? "36dhp8";
  const formatOnly = process.argv.includes("--format-only");

  if (formatOnly) {
    const formatted = await ensureSheetHeaderFormatted(formId);
    console.log(formatted ? "Header formatted" : "Header already formatted or no columns");
    return;
  }

  const jobs = await prisma.syncJob.findMany({
    where: {
      status: { in: ["pending", "failed"] },
      submission: { formId },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Syncing ${jobs.length} job(s) for form ${formId}`);

  for (const job of jobs) {
    try {
      await appendSubmissionToSheet(job.submissionId);
      await prisma.syncJob.update({
        where: { id: job.id },
        data: { status: "done", attempts: { increment: 1 } },
      });
      console.log("done", job.submissionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("failed", job.submissionId, message);
      await prisma.syncJob.update({
        where: { id: job.id },
        data: { status: "failed", attempts: { increment: 1 }, lastError: message },
      });
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
