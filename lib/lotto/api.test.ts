import { describe, expect, it, vi } from "vitest";
import {
  fetchDrawByRound,
  getRecentPastDraws,
  parseLottoApiResponse,
  parseLt645DrawItem,
} from "@/lib/lotto/api";

const mockLt645Item = {
  ltEpsd: 1180,
  tm1WnNo: 41,
  tm2WnNo: 28,
  tm3WnNo: 33,
  tm4WnNo: 19,
  tm5WnNo: 12,
  tm6WnNo: 3,
  bnsWnNo: 7,
  ltRflYmd: "20260524",
};

const mockApiSuccess = {
  returnValue: "success",
  drwNo: 1180,
  drwNoDate: "2026-05-24",
  drwtNo1: 3,
  drwtNo2: 12,
  drwtNo3: 19,
  drwtNo4: 28,
  drwtNo5: 33,
  drwtNo6: 41,
  bnusNo: 7,
};

describe("parseLt645DrawItem", () => {
  it("lt645 API → LottoDrawRecord", () => {
    expect(parseLt645DrawItem(mockLt645Item)).toEqual({
      drwNo: 1180,
      drwNoDate: "2026-05-24",
      mainNumbers: [3, 12, 19, 28, 33, 41],
      bonusNumber: 7,
    });
  });
});

describe("parseLottoApiResponse", () => {
  it("동행복권 JSON → LottoDrawRecord", () => {
    const record = parseLottoApiResponse(mockApiSuccess);
    expect(record).toEqual({
      drwNo: 1180,
      drwNoDate: "2026-05-24",
      mainNumbers: [3, 12, 19, 28, 33, 41],
      bonusNumber: 7,
    });
  });

  it("returnValue가 success가 아니면 에러", () => {
    expect(() =>
      parseLottoApiResponse({ ...mockApiSuccess, returnValue: "fail" })
    ).toThrow();
  });
});

describe("fetchDrawByRound", () => {
  it("회차 API 호출 후 파싱", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ data: { list: [mockLt645Item] } }),
    });

    const record = await fetchDrawByRound(1180, mockFetch);
    expect(record.drwNo).toBe(1180);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("srchLtEpsd=1180"),
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it("HTTP 실패 시 에러", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchDrawByRound(1, mockFetch)).rejects.toThrow();
  });
});

describe("getRecentPastDraws", () => {
  it("최신 회차 기준 과거 count개 (내림차순 → A=저번주)", async () => {
    const makeRecord = (drwNo: number) => ({
      drwNo,
      drwNoDate: "2026-01-01",
      mainNumbers: [1, 2, 3, 4, 5, 6],
      bonusNumber: 7,
    });

    const mockFetchDraw = vi.fn(async (round: number) => {
      if (round >= 1176 && round <= 1180) {
        return makeRecord(round);
      }
      throw new Error(`회차 ${round} 없음`);
    });

    const draws = await getRecentPastDraws(5, 1180, mockFetchDraw);
    expect(draws.map((d) => d.drwNo)).toEqual([1180, 1179, 1178, 1177, 1176]);
    expect(mockFetchDraw).toHaveBeenCalledTimes(5);
  });
});
