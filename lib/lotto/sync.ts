import type { LottoDrawRecord } from "@/lib/lotto/api";
import {
  fetchDrawByRound,
  fetchLatestDrawRound,
  type FetchFn,
} from "@/lib/lotto/api";

/** JSON 파일 최상위 구조 */
export type LottoDrawsFile = {
  updatedAt: string;
  count: number;
  draws: LottoDrawRecord[];
};

/** 회차 오름차순 정렬 */
export function sortDrawRecords(draws: LottoDrawRecord[]): LottoDrawRecord[] {
  return [...draws].sort((a, b) => a.drwNo - b.drwNo);
}

/** 기존 + 신규 병합 (같은 drwNo면 신규로 덮어씀) */
export function mergeDrawRecords(
  existing: LottoDrawRecord[],
  incoming: LottoDrawRecord[]
): LottoDrawRecord[] {
  const byRound = new Map<number, LottoDrawRecord>();

  for (const draw of existing) {
    byRound.set(draw.drwNo, draw);
  }
  for (const draw of incoming) {
    byRound.set(draw.drwNo, draw);
  }

  return sortDrawRecords(Array.from(byRound.values()));
}

/** JSON 파일에서 마지막 회차 번호 — 없으면 0 */
export function getLastStoredRound(file: LottoDrawsFile | null): number {
  if (!file || file.draws.length === 0) {
    return 0;
  }
  return file.draws[file.draws.length - 1].drwNo;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** fromRound ~ toRound 회차 fetch (순차, API 부하 완화) */
export async function fetchDrawsInRange(
  fromRound: number,
  toRound: number,
  options: {
    fetchFn?: FetchFn;
    delayMs?: number;
    onProgress?: (round: number, total: number) => void;
  } = {}
): Promise<LottoDrawRecord[]> {
  const { fetchFn = fetch, delayMs = 150, onProgress } = options;

  if (!Number.isInteger(fromRound) || !Number.isInteger(toRound)) {
    throw new Error("회차는 정수여야 합니다.");
  }
  if (fromRound < 1 || toRound < fromRound) {
    throw new Error(`유효하지 않은 구간: ${fromRound} ~ ${toRound}`);
  }

  const total = toRound - fromRound + 1;
  const draws: LottoDrawRecord[] = [];

  for (let round = fromRound; round <= toRound; round += 1) {
    const record = await fetchDrawByRound(round, fetchFn);
    draws.push(record);
    onProgress?.(round - fromRound + 1, total);

    if (round < toRound && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  return draws;
}

/** 1회 ~ 최신 회차 전부 fetch */
export async function fetchAllDraws(
  options: {
    fetchFn?: FetchFn;
    delayMs?: number;
    onProgress?: (round: number, total: number) => void;
  } = {}
): Promise<LottoDrawRecord[]> {
  const fetchFn = options.fetchFn ?? fetch;
  const latestRound = await fetchLatestDrawRound(fetchFn);
  return fetchDrawsInRange(1, latestRound, { ...options, fetchFn });
}

/** 증분 동기화 구간 계산 */
export function getSyncRange(
  lastStoredRound: number,
  latestRound: number
): { fromRound: number; toRound: number } | null {
  if (latestRound <= lastStoredRound) {
    return null;
  }
  return { fromRound: lastStoredRound + 1, toRound: latestRound };
}

/** 파일 객체 생성 */
export function buildDrawsFile(draws: LottoDrawRecord[]): LottoDrawsFile {
  const sorted = sortDrawRecords(draws);
  return {
    updatedAt: new Date().toISOString(),
    count: sorted.length,
    draws: sorted,
  };
}
