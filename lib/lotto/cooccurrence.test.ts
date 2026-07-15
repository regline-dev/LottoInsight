import { describe, expect, it } from "vitest";
import type { LottoDrawRecord } from "@/lib/lotto/api";
import {
  formatCooccurrencePercent,
  getCooccurrenceExtremes,
  getCooccurrenceRatesForBase,
  getCooccurrenceSummaries,
} from "@/lib/lotto/cooccurrence";

const makeDraw = (
  drwNo: number,
  mainNumbers: number[],
  bonusNumber = 0
): LottoDrawRecord => ({
  drwNo,
  drwNoDate: "2026-01-01",
  mainNumbers,
  bonusNumber,
});

/** 소수 fixture — 8번 기준 수동 검증용 */
const fixtureDraws: LottoDrawRecord[] = [
  makeDraw(1, [8, 9, 19, 25, 41, 42]),
  makeDraw(2, [8, 9, 10, 11, 12, 13]),
  makeDraw(3, [1, 2, 3, 4, 5, 6]),
];

describe("getCooccurrenceRatesForBase", () => {
  it("기준 번호가 나온 회차만 분모로 P(B|A) 계산", () => {
    const rates = getCooccurrenceRatesForBase(8, fixtureDraws);
    const rate9 = rates.find((rate) => rate.partnerNumber === 9);
    const rate19 = rates.find((rate) => rate.partnerNumber === 19);
    const rate1 = rates.find((rate) => rate.partnerNumber === 1);

    expect(rate9).toMatchObject({ coCount: 2, baseCount: 2, rate: 1 });
    expect(rate19).toMatchObject({ coCount: 1, baseCount: 2, rate: 0.5 });
    expect(rate1).toMatchObject({ coCount: 0, baseCount: 2, rate: 0 });
  });

  it("기준 번호가 한 번도 없으면 빈 배열", () => {
    expect(getCooccurrenceRatesForBase(44, fixtureDraws)).toEqual([]);
  });

  it("보너스 번호는 집계에 포함하지 않음", () => {
    const draws = [makeDraw(1, [8, 9, 10, 11, 12, 13], 19)];
    const rates = getCooccurrenceRatesForBase(8, draws);
    const rate19 = rates.find((rate) => rate.partnerNumber === 19);

    expect(rate19).toMatchObject({ coCount: 0, rate: 0 });
    expect(rates).toHaveLength(44);
  });
});

describe("getCooccurrenceExtremes", () => {
  it("1위·꼴찌 번호와 비율 반환", () => {
    const extremes = getCooccurrenceExtremes(8, fixtureDraws);

    expect(extremes.baseNumber).toBe(8);
    if (!extremes.highest || !extremes.lowest) {
      throw new Error("extremes should exist");
    }

    expect(extremes.highest.partnerNumber).toBe(9);
    expect(extremes.highest.rate).toBe(1);
    expect(extremes.lowest.partnerNumber).toBe(1);
    expect(extremes.lowest.rate).toBe(0);
  });

  it("동률이면 partner 번호 작은 쪽", () => {
    const draws = [
      makeDraw(1, [8, 9, 10, 11, 12, 13]),
      makeDraw(2, [8, 14, 15, 16, 17, 18]),
    ];
    const extremes = getCooccurrenceExtremes(8, draws);

    if (!extremes.lowest) {
      throw new Error("lowest should exist");
    }

    // 9~18 모두 1/2 — 0%는 1~7, 19~45 → 1번
    expect(extremes.lowest.partnerNumber).toBe(1);
    expect(extremes.lowest.rate).toBe(0);
  });

  it("출현 0회면 null", () => {
    const extremes = getCooccurrenceExtremes(44, fixtureDraws);
    expect(extremes.highest).toBeNull();
    expect(extremes.lowest).toBeNull();
  });
});

describe("getCooccurrenceSummaries", () => {
  it("기준 번호 배열 순서대로 extremes 반환", () => {
    const summaries = getCooccurrenceSummaries([8, 9], fixtureDraws);
    expect(summaries).toHaveLength(2);
    expect(summaries[0].baseNumber).toBe(8);
    expect(summaries[1].baseNumber).toBe(9);
  });
});

describe("formatCooccurrencePercent", () => {
  it("소수 1자리 퍼센트 문자열", () => {
    expect(formatCooccurrencePercent(0.205)).toBe("20.5%");
    expect(formatCooccurrencePercent(0)).toBe("0%");
    expect(formatCooccurrencePercent(1)).toBe("100%");
  });
});
