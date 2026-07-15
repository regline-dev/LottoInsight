/** 기준 번호 A → 짝 B 와의 조건부 동시 출현 */
export type CooccurrenceRate = {
  partnerNumber: number;
  rate: number;
  ratePercent: number;
  coCount: number;
  baseCount: number;
};

/** 기준 번호 하나에 대한 1위·꼴찌 */
export type CooccurrenceExtremes =
  | {
      baseNumber: number;
      highest: CooccurrenceRate;
      lowest: CooccurrenceRate;
    }
  | {
      baseNumber: number;
      highest: null;
      lowest: null;
    };
