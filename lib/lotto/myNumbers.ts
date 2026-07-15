import { LOTTO_PICK_COUNT } from "@/lib/constants";
import type { LottoDraw } from "@/lib/lotto/types";

/** localStorage 키 */
export const MY_NUMBERS_STORAGE_KEY = "lottoinsight:my-numbers";

/** 게임 인덱스(A=0 …) → 저장 번호 */
export type MyNumbersStore = Record<number, LottoDraw>;

type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

function isValidStoredDraw(value: unknown): value is LottoDraw {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draw = value as LottoDraw;
  if (!Array.isArray(draw.mainNumbers)) {
    return false;
  }
  // 1~6개 저장 허용 (빈 저장은 무효)
  if (
    draw.mainNumbers.length < 1 ||
    draw.mainNumbers.length > LOTTO_PICK_COUNT
  ) {
    return false;
  }
  if (!draw.mainNumbers.every((n) => Number.isInteger(n))) {
    return false;
  }
  if (typeof draw.bonusNumber !== "number" || !Number.isInteger(draw.bonusNumber)) {
    return false;
  }
  return true;
}

/** 등록 가능 — 본번호 1개 이상(최대 6) */
export function canRegisterMyNumbers(draw: LottoDraw): boolean {
  return (
    draw.mainNumbers.length >= 1 &&
    draw.mainNumbers.length <= LOTTO_PICK_COUNT
  );
}

/** 해당 게임에 저장본 있는지 */
export function hasSavedMyNumber(
  store: MyNumbersStore,
  gameIndex: number
): boolean {
  return isValidStoredDraw(store[gameIndex]);
}

/** JSON 문자열 → 스토어 (깨진 항목 제외) */
export function parseMyNumbersStore(raw: string): MyNumbersStore {
  if (!raw.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const store: MyNumbersStore = {};
    for (const [key, value] of Object.entries(parsed)) {
      const gameIndex = Number(key);
      if (!Number.isInteger(gameIndex) || gameIndex < 0) {
        continue;
      }
      if (isValidStoredDraw(value)) {
        store[gameIndex] = {
          mainNumbers: [...value.mainNumbers].sort((a, b) => a - b),
          bonusNumber: value.bonusNumber,
        };
      }
    }
    return store;
  } catch {
    return {};
  }
}

export function serializeMyNumbersStore(store: MyNumbersStore): string {
  return JSON.stringify(store);
}

/** 스토어에 한 게임 저장(덮어쓰기) */
export function saveMyNumberToStore(
  store: MyNumbersStore,
  gameIndex: number,
  draw: LottoDraw
): MyNumbersStore {
  if (!canRegisterMyNumbers(draw)) {
    return store;
  }

  return {
    ...store,
    [gameIndex]: {
      mainNumbers: [...draw.mainNumbers].sort((a, b) => a - b),
      bonusNumber: draw.bonusNumber,
    },
  };
}

/** 해당 게임 저장본 삭제 */
export function removeMyNumberFromStore(
  store: MyNumbersStore,
  gameIndex: number
): MyNumbersStore {
  if (!(gameIndex in store)) {
    return store;
  }

  const nextStore: MyNumbersStore = { ...store };
  delete nextStore[gameIndex];
  return nextStore;
}

export function readMyNumbersFromStorage(
  storage: StorageLike
): MyNumbersStore {
  try {
    return parseMyNumbersStore(storage.getItem(MY_NUMBERS_STORAGE_KEY) ?? "");
  } catch {
    return {};
  }
}

export function writeMyNumbersToStorage(
  storage: StorageLike,
  store: MyNumbersStore
): void {
  storage.setItem(MY_NUMBERS_STORAGE_KEY, serializeMyNumbersStore(store));
}
