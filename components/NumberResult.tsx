import LottoBall from "@/components/LottoBall";
import { LOTTO_PICK_COUNT } from "@/lib/constants";
import type { LottoDraw } from "@/lib/lotto/types";

type NumberResultProps = {
  draw: LottoDraw;
  /** reserve: 공간만 / outline: 빈 공 테두리(모달 틀 유지) */
  emptyStyle?: "reserve" | "outline";
};

/** 공 행 — 비어 있어도 높이 유지 (초기화 시 용지가 안 올라가게) */
export default function NumberResult({
  draw,
  emptyStyle = "reserve",
}: NumberResultProps) {
  const { mainNumbers, bonusNumber } = draw;
  const isEmpty = mainNumbers.length === 0;
  const emptyClass =
    emptyStyle === "outline"
      ? "lotto-ball lotto-ball--empty-outline"
      : "lotto-ball lotto-ball--placeholder";
  const emptyBonusClass =
    emptyStyle === "outline"
      ? "lotto-ball--bonus-size lotto-ball--empty-outline"
      : "lotto-ball--bonus-size lotto-ball--placeholder";
  const plusEmptyClass =
    emptyStyle === "outline" ? "" : " lotto-number-plus--placeholder";

  // 모달 outline: 항상 6칸 틀 유지 (5개면 나머지 빈 칸)
  const outlineSlots =
    emptyStyle === "outline"
      ? Array.from({ length: LOTTO_PICK_COUNT }, (_, index) =>
          mainNumbers[index] ?? null
        )
      : null;

  return (
    <div
      className="lotto-number-row"
      aria-hidden={isEmpty || undefined}
      aria-label={isEmpty ? undefined : "선택한 로또 번호"}
    >
      {outlineSlots
        ? outlineSlots.map((number, index) =>
            number == null ? (
              <span key={`slot-empty-${index}`} className={emptyClass} />
            ) : (
              <LottoBall key={`slot-${number}-${index}`} number={number} />
            )
          )
        : isEmpty
          ? Array.from({ length: LOTTO_PICK_COUNT }, (_, index) => (
              <span key={`placeholder-main-${index}`} className={emptyClass} />
            ))
          : mainNumbers.map((number) => (
              <LottoBall key={number} number={number} />
            ))}

      <span
        className={`lotto-number-plus${
          isEmpty && emptyStyle !== "outline" ? plusEmptyClass : ""
        }`}
        aria-hidden
      >
        +
      </span>

      {bonusNumber > 0 ? (
        <LottoBall number={bonusNumber} size="bonus" />
      ) : (
        <span className={emptyBonusClass} />
      )}
    </div>
  );
}
