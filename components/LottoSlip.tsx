import {
  LOTTO_GRID_COLUMNS,
  LOTTO_GRID_ROWS,
  LOTTO_GRID_ROW_HEIGHT_RATIO,
} from "@/lib/constants";
import { buildPatternPoints, getNumberAtCell } from "@/lib/lotto/grid";

type LottoSlipProps = {
  selectedNumbers: number[];
  gameLabel?: string;
  compact?: boolean;
  onReset?: () => void;
  onAutoSelect?: () => void;
};

/** 번호 칸 — 실제 용지처럼 모서리 bracket */
function LottoMarkCell({
  number,
  isSelected,
  compact,
}: {
  number: number;
  isSelected: boolean;
  compact: boolean;
}) {
  return (
    <div
      className={`lotto-mark-cell ${compact ? "lotto-mark-cell--compact" : ""} ${
        isSelected ? "lotto-mark-cell--selected" : ""
      }`}
      aria-label={`번호 ${number}${isSelected ? " 선택됨" : ""}`}
    >
      {isSelected && <span className="lotto-mark-cell__fill" aria-hidden />}
      <span className="lotto-mark-cell__num">{number}</span>
    </div>
  );
}

/** 하단 버튼 — 용지와 같은 bracket 스타일 */
function SlipActionButton({
  label,
  onClick,
  compact,
  wide,
}: {
  label: string;
  onClick?: () => void;
  compact: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`lotto-slip-btn ${compact ? "lotto-slip-btn--compact" : ""} ${
        wide ? "lotto-slip-btn--wide" : ""
      }`}
    >
      {label}
    </button>
  );
}

export default function LottoSlip({
  selectedNumbers,
  gameLabel,
  compact = false,
  onReset,
  onAutoSelect,
}: LottoSlipProps) {
  const selectedNumberSet = new Set(selectedNumbers);
  const patternPoints = buildPatternPoints(selectedNumbers);

  return (
    <div className={`lotto-slip-paper ${compact ? "lotto-slip-paper--compact" : ""}`}>
      {/* 용지 상단 코랄 바 + 게임 라벨 */}
      <div className="lotto-slip-header">
        {gameLabel && (
          <span className="lotto-slip-header__label">{gameLabel}</span>
        )}
        <div className="lotto-slip-header__bar" />
      </div>

      <div className="lotto-slip-body">
        <div className="lotto-slip-grid-wrap">
          <div className="lotto-slip-grid">
            {Array.from({ length: LOTTO_GRID_ROWS }).flatMap((_, rowIndex) =>
              Array.from({ length: LOTTO_GRID_COLUMNS }).map((__, colIndex) => {
                const cellNumber = getNumberAtCell(rowIndex, colIndex);

                if (cellNumber === null) {
                  return (
                    <div
                      key={`empty-${rowIndex}-${colIndex}`}
                      className="lotto-mark-cell lotto-mark-cell--empty"
                    />
                  );
                }

                return (
                  <LottoMarkCell
                    key={cellNumber}
                    number={cellNumber}
                    isSelected={selectedNumberSet.has(cellNumber)}
                    compact={compact}
                  />
                );
              })
            )}
          </div>

          {patternPoints && (
            <svg
              className="lotto-slip-pattern"
              viewBox={`0 0 ${LOTTO_GRID_COLUMNS} ${LOTTO_GRID_ROWS * LOTTO_GRID_ROW_HEIGHT_RATIO}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <polyline
                points={patternPoints}
                fill="none"
                stroke="#b84a4a"
                strokeWidth="0.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.9}
              />
            </svg>
          )}
        </div>

        {/* 실제 용지 하단 버튼 */}
        <div className="lotto-slip-actions">
          <SlipActionButton
            label="초기화"
            compact={compact}
            onClick={onReset}
          />
          <SlipActionButton
            label="자동선택"
            compact={compact}
            onClick={onAutoSelect}
          />
          <SlipActionButton
            label="나의번호등록"
            compact={compact}
            wide
          />
        </div>
      </div>
    </div>
  );
}
