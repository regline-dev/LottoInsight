"use client";

import { useCallback, useEffect, useState } from "react";
import GenerateButton from "@/components/GenerateButton";
import LottoSlip from "@/components/LottoSlip";
import NumberResult from "@/components/NumberResult";
import { LOTTO_GAME_LABELS } from "@/lib/constants";
import { generateLottoDraw, generateLottoDrawSets } from "@/lib/lotto/random";
import { EMPTY_LOTTO_DRAW, type LottoDraw } from "@/lib/lotto/types";

export default function LottoApp() {
  const [drawSets, setDrawSets] = useState<LottoDraw[]>([]);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [isScriptStuck, setIsScriptStuck] = useState(false);

  useEffect(() => {
    setDrawSets(generateLottoDrawSets());
  }, []);

  // 폰·외부 IP 접속 시 JS 번들 로드 실패하면 「번호 준비 중」에서 멈춤
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
        <div className="lotto-slip-board">
          {drawSets.map((draw, gameIndex) => {
            const gameLabel = LOTTO_GAME_LABELS[gameIndex];
            const isExtraGame = gameIndex > 0;
            const useCompactLayout = isExtraGame && !isWideScreen;

            return (
              <div
                key={gameLabel}
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
              <br />
              (외부 IP 테스트는{" "}
              <code className="text-[0.7rem]">npm run build</code> →{" "}
              <code className="text-[0.7rem]">npm run start:lan</code> 권장)
            </p>
          )}
        </div>
      )}

      <GenerateButton onClick={handleGenerateAll} disabled={!isNumbersReady} />

      <p className="text-center text-xs text-neutral-400">
        당첨 보장 없음 · 재미로만
      </p>
    </main>
  );
}
