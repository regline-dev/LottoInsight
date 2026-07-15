import LottoSlip from "@/components/LottoSlip";
import NumberResult from "@/components/NumberResult";
import PastDrawHeading from "@/components/PastDrawHeading";
import type { LottoDrawRecord } from "@/lib/lotto/api";
import { toLottoDraw } from "@/lib/lotto/draws";

type PastDrawColumnProps = {
  record: LottoDrawRecord;
  gameLabel: string;
  compact: boolean;
  isExtraGame: boolean;
};

/** 지난 당첨 1칸 — 제 N회 · 날짜 · 공 6+1 · 용지 */
export default function PastDrawColumn({
  record,
  gameLabel,
  compact,
  isExtraGame,
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
    </div>
  );
}
