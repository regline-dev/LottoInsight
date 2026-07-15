import CooccurrenceSummary from "@/components/CooccurrenceSummary";
import LottoSlip from "@/components/LottoSlip";
import NumberResult from "@/components/NumberResult";
import PastDrawHeading from "@/components/PastDrawHeading";
import type { LottoDrawRecord } from "@/lib/lotto/api";
import type { CooccurrenceExtremes } from "@/lib/lotto/cooccurrence.types";
import { toLottoDraw } from "@/lib/lotto/draws";

type PastDrawColumnProps = {
  record: LottoDrawRecord;
  gameLabel: string;
  compact: boolean;
  isExtraGame: boolean;
  /** A칸(최신 회차) 테스트 — 마킹지 아래 동시 출현 요약 */
  cooccurrenceSummaries?: CooccurrenceExtremes[];
};

/** 지난 당첨 1칸 — 제 N회 · 날짜 · 공 6+1 · 용지 */
export default function PastDrawColumn({
  record,
  gameLabel,
  compact,
  isExtraGame,
  cooccurrenceSummaries,
}: PastDrawColumnProps) {
  const draw = toLottoDraw(record);

  return (
    <div
      className={`lotto-slip-column lotto-slip-column--past ${
        isExtraGame ? "lotto-slip-column--extra" : ""
      }`}
    >
      <PastDrawHeading drwNo={record.drwNo} drwNoDate={record.drwNoDate} />
      <NumberResult draw={draw} />
      <LottoSlip
        gameLabel={gameLabel}
        selectedNumbers={draw.mainNumbers}
        compact={compact}
        readonly
      />
      {cooccurrenceSummaries && cooccurrenceSummaries.length > 0 && (
        <CooccurrenceSummary summaries={cooccurrenceSummaries} />
      )}
    </div>
  );
}
