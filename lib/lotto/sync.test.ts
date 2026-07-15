import { describe, expect, it, vi } from "vitest";
import type { LottoDrawRecord } from "@/lib/lotto/api";
import {
  buildDrawsFile,
  fetchDrawsInRange,
  getLastStoredRound,
  getSyncRange,
  mergeDrawRecords,
  sortDrawRecords,
} from "@/lib/lotto/sync";

const mockLt645Item = {
  ltEpsd: 1,
  tm1WnNo: 1,
  tm2WnNo: 2,
  tm3WnNo: 3,
  tm4WnNo: 4,
  tm5WnNo: 5,
  tm6WnNo: 6,
  bnsWnNo: 7,
  ltRflYmd: "20260101",
};

const makeDraw = (drwNo: number): LottoDrawRecord => ({
  drwNo,
  drwNoDate: "2026-01-01",
  mainNumbers: [1, 2, 3, 4, 5, 6],
  bonusNumber: 7,
});

describe("sortDrawRecords", () => {
  it("drwNo 오름차순", () => {
    const sorted = sortDrawRecords([makeDraw(3), makeDraw(1), makeDraw(2)]);
    expect(sorted.map((d) => d.drwNo)).toEqual([1, 2, 3]);
  });
});

describe("mergeDrawRecords", () => {
  it("신규 회차 추가 + 같은 회차는 덮어씀", () => {
    const oldDraw = makeDraw(1);
    const newDraw = { ...makeDraw(1), bonusNumber: 9 };
    const merged = mergeDrawRecords([oldDraw], [newDraw, makeDraw(2)]);
    expect(merged).toHaveLength(2);
    expect(merged[0].bonusNumber).toBe(9);
    expect(merged[1].drwNo).toBe(2);
  });
});

describe("getLastStoredRound", () => {
  it("비어 있으면 0", () => {
    expect(getLastStoredRound(null)).toBe(0);
  });

  it("마지막 draw 회차 반환", () => {
    expect(
      getLastStoredRound({
        updatedAt: "",
        count: 2,
        draws: [makeDraw(1), makeDraw(2)],
      })
    ).toBe(2);
  });
});

describe("getSyncRange", () => {
  it("이미 최신이면 null", () => {
    expect(getSyncRange(1180, 1180)).toBeNull();
  });

  it("증분 구간 반환", () => {
    expect(getSyncRange(1178, 1180)).toEqual({ fromRound: 1179, toRound: 1180 });
  });
});

describe("fetchDrawsInRange", () => {
  it("구간 회차 순차 fetch", async () => {
    const mockFetchDraw = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const match = url.match(/srchLtEpsd=(\d+)/);
      const drwNo = Number(match?.[1] ?? 0);
      return {
        ok: true,
        text: async () =>
          JSON.stringify({
            data: {
              list: [{ ...mockLt645Item, ltEpsd: drwNo }],
            },
          }),
      };
    });

    const draws = await fetchDrawsInRange(1, 3, {
      fetchFn: mockFetchDraw,
      delayMs: 0,
    });
    expect(draws.map((d) => d.drwNo)).toEqual([1, 2, 3]);
    expect(mockFetchDraw).toHaveBeenCalledTimes(3);
  });
});

describe("buildDrawsFile", () => {
  it("count·draws 정렬", () => {
    const file = buildDrawsFile([makeDraw(2), makeDraw(1)]);
    expect(file.count).toBe(2);
    expect(file.draws[0].drwNo).toBe(1);
    expect(file.updatedAt).toBeTruthy();
  });
});
