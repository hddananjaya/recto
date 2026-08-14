export const HEADER_FORMATTED_KEY = "__headerFormatted";

export type ColumnMap = Record<string, number>;

export function getQuestionColumns(columnMap: ColumnMap): ColumnMap {
  return Object.fromEntries(
    Object.entries(columnMap).filter(([key]) => !key.startsWith("__")),
  );
}

export function getColumnIndices(columnMap: ColumnMap): number[] {
  return Object.values(getQuestionColumns(columnMap));
}

export function isHeaderFormatted(columnMap: ColumnMap): boolean {
  return columnMap[HEADER_FORMATTED_KEY] === 1;
}

export function markHeaderFormatted(columnMap: ColumnMap): ColumnMap {
  return { ...columnMap, [HEADER_FORMATTED_KEY]: 1 };
}
