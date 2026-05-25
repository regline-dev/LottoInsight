/** 한 게임 당첨 번호 — 본번호 6 + 보너스 1 */
export type LottoDraw = {
  mainNumbers: number[];
  bonusNumber: number;
};

/** 빈 게임 (초기화) */
export const EMPTY_LOTTO_DRAW: LottoDraw = {
  mainNumbers: [],
  bonusNumber: 0,
};
