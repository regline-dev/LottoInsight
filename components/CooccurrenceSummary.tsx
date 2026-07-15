import LottoBall from "@/components/LottoBall";
import { formatCooccurrencePercent } from "@/lib/lotto/cooccurrence";
import type { CooccurrenceExtremes } from "@/lib/lotto/cooccurrence.types";

type CooccurrenceSummaryProps = {
  summaries: CooccurrenceExtremes[];
  /** 기본: 동시 출현 (전 회차) */
  title?: string;
};

/** 기준 번호별 동반 출현 1위·꼴찌 — 6칸 고정 테이블 */
export default function CooccurrenceSummary({
  summaries,
  title = "동시 출현 (전 회차)",
}: CooccurrenceSummaryProps) {
  return (
    <div className="cooccurrence-summary" aria-label="번호 동시 출현 요약">
      <p className="cooccurrence-summary__title">{title}</p>

      <table className="cooccurrence-summary__table">
        <colgroup>
          <col className="cooccurrence-summary__col cooccurrence-summary__col--base" />
          <col className="cooccurrence-summary__col cooccurrence-summary__col--arrow-up" />
          <col className="cooccurrence-summary__col cooccurrence-summary__col--high-ball" />
          <col className="cooccurrence-summary__col cooccurrence-summary__col--high-rate" />
          <col className="cooccurrence-summary__col cooccurrence-summary__col--arrow-down" />
          <col className="cooccurrence-summary__col cooccurrence-summary__col--low-ball" />
          <col className="cooccurrence-summary__col cooccurrence-summary__col--low-rate" />
        </colgroup>
        <tbody>
          {summaries.map((row) => (
            <tr key={row.baseNumber} className="cooccurrence-summary__tr">
              {/* 1. 기준 공 */}
              <td className="cooccurrence-summary__cell cooccurrence-summary__cell--base">
                <LottoBall number={row.baseNumber} />
              </td>

              {row.highest && row.lowest ? (
                <>
                  {/* 2. ↑ */}
                  <td className="cooccurrence-summary__cell cooccurrence-summary__cell--arrow-up">
                    <span aria-hidden>↑</span>
                  </td>
                  {/* 3. 1위 공 */}
                  <td className="cooccurrence-summary__cell cooccurrence-summary__cell--high-ball">
                    <LottoBall number={row.highest.partnerNumber} />
                  </td>
                  {/* 4. 1위 % */}
                  <td className="cooccurrence-summary__cell cooccurrence-summary__cell--high-rate">
                    {formatCooccurrencePercent(row.highest.rate)}
                  </td>
                  {/* 5. ↓ */}
                  <td className="cooccurrence-summary__cell cooccurrence-summary__cell--arrow-down">
                    <span aria-hidden>↓</span>
                  </td>
                  {/* 6. 꼴찌 공 */}
                  <td className="cooccurrence-summary__cell cooccurrence-summary__cell--low-ball">
                    <LottoBall number={row.lowest.partnerNumber} />
                  </td>
                  {/* 7. 꼴찌 % */}
                  <td className="cooccurrence-summary__cell cooccurrence-summary__cell--low-rate">
                    {formatCooccurrencePercent(row.lowest.rate)}
                  </td>
                </>
              ) : (
                <td
                  className="cooccurrence-summary__cell cooccurrence-summary__cell--empty"
                  colSpan={6}
                >
                  데이터 없음
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
