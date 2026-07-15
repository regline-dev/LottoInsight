import { describe, expect, it } from "vitest";
import {
  formatDrawDateDots,
  formatDrawRoundTitle,
} from "@/lib/lotto/drawFormat";

describe("formatDrawRoundTitle", () => {
  it("제 N회", () => {
    expect(formatDrawRoundTitle(1225)).toBe("제 1225회");
  });
});

describe("formatDrawDateDots", () => {
  it("하이픈 → 점", () => {
    expect(formatDrawDateDots("2026-05-23")).toBe("2026.05.23");
  });
});
