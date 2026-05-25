import {
  LOTTO_GAME_COUNT,
  LOTTO_MAX_NUMBER,
  LOTTO_MIN_NUMBER,
  LOTTO_PICK_COUNT,
} from "@/lib/constants";
import type { LottoDraw } from "@/lib/lotto/types";

/** 1~45 범위인지 검사 */
export function isValidLottoNumber(number: number): boolean {
  return (
    Number.isInteger(number) &&
    number >= LOTTO_MIN_NUMBER &&
    number <= LOTTO_MAX_NUMBER
  );
}

/** 1~45에서 겹치지 않는 로또 번호 6개 생성 (오름차순) */
export function generateLottoNumbers(
  randomFn: () => number = Math.random
): number[] {
  const pickedNumbers = new Set<number>();
  let safetyCount = 0;
  const maxAttempts = LOTTO_MAX_NUMBER * 2;

  while (
    pickedNumbers.size < LOTTO_PICK_COUNT &&
    safetyCount < maxAttempts
  ) {
    const candidate =
      Math.floor(randomFn() * LOTTO_MAX_NUMBER) + LOTTO_MIN_NUMBER;
    pickedNumbers.add(candidate);
    safetyCount += 1;
  }

  if (pickedNumbers.size !== LOTTO_PICK_COUNT) {
    throw new Error("로또 번호 6개를 생성하지 못했습니다.");
  }

  return Array.from(pickedNumbers).sort((a, b) => a - b);
}

/** 본번호 6개 + 보너스 1개 생성 */
export function generateLottoDraw(
  randomFn: () => number = Math.random
): LottoDraw {
  const mainNumbers = generateLottoNumbers(randomFn);
  const mainNumberSet = new Set(mainNumbers);

  let bonusNumber = 0;
  let safetyCount = 0;
  const maxAttempts = LOTTO_MAX_NUMBER * 2;

  while (bonusNumber === 0 && safetyCount < maxAttempts) {
    const candidate =
      Math.floor(randomFn() * LOTTO_MAX_NUMBER) + LOTTO_MIN_NUMBER;
    if (!mainNumberSet.has(candidate)) {
      bonusNumber = candidate;
    }
    safetyCount += 1;
  }

  if (bonusNumber === 0) {
    throw new Error("보너스 번호를 생성하지 못했습니다.");
  }

  return { mainNumbers, bonusNumber };
}

/** A~E 게임별 (본번호 6 + 보너스) 생성 */
export function generateLottoDrawSets(
  gameCount: number = LOTTO_GAME_COUNT,
  randomFn: () => number = Math.random
): LottoDraw[] {
  if (!Number.isInteger(gameCount) || gameCount < 1) {
    throw new Error("게임 수는 1 이상이어야 합니다.");
  }

  return Array.from({ length: gameCount }, () => generateLottoDraw(randomFn));
}

/** @deprecated 본번호 6개만 — slip 로직 호환용 */
export function generateLottoNumberSets(
  gameCount: number = LOTTO_GAME_COUNT,
  randomFn: () => number = Math.random
): number[][] {
  return generateLottoDrawSets(gameCount, randomFn).map(
    (draw) => draw.mainNumbers
  );
}