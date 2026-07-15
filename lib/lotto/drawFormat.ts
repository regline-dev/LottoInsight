/** 지난 당첨 회차 제목 — 예: 제 1225회 */
export function formatDrawRoundTitle(drwNo: number): string {
  return `제 ${drwNo}회`;
}

/** 추첨일 점 구분 — 2026-05-24 → 2026.05.24 */
export function formatDrawDateDots(drwNoDate: string): string {
  return drwNoDate.replace(/-/g, ".");
}
