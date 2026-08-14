import type { sheets_v4 } from "googleapis";
import { resolveTabSheetId } from "@/lib/sheets/client";

/** Recto brand navy — matches landing page text color #152238 */
const HEADER_BACKGROUND = { red: 0.082, green: 0.129, blue: 0.22 };
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
                  fontSize: 10,
                },
                horizontalAlignment: "LEFT",
                verticalAlignment: "MIDDLE",
                wrapStrategy: "CLIP",
                padding: { top: 6, right: 10, bottom: 6, left: 10 },
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy,padding)",
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
