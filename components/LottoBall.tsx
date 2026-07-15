import type { CSSProperties } from "react";
import {
  getLottoBallColor,
  getLottoBallSphereBackground,
} from "@/lib/lotto/ballColor";

type LottoBallSize = "main" | "bonus" | "compact";

type LottoBallProps = {
  number: number;
  /** 보너스 — 본번호보다 약간만 작게 */
  size?: LottoBallSize;
};

export default function LottoBall({
  number,
  size = "main",
}: LottoBallProps) {
  const ballColor = getLottoBallColor(number);
  const sizeClass =
    size === "bonus"
      ? "lotto-ball--bonus-size"
      : size === "compact"
        ? "lotto-ball lotto-ball--compact-size"
        : "lotto-ball";

  // 본번호·요약용 compact — 3D 구면 그라데이션 + 하이라이트
  if (size === "main" || size === "compact") {
    const sphereStyle: CSSProperties = {
      backgroundColor: ballColor.backgroundColor,
      backgroundImage: getLottoBallSphereBackground(ballColor),
    };

    return (
      <span
        className={sizeClass}
        style={sphereStyle}
        aria-label={`번호 ${number}`}
      >
        <span className="lotto-ball__digit">{number}</span>
      </span>
    );
  }

  // 보너스 — 기존 플랫 스타일 유지
  return (
    <span
      className={sizeClass}
      style={{
        backgroundColor: ballColor.backgroundColor,
        color: ballColor.textColor,
      }}
      aria-label={`보너스 ${number}`}
    >
      {number}
    </span>
  );
}
