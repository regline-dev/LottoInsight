import { LOTTO_PICK_COUNT } from "@/lib/constants";

export type SlipSelectState = {
  mainNumbers: number[];
  /** 6개일 때 교체할 번호 — 하늘색 표시 */
  pendingReplaceNumber: number | null;
};

/** 용지 번호 탭 결과 — 순수 로직 (UI 없음) */
export function applySlipNumberTap(
  mainNumbers: number[],
  pendingReplaceNumber: number | null,
  tappedNumber: number
): SlipSelectState {
  const selectedSet = new Set(mainNumbers);
  const isSelected = selectedSet.has(tappedNumber);
  const isFull = mainNumbers.length >= LOTTO_PICK_COUNT;

  // 6개 미만: 추가 / 해제
  if (!isFull) {
    if (isSelected) {
      return {
        mainNumbers: mainNumbers
          .filter((number) => number !== tappedNumber)
          .sort((a, b) => a - b),
        pendingReplaceNumber: null,
      };
    }

    return {
      mainNumbers: [...mainNumbers, tappedNumber].sort((a, b) => a - b),
      pendingReplaceNumber: null,
    };
  }

  // 이미 6개: 교체 대기 → 교체
  if (pendingReplaceNumber === null) {
    if (!isSelected) {
      return { mainNumbers: [...mainNumbers], pendingReplaceNumber: null };
    }
    return {
      mainNumbers: [...mainNumbers],
      pendingReplaceNumber: tappedNumber,
    };
  }

  // 같은 칸 → 취소
  if (tappedNumber === pendingReplaceNumber) {
    return {
      mainNumbers: [...mainNumbers],
      pendingReplaceNumber: null,
    };
  }

  // 다른 선택 칸 → 대기 대상만 변경
  if (isSelected) {
    return {
      mainNumbers: [...mainNumbers],
      pendingReplaceNumber: tappedNumber,
    };
  }

  // 빈 칸 → 교체
  const replaced = mainNumbers
    .map((number) =>
      number === pendingReplaceNumber ? tappedNumber : number
    )
    .sort((a, b) => a - b);

  return {
    mainNumbers: replaced,
    pendingReplaceNumber: null,
  };
}
