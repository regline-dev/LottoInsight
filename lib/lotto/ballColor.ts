/** 동행복권 로또 공 구간별 색 */
export type LottoBallColor = {
  /** 기본색 (보너스·폴백용) */
  backgroundColor: string;
  /** 3D 그라데이션 — 상단 밝은 톤 */
  lightColor: string;
  /** 3D 그라데이션 — 하단 어두운 톤 */
  darkColor: string;
  textColor: string;
};

const LOTTO_BALL_PALETTE = {
  yellow: {
    backgroundColor: "#fbc400",
    lightColor: "#ffe875",
    darkColor: "#c99700",
    textColor: "#ffffff",
  },
  blue: {
    backgroundColor: "#69c8f2",
    lightColor: "#a8e0fb",
    darkColor: "#3aa8db",
    textColor: "#ffffff",
  },
  red: {
    backgroundColor: "#ff7272",
    lightColor: "#ffb0b0",
    darkColor: "#e04e4e",
    textColor: "#ffffff",
  },
  gray: {
    backgroundColor: "#aaaaaa",
    lightColor: "#d0d0d0",
    darkColor: "#7a7a7a",
    textColor: "#ffffff",
  },
  green: {
    backgroundColor: "#b0d840",
    lightColor: "#d4f070",
    darkColor: "#8aab28",
    textColor: "#ffffff",
  },
} as const satisfies Record<string, LottoBallColor>;

/** 번호 → 로또 공 색 (1~10 노, 11~20 파, 21~30 빨, 31~40 회, 41~45 초) */
export function getLottoBallColor(number: number): LottoBallColor {
  if (number >= 1 && number <= 10) {
    return LOTTO_BALL_PALETTE.yellow;
  }
  if (number >= 11 && number <= 20) {
    return LOTTO_BALL_PALETTE.blue;
  }
  if (number >= 21 && number <= 30) {
    return LOTTO_BALL_PALETTE.red;
  }
  if (number >= 31 && number <= 40) {
    return LOTTO_BALL_PALETTE.gray;
  }
  if (number >= 41 && number <= 45) {
    return LOTTO_BALL_PALETTE.green;
  }

  return {
    backgroundColor: "#d97272",
    lightColor: "#f5a8a8",
    darkColor: "#b85555",
    textColor: "#ffffff",
  };
}

/** 본번호 6개 — 3D 구면 배경 (CSS 변수 대신 인라인으로 확실히 적용) */
export function getLottoBallSphereBackground(color: LottoBallColor): string {
  /* 하이라이트 — 좌상단 작게, 번지지 않게 */
  const highlightLayer =
    "radial-gradient(circle at 28% 20%, rgb(255 255 255 / 76%) 0%, rgb(255 255 255 / 20%) 14%, rgb(255 255 255 / 0%) 22%)";
  const sphereLayer = `radial-gradient(circle at 38% 32%, ${color.lightColor} 0%, ${color.backgroundColor} 46%, ${color.darkColor} 100%)`;

  return `${highlightLayer}, ${sphereLayer}`;
}
