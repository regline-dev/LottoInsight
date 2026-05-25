import {
  LOTTO_GRID_COLUMNS,
  LOTTO_GRID_ROW_HEIGHT_RATIO,
  LOTTO_MAX_NUMBER,
} from "@/lib/constants";

export type GridPosition = { row: number; col: number };

/** 로또 번호 -> 7x7 용지 (row, col) — 0부터 시작 */
export function numberToGridPosition(number: number): GridPosition {
  if (!Number.isInteger(number) || number < 1 || number > LOTTO_MAX_NUMBER) {
    throw new Error(`유효하지 않은 로또 번호입니다: ${number}`);
  }

  const col = (number - 1) % LOTTO_GRID_COLUMNS;
  const row = Math.floor((number - 1) / LOTTO_GRID_COLUMNS);
  return { row, col };
}

/** 그리드 칸 중심 좌표 (viewBox 0~7 기준) */
export function gridPositionToCenter(position: GridPosition): {
  x: number;
  y: number;
} {
  return {
    x: position.col + 0.5,
    y:
      position.row * LOTTO_GRID_ROW_HEIGHT_RATIO +
      LOTTO_GRID_ROW_HEIGHT_RATIO / 2,
  };
}

/** 선택 번호 순서대로 SVG polyline points 문자열 생성 */
export function buildPatternPoints(selectedNumbers: number[]): string {
  if (selectedNumbers.length === 0) {
    return "";
  }

  return selectedNumbers
    .map((number) => {
      const center = gridPositionToCenter(numberToGridPosition(number));
      return `${center.x},${center.y}`;
    })
    .join(" ");
}

/** (row, col) 위치의 로또 번호 — 없으면 null */
export function getNumberAtCell(row: number, col: number): number | null {
  const number = row * LOTTO_GRID_COLUMNS + col + 1;
  if (number > LOTTO_MAX_NUMBER) {
    return null;
  }
  return number;
}