import type { LottoDraw } from "@/lib/lotto/types";

/** 동행복권 회차별 당첨 API */
export const DH_LOTTERY_DRAW_URL =
  "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";

/** API 원본 + 회차·날짜 메타 */
export type LottoDrawRecord = LottoDraw & {
  drwNo: number;
  drwNoDate: string;
};

type DhLottoApiResponse = {
  returnValue: string;
  drwNo: number;
  drwNoDate: string;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
};

export type FetchFn = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>;

/** 동행복권 API JSON → 앱 타입 */
export function parseLottoApiResponse(raw: DhLottoApiResponse): LottoDrawRecord {
  if (raw.returnValue !== "success") {
    throw new Error(`회차 ${raw.drwNo ?? "?"} 당첨 데이터를 가져오지 못했습니다.`);
  }

  const mainNumbers = [
    raw.drwtNo1,
    raw.drwtNo2,
    raw.drwtNo3,
    raw.drwtNo4,
    raw.drwtNo5,
    raw.drwtNo6,
  ].sort((a, b) => a - b);

  return {
    drwNo: raw.drwNo,
    drwNoDate: raw.drwNoDate,
    mainNumbers,
    bonusNumber: raw.bnusNo,
  };
}

/** 특정 회차 당첨 번호 fetch */
export async function fetchDrawByRound(
  drwNo: number,
  fetchFn: FetchFn = fetch
): Promise<LottoDrawRecord> {
  if (!Number.isInteger(drwNo) || drwNo < 1) {
    throw new Error(`유효하지 않은 회차입니다: ${drwNo}`);
  }

  const response = await fetchFn(`${DH_LOTTERY_DRAW_URL}${drwNo}`);

  if (!response.ok) {
    throw new Error(`동행복권 API HTTP ${response.status} (회차 ${drwNo})`);
  }

  const raw = (await response.json()) as DhLottoApiResponse;
  return parseLottoApiResponse(raw);
}

/** 최신 회차 번호 추정 — 1회(2002-12-07) 이후 주 1회 */
export function estimateLatestDrawRound(
  now: Date = new Date()
): number {
  const firstDrawDate = new Date("2002-12-07T00:00:00+09:00");
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksSinceFirst = Math.floor(
    (now.getTime() - firstDrawDate.getTime()) / msPerWeek
  );
  return Math.max(1, weeksSinceFirst + 1);
}

/** 추정값부터 올려가며 존재하는 최신 회차 확인 */
export async function fetchLatestDrawRound(
  fetchFn: FetchFn = fetch
): Promise<number> {
  let candidateRound = estimateLatestDrawRound();

  // 아직 추첨 전 회차면 returnValue fail → 아래로 탐색
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      const record = await fetchDrawByRound(candidateRound, fetchFn);
      return record.drwNo;
    } catch {
      candidateRound -= 1;
    }
  }

  throw new Error("최신 회차를 확인하지 못했습니다.");
}

/**
 * 최근 과거 회차 count개 — A=저번 주(latest) … E=5주 전
 * @param latestRound fetchLatestDrawRound() — 가장 최근 **완료** 회차
 */
export async function getRecentPastDraws(
  count: number,
  latestRound: number,
  fetchDraw: (round: number) => Promise<LottoDrawRecord> = (round) =>
    fetchDrawByRound(round)
): Promise<LottoDrawRecord[]> {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("가져올 회차 수는 1 이상이어야 합니다.");
  }

  const rounds = Array.from({ length: count }, (_, index) => latestRound - index);
  return Promise.all(rounds.map((round) => fetchDraw(round)));
}
