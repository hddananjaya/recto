import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl } from "@/lib/storage/config";
import { formatAnswerForSheet } from "@/lib/files";
import { mapQuestion } from "@/lib/questions";
import type { Question } from "@/lib/types";
import {
  columnIndexToLetter,
  getSheetsClient,
  parseSpreadsheetId,
} from "@/lib/sheets/client";
import {
  getColumnIndices,
  isHeaderFormatted,
  markHeaderFormatted,
  type ColumnMap,
} from "@/lib/sheets/column-map";
import { formatSheetHeaderRow } from "@/lib/sheets/format-header";

export async function appendSubmissionToSheet(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      form: {
        include: {
          questions: { orderBy: { position: "asc" } },
          sheetConnection: true,
        },
      },
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (!submission.form.sheetConnection) {
    throw new Error("Form has no sheet connection");
  }

  const connection = submission.form.sheetConnection;
  const spreadsheetId = parseSpreadsheetId(connection.sheetUrl);
  const tabName = connection.sheetName || "Sheet1";
  const questions = submission.form.questions.map(mapQuestion);
  const sheets = getSheetsClient();

  const columnMap: ColumnMap = { ...(connection.columnMap as ColumnMap) };
  const usedColumns = getColumnIndices(columnMap);
  let nextColumn = usedColumns.length > 0 ? Math.max(...usedColumns) + 1 : 0;

  const newlyAssigned: { question: Question; column: number }[] = [];
  for (const question of questions) {
    if (!(question.id in columnMap)) {
      columnMap[question.id] = nextColumn;
      newlyAssigned.push({ question, column: nextColumn });
      nextColumn += 1;
    }
  }

  if (newlyAssigned.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: newlyAssigned.map(({ question, column }) => ({
          range: `${tabName}!${columnIndexToLetter(column)}1`,
          values: [[question.title]],
        })),
      },
    });
  }

  const columnCount = getColumnIndices(columnMap).length;
  const shouldFormatHeader =
    newlyAssigned.length > 0 || !isHeaderFormatted(columnMap);

  if (shouldFormatHeader && columnCount > 0) {
    await formatSheetHeaderRow(sheets, spreadsheetId, tabName, columnCount);
    markHeaderFormatted(columnMap);
  }

  if (newlyAssigned.length > 0 || shouldFormatHeader) {
    await prisma.sheetConnection.update({
      where: { id: connection.id },
      data: { columnMap: columnMap as unknown as Prisma.InputJsonValue },
    });
  }

  const rowLength = columnCount;
  const row = new Array(rowLength).fill("");
  const appBaseUrl = getAppBaseUrl();

  for (const question of questions) {
    const answer = (submission.answers as Record<string, unknown>)[question.id];
    if (answer === undefined || answer === null) continue;
    row[columnMap[question.id]] = formatAnswerForSheet(
      question,
      answer,
      appBaseUrl,
    );
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A2`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}
