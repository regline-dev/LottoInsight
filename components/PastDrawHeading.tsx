import { formatDrawDateDots, formatDrawRoundTitle } from "@/lib/lotto/drawFormat";

type PastDrawHeadingProps = {
  drwNo: number;
  drwNoDate: string;
};

/** 지난 당첨 — 제 N회(크게) + 날짜(작게) */
export default function PastDrawHeading({
  drwNo,
  drwNoDate,
}: PastDrawHeadingProps) {
  return (
    <div className="past-draw-heading">
      <span className="past-draw-heading__round">{formatDrawRoundTitle(drwNo)}</span>
      <span className="past-draw-heading__date">{formatDrawDateDots(drwNoDate)}</span>
    </div>
  );
}
