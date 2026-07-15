import { LOTTO_MAX_NUMBER, LOTTO_MIN_NUMBER } from "@/lib/constants";
import type { LottoDrawRecord } from "@/lib/lotto/api";
import type {
  CooccurrenceExtremes,
  CooccurrenceRate,
} from "@/lib/lotto/cooccurrence.types";
import type { LottoDraw } from "@/lib/lotto/types";

export type { CooccurrenceExtremes, CooccurrenceRate } from "@/lib/lotto/cooccurrence.types";

/** rate → 표시용 퍼센트 (소수 1자리, .0 은 생략) */
export function formatCooccurrencePercent(rate: number): string {
  const percent = Math.round(rate * 1000) / 10;
  if (Number.isInteger(percent)) {
    return `${percent}%`;
  }
  return `${percent.toFixed(1)}%`;
}

function toCooccurrenceRate(
  partnerNumber: number,
  coCount: number,
  baseCount: number
): CooccurrenceRate {
  const rate = coCount / baseCount;
  return {
    partnerNumber,
    rate,
    ratePercent: Math.round(rate * 1000) / 10,
    coCount,
    baseCount,
  };
}

/** 기준 번호 A — 다른 번호별 P(B|A) 전체 (44개) */
export function getCooccurrenceRatesForBase(
  baseNumber: number,
  draws: LottoDrawRecord[]
): CooccurrenceRate[] {
  let baseCount = 0;
  const coCounts = new Map<number, number>();

  for (let number = LOTTO_MIN_NUMBER; number <= LOTTO_MAX_NUMBER; number += 1) {
    if (number !== baseNumber) {
      coCounts.set(number, 0);
    }
  }

  for (const draw of draws) {
    if (!draw.mainNumbers.includes(baseNumber)) {
      continue;
    }

    baseCount += 1;
    for (const partnerNumber of draw.mainNumbers) {
      if (partnerNumber === baseNumber) {
        continue;
      }
      coCounts.set(partnerNumber, (coCounts.get(partnerNumber) ?? 0) + 1);
    }
  }

  if (baseCount === 0) {
    return [];
  }

  return Array.from(coCounts.entries()).map(([partnerNumber, coCount]) =>
    toCooccurrenceRate(partnerNumber, coCount, baseCount)
  );
}

function pickExtremeRate(
  rates: CooccurrenceRate[],
  mode: "highest" | "lowest"
): CooccurrenceRate {
  return rates.reduce((best, current) => {
    if (mode === "highest") {
      if (current.rate > best.rate) {
        return current;
      }
      if (current.rate === best.rate && current.partnerNumber < best.partnerNumber) {
        return current;
      }
      return best;
    }

    if (current.rate < best.rate) {
      return current;
    }
    if (current.rate === best.rate && current.partnerNumber < best.partnerNumber) {
      return current;
    }
    return best;
  });
}

/** 기준 번호 A — 동반 출현 1위·꼴찌 */
export function getCooccurrenceExtremes(
  baseNumber: number,
  draws: LottoDrawRecord[]
): CooccurrenceExtremes {
  const rates = getCooccurrenceRatesForBase(baseNumber, draws);

  if (rates.length === 0) {
    return { baseNumber, highest: null, lowest: null };
  }

  return {
    baseNumber,
    highest: pickExtremeRate(rates, "highest"),
    lowest: pickExtremeRate(rates, "lowest"),
  };
}

/** 당첨 main 6개 — 각각 1위·꼴찌 요약 */
export function getCooccurrenceSummaries(
  baseNumbers: number[],
  draws: LottoDrawRecord[]
): CooccurrenceExtremes[] {
  return baseNumbers.map((baseNumber) =>
    getCooccurrenceExtremes(baseNumber, draws)
  );
}

/** 다음 주 세트별 동시출현 요약 — 빈 세트는 [] */
export function getCooccurrenceSummariesForDrawSets(
  drawSets: LottoDraw[],
  draws: LottoDrawRecord[]
): CooccurrenceExtremes[][] {
  return drawSets.map((draw) => {
    if (draw.mainNumbers.length === 0) {
      return [];
    }
    return getCooccurrenceSummaries(draw.mainNumbers, draws);
  });
}
