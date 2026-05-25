/**
 * LottoInsight 도메인 상수 (Single Source of Truth)
 *
 * - random.ts, grid.ts, LottoSlip, LottoApp 등에서 공통으로 쓰는 고정값만 둔다.
 * - 45, 6, 7 같은 매직 넘버를 파일마다 복붙하면 수정 시 불일치가 난다 → 여기만 수정.
 * - lib/ 쪽 파일 중 맨 먼저 만든 이유: 이후 모듈이 전부 이 값을 import 하기 때문.
 */

/** 로또 번호 범위 */
export const LOTTO_MIN_NUMBER = 1;
export const LOTTO_MAX_NUMBER = 45;

/** 1게임당 본번호 개수 */
export const LOTTO_PICK_COUNT = 6;

/** 편의점 용지 7열 × 7행 (1~45, 마지막 행 3칸) */
export const LOTTO_GRID_COLUMNS = 7;
export const LOTTO_GRID_ROWS = 7;

/** grid.ts(SVG 패턴) + globals.css(칸 비율) 공통 — 세로 직사각 */
export const LOTTO_GRID_ROW_HEIGHT_RATIO = 1.06;

/** 실제 용지 A~E — PC 5열, 모바일 A만 표시 */
export const LOTTO_GAME_COUNT = 5;
export const LOTTO_GAME_LABELS = ["A", "B", "C", "D", "E"] as const;
