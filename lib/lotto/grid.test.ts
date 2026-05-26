import { describe, expect, it } from "vitest";
import {
  buildPatternPoints,
  getNumberAtCell,
  gridPositionToCenter,
  numberToGridPosition,
} from "@/lib/lotto/grid";

describe("numberToGridPosition", () => {
  it("1번은 (0,0), 8번은 (1,0)", () => {
    expect(numberToGridPosition(1)).toEqual({ row: 0, col: 0 });
    expect(numberToGridPosition(8)).toEqual({ row: 1, col: 0 });
    expect(numberToGridPosition(45)).toEqual({ row: 6, col: 2 });
  });

  it("범위 밖 번호는 에러", () => {
    expect(() => numberToGridPosition(0)).toThrow();
    expect(() => numberToGridPosition(46)).toThrow();
  });
});

describe("gridPositionToCenter", () => {
  it("칸 중심 좌표 반환", () => {
    expect(gridPositionToCenter({ row: 0, col: 0 })).toEqual({
      x: 0.5,
      y: 0.53,
    });
  });
});

describe("buildPatternPoints", () => {
  it("빈 배열이면 빈 문자열", () => {
    expect(buildPatternPoints([])).toBe("");
  });

  it("번호 순서대로 polyline points 생성", () => {
    const points = buildPatternPoints([1, 2, 3]);
    expect(points).toContain("0.5,0.53");
    expect(points.split(" ").length).toBe(3);
  });
});

describe("getNumberAtCell", () => {
  it("유효 칸 번호 반환, 빈 칸은 null", () => {
    expect(getNumberAtCell(0, 0)).toBe(1);
    expect(getNumberAtCell(6, 2)).toBe(45);
    expect(getNumberAtCell(6, 3)).toBeNull();
  });
});
