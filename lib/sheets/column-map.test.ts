import { describe, expect, it } from "vitest";
import {
  getColumnIndices,
  getQuestionColumns,
  isHeaderFormatted,
  markHeaderFormatted,
} from "@/lib/sheets/column-map";

describe("column-map", () => {
  it("filters metadata keys from question columns", () => {
    const map = { q1: 0, q2: 1, __headerFormatted: 1 };
    expect(getQuestionColumns(map)).toEqual({ q1: 0, q2: 1 });
    expect(getColumnIndices(map)).toEqual([0, 1]);
  });

  it("tracks header formatting state", () => {
    const map = { q1: 0 };
    expect(isHeaderFormatted(map)).toBe(false);
    const marked = markHeaderFormatted(map);
    expect(isHeaderFormatted(marked)).toBe(true);
    expect(marked.q1).toBe(0);
  });
});
