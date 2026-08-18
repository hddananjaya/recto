import type { sheets_v4 } from "googleapis";
import { resolveTabSheetId } from "@/lib/sheets/client";

/** Static black background for header */
const HEADER_BACKGROUND = { red: 0, green: 0, blue: 0 };
const HEADER_TEXT = { red: 1, green: 1, blue: 1 };

export async function formatSheetHeaderRow(
  sheets: sheets_v4.Sheets,
  spreadsheetId: string,
  tabName: string,
  columnCount: number,
): Promise<void> {
  if (columnCount <= 0) return;

  const tabSheetId = await resolveTabSheetId(sheets, spreadsheetId, tabName);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: tabSheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: columnCount,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: HEADER_BACKGROUND,
                textFormat: {
                  bold: true,
                  foregroundColor: HEADER_TEXT,
                },
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
        {
          updateSheetProperties: {
            properties: {
              sheetId: tabSheetId,
              gridProperties: { frozenRowCount: 1 },
            },
            fields: "gridProperties.frozenRowCount",
          },
        },
        {
          updateDimensionProperties: {
            range: {
              sheetId: tabSheetId,
              dimension: "ROWS",
              startIndex: 0,
              endIndex: 1,
            },
            properties: { pixelSize: 34 },
            fields: "pixelSize",
          },
        },
      ],
    },
  });
}
