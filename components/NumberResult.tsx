import LottoBall from "@/components/LottoBall";
import type { LottoDraw } from "@/lib/lotto/types";

type NumberResultProps = {
  draw: LottoDraw;
};

export default function NumberResult({ draw }: NumberResultProps) {
  const { mainNumbers, bonusNumber } = draw;

  if (mainNumbers.length === 0) {
    return null;
  }

  return (
    <div className="lotto-number-row">
      {mainNumbers.map((number) => (
        <LottoBall key={number} number={number} />
      ))}

      {bonusNumber > 0 && (
        <>
          <span className="lotto-number-plus" aria-hidden>
            +
          </span>
          <LottoBall number={bonusNumber} size="bonus" />
        </>
      )}
    </div>
  );
}
