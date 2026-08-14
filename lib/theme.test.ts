import { describe, expect, it } from "vitest";

import {
  contrastColor,
  hexLuminance,
  isLightBackground,
  radiusForRoundness,
} from "@/lib/theme";

describe("radiusForRoundness", () => {
  it("maps roundness values", () => {
    expect(radiusForRoundness("sharp")).toBe("0.5rem");
    expect(radiusForRoundness("soft")).toBe("0.875rem");
    expect(radiusForRoundness("round")).toBe("1.25rem");
  });
});

describe("hexLuminance", () => {
  it("returns higher luminance for light colors", () => {
    expect(hexLuminance("#ffffff")).toBeGreaterThan(hexLuminance("#000000"));
  });

  it("handles invalid hex gracefully", () => {
    expect(hexLuminance("bad")).toBe(0.5);
  });
});

describe("isLightBackground", () => {
  it("classifies light and dark", () => {
    expect(isLightBackground("#ffffff")).toBe(true);
    expect(isLightBackground("#000000")).toBe(false);
  });
});

describe("contrastColor", () => {
  it("picks dark text on light backgrounds", () => {
    expect(contrastColor("#ffffff")).toBe("#0a0a0a");
    expect(contrastColor("#000000")).toBe("#fafafa");
  });
});
