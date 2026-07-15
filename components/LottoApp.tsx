"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import CooccurrenceSummary from "@/components/CooccurrenceSummary";
import GenerateButton from "@/components/GenerateButton";
import LottoSlip from "@/components/LottoSlip";
import MyNumberModal from "@/components/MyNumberModal";
import NumberResult from "@/components/NumberResult";
import PastDrawColumn from "@/components/PastDrawColumn";
import { LOTTO_GAME_COUNT, LOTTO_GAME_LABELS } from "@/lib/constants";
import { getCooccurrenceSummariesForDrawSets } from "@/lib/lotto/cooccurrence";
import { getRecentDrawsFromFile } from "@/lib/lotto/draws";
import { generateLottoDraw, generateLottoDrawSets } from "@/lib/lotto/random";
import { applySlipNumberTap } from "@/lib/lotto/slipSelect";
import {
  canRegisterMyNumbers,
  hasSavedMyNumber,
  readMyNumbersFromStorage,
  removeMyNumberFromStore,
  saveMyNumberToStore,
  writeMyNumbersToStorage,
  type MyNumbersStore,
} from "@/lib/lotto/myNumbers";
import type { LottoDrawsFile } from "@/lib/lotto/sync";
import { EMPTY_LOTTO_DRAW, type LottoDraw } from "@/lib/lotto/types";

const PAST_DRAW_COUNT = 5;
const NEXT_WEEK_GUIDE_TEXT =
  "번호변경 : 각 세트에 선택된 번호를 먼저 선택(하늘색) 후 원하시는 번호로 교체. 6개 이하인 경우 원하는 번호 선택";

type LottoAppProps = {
  drawsFile: LottoDrawsFile;
};

export default function LottoApp({ drawsFile }: LottoAppProps) {
  const [drawSets, setDrawSets] = useState<LottoDraw[]>([]);
  const [pendingReplaceByGame, setPendingReplaceByGame] = useState<
    Array<number | null>
  >([]);
  const [myNumbersStore, setMyNumbersStore] = useState<MyNumbersStore>({});
  /** 나의번호 모달이 열린 게임 인덱스 — null이면 닫힘 */
  const [myNumberModalGameIndex, setMyNumberModalGameIndex] = useState<
    number | null
  >(null);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [isScriptStuck, setIsScriptStuck] = useState(false);

  const pastDrawRecords = useMemo(
    () => getRecentDrawsFromFile(drawsFile, PAST_DRAW_COUNT),
    [drawsFile]
  );

  useEffect(() => {
    setDrawSets(generateLottoDrawSets());
    setPendingReplaceByGame(Array.from({ length: LOTTO_GAME_COUNT }, () => null));
  }, []);

  useEffect(() => {
    try {
      setMyNumbersStore(readMyNumbersFromStorage(window.localStorage));
    } catch {
      setMyNumbersStore({});
    }
  }, []);

  const nextWeekCooccurrenceBySet = useMemo(
    () =>
      getCooccurrenceSummariesForDrawSets(
        drawSets.slice(0, LOTTO_GAME_COUNT),
        drawsFile.draws
      ),
    [drawSets, drawsFile.draws]
  );

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

  const clearPendingForGame = useCallback((gameIndex: number) => {
    setPendingReplaceByGame((prev) => {
      const next = [...prev];
      while (next.length < LOTTO_GAME_COUNT) {
        next.push(null);
      }
      next[gameIndex] = null;
      return next;
    });
  }, []);

  const handleGenerateAll = useCallback(() => {
    setDrawSets(generateLottoDrawSets());
    setPendingReplaceByGame(Array.from({ length: LOTTO_GAME_COUNT }, () => null));
  }, []);

  const handleAutoSelectGame = useCallback(
    (gameIndex: number) => {
      setDrawSets((prevSets) =>
        prevSets.map((draw, index) =>
          index === gameIndex ? generateLottoDraw() : draw
        )
      );
      clearPendingForGame(gameIndex);
    },
    [clearPendingForGame]
  );

  const handleResetGame = useCallback(
    (gameIndex: number) => {
      setDrawSets((prevSets) =>
        prevSets.map((draw, index) =>
          index === gameIndex ? EMPTY_LOTTO_DRAW : draw
        )
      );
      clearPendingForGame(gameIndex);
    },
    [clearPendingForGame]
  );

  const handleNumberTap = useCallback(
    (gameIndex: number, tappedNumber: number) => {
      const currentDraw = drawSets[gameIndex];
      if (!currentDraw) {
        return;
      }

      const pending = pendingReplaceByGame[gameIndex] ?? null;
      const result = applySlipNumberTap(
        currentDraw.mainNumbers,
        pending,
        tappedNumber
      );

      setDrawSets((prevSets) =>
        prevSets.map((draw, index) =>
          index === gameIndex
            ? { ...draw, mainNumbers: result.mainNumbers }
            : draw
        )
      );

      setPendingReplaceByGame((prevPending) => {
        const nextPending = [...prevPending];
        while (nextPending.length < LOTTO_GAME_COUNT) {
          nextPending.push(null);
        }
        nextPending[gameIndex] = result.pendingReplaceNumber;
        return nextPending;
      });
    },
    [drawSets, pendingReplaceByGame]
  );

  const persistMyNumbersStore = useCallback((nextStore: MyNumbersStore) => {
    setMyNumbersStore(nextStore);
    try {
      writeMyNumbersToStorage(window.localStorage, nextStore);
    } catch {
      // 사파리 시크릿 등 — 메모리 상태만 유지
    }
  }, []);

  const closeMyNumberModal = useCallback(() => {
    setMyNumberModalGameIndex(null);
  }, []);

  const openMyNumberModal = useCallback((gameIndex: number) => {
    setMyNumberModalGameIndex(gameIndex);
  }, []);

  const handleSaveMyNumber = useCallback(() => {
    if (myNumberModalGameIndex === null) {
      return;
    }

    const currentDraw = drawSets[myNumberModalGameIndex];
    // 6개 미만(빈 칸 포함)이면 저장하지 않고 닫기 — alert 없음
    if (!currentDraw || !canRegisterMyNumbers(currentDraw)) {
      closeMyNumberModal();
      return;
    }

    persistMyNumbersStore(
      saveMyNumberToStore(myNumbersStore, myNumberModalGameIndex, currentDraw)
    );
    closeMyNumberModal();
  }, [
    myNumberModalGameIndex,
    drawSets,
    myNumbersStore,
    persistMyNumbersStore,
    closeMyNumberModal,
  ]);

  /** 수정하기 — 6개면 덮어쓰고, 비어 있으면 저장본 삭제 */
  const handleUpdateMyNumber = useCallback(() => {
    if (myNumberModalGameIndex === null) {
      return;
    }

    const currentDraw = drawSets[myNumberModalGameIndex];
    if (!currentDraw || !canRegisterMyNumbers(currentDraw)) {
      persistMyNumbersStore(
        removeMyNumberFromStore(myNumbersStore, myNumberModalGameIndex)
      );
      closeMyNumberModal();
      return;
    }

    persistMyNumbersStore(
      saveMyNumberToStore(myNumbersStore, myNumberModalGameIndex, currentDraw)
    );
    closeMyNumberModal();
  }, [
    myNumberModalGameIndex,
    drawSets,
    myNumbersStore,
    persistMyNumbersStore,
    closeMyNumberModal,
  ]);

  const handleLoadMyNumberFromModal = useCallback(() => {
    if (myNumberModalGameIndex === null) {
      return;
    }

    const saved = myNumbersStore[myNumberModalGameIndex];
    if (!saved) {
      return;
    }

    setDrawSets((prevSets) =>
      prevSets.map((draw, index) =>
        index === myNumberModalGameIndex
          ? {
              mainNumbers: [...saved.mainNumbers],
              bonusNumber: saved.bonusNumber,
            }
          : draw
      )
    );
    clearPendingForGame(myNumberModalGameIndex);
    closeMyNumberModal();
  }, [
    myNumberModalGameIndex,
    myNumbersStore,
    clearPendingForGame,
    closeMyNumberModal,
  ]);

  const modalSavedDraw =
    myNumberModalGameIndex !== null &&
    hasSavedMyNumber(myNumbersStore, myNumberModalGameIndex)
      ? (myNumbersStore[myNumberModalGameIndex] ?? null)
      : null;

  const modalCurrentDraw =
    myNumberModalGameIndex !== null
      ? (drawSets[myNumberModalGameIndex] ?? EMPTY_LOTTO_DRAW)
      : EMPTY_LOTTO_DRAW;

  const modalGameLabel =
    myNumberModalGameIndex !== null
      ? LOTTO_GAME_LABELS[myNumberModalGameIndex]
      : "A";

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
          <section className="lotto-slip-section" aria-label="다음 주 번호 선택">
            <h2 className="lotto-slip-section__title lotto-slip-section__title--guide">
              {NEXT_WEEK_GUIDE_TEXT}
            </h2>
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
                      pendingReplaceNumber={
                        pendingReplaceByGame[gameIndex] ?? null
                      }
                      compact={useCompactLayout}
                      onReset={() => handleResetGame(gameIndex)}
                      onAutoSelect={() => handleAutoSelectGame(gameIndex)}
                      onNumberTap={(number) =>
                        handleNumberTap(gameIndex, number)
                      }
                      onRegisterMyNumber={() => openMyNumberModal(gameIndex)}
                    />
                  </div>
                );
              })}
            </div>
            <GenerateButton onClick={handleGenerateAll} />
          </section>

          <section
            className="lotto-slip-section lotto-slip-section--cooccurrence"
            aria-label="다음 주 동시 출현"
          >
            <div className="lotto-slip-board">
              {nextWeekCooccurrenceBySet.map((summaries, gameIndex) => {
                const gameLabel = LOTTO_GAME_LABELS[gameIndex];
                const isExtraGame = gameIndex > 0;

                return (
                  <div
                    key={`cooccurrence-${gameLabel}`}
                    className={`lotto-slip-column ${
                      isExtraGame ? "lotto-slip-column--extra" : ""
                    }`}
                  >
                    {summaries.length > 0 ? (
                      <CooccurrenceSummary
                        summaries={summaries}
                        title={`동시 출현 · ${gameLabel}`}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

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

      <MyNumberModal
        open={myNumberModalGameIndex !== null}
        gameLabel={modalGameLabel}
        savedDraw={modalSavedDraw}
        currentDraw={modalCurrentDraw}
        onClose={closeMyNumberModal}
        onSave={handleSaveMyNumber}
        onLoad={handleLoadMyNumberFromModal}
        onUpdate={handleUpdateMyNumber}
      />
    </main>
  );
}
