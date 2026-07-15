"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import GenerateButton from "@/components/GenerateButton";
import LottoSlip from "@/components/LottoSlip";
import NumberResult from "@/components/NumberResult";
import PastDrawColumn from "@/components/PastDrawColumn";
import { LOTTO_GAME_COUNT, LOTTO_GAME_LABELS } from "@/lib/constants";
import { getRecentDrawsFromFile } from "@/lib/lotto/draws";
import { getCooccurrenceSummaries } from "@/lib/lotto/cooccurrence";
import { generateLottoDraw, generateLottoDrawSets } from "@/lib/lotto/random";
import type { LottoDrawsFile } from "@/lib/lotto/sync";
import { EMPTY_LOTTO_DRAW, type LottoDraw } from "@/lib/lotto/types";

const PAST_DRAW_COUNT = 5;

type LottoAppProps = {
  drawsFile: LottoDrawsFile;
};

export default function LottoApp({ drawsFile }: LottoAppProps) {
  const [drawSets, setDrawSets] = useState<LottoDraw[]>([]);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [isScriptStuck, setIsScriptStuck] = useState(false);

  const pastDrawRecords = useMemo(
    () => getRecentDrawsFromFile(drawsFile, PAST_DRAW_COUNT),
    [drawsFile]
  );

  const latestCooccurrenceSummaries = useMemo(() => {
    const latestPastDraw = pastDrawRecords[0];
    if (!latestPastDraw) {
      return undefined;
    }
    return getCooccurrenceSummaries(
      latestPastDraw.mainNumbers,
      drawsFile.draws
    );
  }, [pastDrawRecords, drawsFile.draws]);

  useEffect(() => {
    setDrawSets(generateLottoDrawSets());
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => setIsScriptStuck(true), 4000);
    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = () => setIsWideScreen(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleGenerateAll = useCallback(() => {
    setDrawSets(generateLottoDrawSets());
  }, []);

  const handleAutoSelectGame = useCallback((gameIndex: number) => {
    setDrawSets((prevSets) =>
      prevSets.map((draw, index) =>
        index === gameIndex ? generateLottoDraw() : draw
      )
    );
  }, []);

  const handleResetGame = useCallback((gameIndex: number) => {
    setDrawSets((prevSets) =>
      prevSets.map((draw, index) =>
        index === gameIndex ? EMPTY_LOTTO_DRAW : draw
      )
    );
  }, []);

  const isNumbersReady = drawSets.length > 0;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-3 py-5 md:max-w-7xl md:px-4">
      <header className="text-center">
        <h1
          className="text-lg font-bold"
          style={{ color: "var(--lotto-coral-dark)" }}
        >
          LottoInsight
        </h1>
        <p className="mt-0.5 text-xs text-neutral-500">패턴으로 보는 로또</p>
      </header>

      {isNumbersReady ? (
        <>
          {/* 위: 다음 주 — 랜덤 뽑기 */}
          <section className="lotto-slip-section" aria-label="다음 주">
            <h2 className="lotto-slip-section__title">다음 주</h2>
            <div className="lotto-slip-board">
              {drawSets.slice(0, LOTTO_GAME_COUNT).map((draw, gameIndex) => {
                const gameLabel = LOTTO_GAME_LABELS[gameIndex];
                const isExtraGame = gameIndex > 0;
                const useCompactLayout = isExtraGame && !isWideScreen;

                return (
                  <div
                    key={`next-${gameLabel}`}
                    className={`lotto-slip-column ${
                      isExtraGame ? "lotto-slip-column--extra" : ""
                    }`}
                  >
                    <NumberResult draw={draw} />
                    <LottoSlip
                      gameLabel={gameLabel}
                      selectedNumbers={draw.mainNumbers}
                      compact={useCompactLayout}
                      onReset={() => handleResetGame(gameIndex)}
                      onAutoSelect={() => handleAutoSelectGame(gameIndex)}
                    />
                  </div>
                );
              })}
            </div>
            <GenerateButton onClick={handleGenerateAll} />
          </section>

          {/* 아래: 지난 5회차 당첨 — 읽기 전용 */}
          {pastDrawRecords.length > 0 && (
            <section
              className="lotto-slip-section lotto-slip-section--past"
              aria-label="지난 당첨"
            >
              <div className="lotto-slip-board">
                {pastDrawRecords.map((record, gameIndex) => (
                  <PastDrawColumn
                    key={`past-${record.drwNo}`}
                    record={record}
                    gameLabel={LOTTO_GAME_LABELS[gameIndex]}
                    compact={gameIndex > 0 && !isWideScreen}
                    isExtraGame={gameIndex > 0}
                    cooccurrenceSummaries={
                      gameIndex === 0 ? latestCooccurrenceSummaries : undefined
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="py-8 text-center text-sm text-neutral-400">
          <p>번호 준비 중...</p>
          {isScriptStuck && (
            <p className="mt-3 px-4 text-xs leading-relaxed text-neutral-500">
              오래 걸리면 JavaScript가 안 불러와진 겁니다.
              <br />
              PC에서{" "}
              <code className="text-[0.7rem]">npm run dev</code> 재시작 후
              다시 접속해 보세요.
            </p>
          )}
        </div>
      )}

      <p className="text-center text-xs text-neutral-400">
        당첨 보장 없음 · 재미로만
      </p>
    </main>
  );
}
