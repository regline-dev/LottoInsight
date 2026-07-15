import type { LottoDraw } from "@/lib/lotto/types";

/** 동행복권 회차별 당첨 API (2024~ 내부 JSON) */
export const DH_LOTTERY_LT645_URL =
  "https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do";

/** @deprecated 구 API — IP/봇 차단될 수 있음 */
export const DH_LOTTERY_DRAW_URL =
  "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";

/** 동행복권 AJAX 요청 헤더 */
export const DH_LOTTERY_HEADERS: HeadersInit = {
  Accept: "application/json, text/javascript, */*; q=0.01",
  Referer: "https://www.dhlottery.co.kr/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "X-Requested-With": "XMLHttpRequest",
};

/** API 원본 + 회차·날짜 메타 */
export type LottoDrawRecord = LottoDraw & {
  drwNo: number;
  drwNoDate: string;
};

type Lt645DrawItem = {
  ltEpsd: number;
  tm1WnNo: number;
  tm2WnNo: number;
  tm3WnNo: number;
  tm4WnNo: number;
  tm5WnNo: number;
  tm6WnNo: number;
  bnsWnNo: number;
  ltRflYmd: string;
};

type Lt645ApiResponse = {
  data?: {
    list?: Lt645DrawItem[];
  };
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

/** YYYYMMDD → YYYY-MM-DD */
export function formatLtRflYmd(ltRflYmd: string): string {
  if (!/^\d{8}$/.test(ltRflYmd)) {
    return ltRflYmd;
  }
  return `${ltRflYmd.slice(0, 4)}-${ltRflYmd.slice(4, 6)}-${ltRflYmd.slice(6, 8)}`;
}

/** lt645 API 1건 → LottoDrawRecord */
export function parseLt645DrawItem(item: Lt645DrawItem): LottoDrawRecord {
  const mainNumbers = [
    item.tm1WnNo,
    item.tm2WnNo,
    item.tm3WnNo,
    item.tm4WnNo,
    item.tm5WnNo,
    item.tm6WnNo,
  ].sort((a, b) => a - b);

  return {
    drwNo: item.ltEpsd,
    drwNoDate: formatLtRflYmd(item.ltRflYmd),
    mainNumbers,
    bonusNumber: item.bnsWnNo,
  };
}

/** 구 getLottoNumber JSON → LottoDrawRecord */
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

async function fetchLt645Json(
  url: string,
  fetchFn: FetchFn
): Promise<Lt645ApiResponse> {
  const response = await fetchFn(url, { headers: DH_LOTTERY_HEADERS });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`동행복권 API HTTP ${response.status}`);
  }
  if (text.trimStart().startsWith("<")) {
    throw new Error(
      "동행복권 접속이 차단되었습니다. 브라우저에서 dhlottery.co.kr 접속 후 다시 시도하세요."
    );
  }

  return JSON.parse(text) as Lt645ApiResponse;
}

function extractLt645Draw(
  json: Lt645ApiResponse,
  expectedRound?: number
): LottoDrawRecord {
  const item = json.data?.list?.[0];
  if (!item) {
    throw new Error(
      expectedRound
        ? `회차 ${expectedRound} 데이터가 없습니다.`
        : "당첨 데이터가 없습니다."
    );
  }
  return parseLt645DrawItem(item);
}

/** 특정 회차 당첨 번호 fetch */
export async function fetchDrawByRound(
  drwNo: number,
  fetchFn: FetchFn = fetch
): Promise<LottoDrawRecord> {
  if (!Number.isInteger(drwNo) || drwNo < 1) {
    throw new Error(`유효하지 않은 회차입니다: ${drwNo}`);
  }

  const url = `${DH_LOTTERY_LT645_URL}?srchLtEpsd=${drwNo}`;
  const json = await fetchLt645Json(url, fetchFn);
  return extractLt645Draw(json, drwNo);
}

/** 최신 완료 회차 (파라미터 없이 호출 → 최신 1건) */
export async function fetchLatestDrawRound(
  fetchFn: FetchFn = fetch
): Promise<number> {
  const json = await fetchLt645Json(DH_LOTTERY_LT645_URL, fetchFn);
  return extractLt645Draw(json).drwNo;
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
