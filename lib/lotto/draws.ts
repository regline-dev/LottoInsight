import type { LottoDrawsFile } from "@/lib/lotto/sync";
import type { LottoDrawRecord } from "@/lib/lotto/api";

/** LottoDrawRecord → 화면용 LottoDraw */
export function toLottoDraw(record: LottoDrawRecord) {
  return {
    mainNumbers: record.mainNumbers,
    bonusNumber: record.bonusNumber,
  };
}

/** 회차 번호로 1건 찾기 */
export function findDrawByRound(
  file: LottoDrawsFile,
  drwNo: number
): LottoDrawRecord | undefined {
  return file.draws.find((draw) => draw.drwNo === drwNo);
}

/** 최근 count회차 (최신 → 과거) */
export function getRecentDrawsFromFile(
  file: LottoDrawsFile,
  count: number
): LottoDrawRecord[] {
  if (count < 1) {
    return [];
  }
  return file.draws.slice(-count).reverse();
}
