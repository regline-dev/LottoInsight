import { describe, expect, it } from "vitest";
import { LOTTO_PICK_COUNT } from "@/lib/constants";
import type { LottoDraw } from "@/lib/lotto/types";
import {
  MY_NUMBERS_STORAGE_KEY,
  canRegisterMyNumbers,
  hasSavedMyNumber,
  parseMyNumbersStore,
  readMyNumbersFromStorage,
  removeMyNumberFromStore,
  saveMyNumberToStore,
  serializeMyNumbersStore,
  type MyNumbersStore,
} from "@/lib/lotto/myNumbers";

const sampleDraw: LottoDraw = {
  mainNumbers: [1, 2, 3, 4, 5, 6],
  bonusNumber: 7,
};

describe("canRegisterMyNumbers", () => {
  it("본번호 1~6개면 등록 가능", () => {
    expect(canRegisterMyNumbers(sampleDraw)).toBe(true);
    expect(
      canRegisterMyNumbers({
        mainNumbers: [1, 2, 3, 4, 5],
        bonusNumber: 0,
      })
    ).toBe(true);
    expect(
      canRegisterMyNumbers({ mainNumbers: [1, 2, 3], bonusNumber: 0 })
    ).toBe(true);
    expect(
      canRegisterMyNumbers({ mainNumbers: [], bonusNumber: 0 })
    ).toBe(false);
  });
});

describe("parseMyNumbersStore / serializeMyNumbersStore", () => {
  it("빈 문자열·잘못된 JSON은 빈 스토어", () => {
    expect(parseMyNumbersStore("")).toEqual({});
    expect(parseMyNumbersStore("{")).toEqual({});
  });

  it("유효한 저장본만 남김", () => {
    const raw = JSON.stringify({
      "0": sampleDraw,
      "1": { mainNumbers: [], bonusNumber: 2 },
      "2": { mainNumbers: [1, 2, 3, 4, 5], bonusNumber: 0 },
    });
    const store = parseMyNumbersStore(raw);
    expect(store[0]).toEqual(sampleDraw);
    expect(store[1]).toBeUndefined();
    expect(store[2]?.mainNumbers).toEqual([1, 2, 3, 4, 5]);
  });

  it("직렬화 후 파싱하면 동일", () => {
    const store: MyNumbersStore = { 0: sampleDraw };
    expect(parseMyNumbersStore(serializeMyNumbersStore(store))).toEqual(store);
  });
});

describe("saveMyNumberToStore / hasSavedMyNumber", () => {
  it("게임 인덱스에 저장하고 표시 가능", () => {
    const next = saveMyNumberToStore({}, 0, sampleDraw);
    expect(hasSavedMyNumber(next, 0)).toBe(true);
    expect(hasSavedMyNumber(next, 1)).toBe(false);
    expect(next[0]?.mainNumbers).toHaveLength(LOTTO_PICK_COUNT);
  });

  it("이미 있으면 덮어씀", () => {
    const first = saveMyNumberToStore({}, 2, sampleDraw);
    const overwritten = saveMyNumberToStore(first, 2, {
      mainNumbers: [10, 11, 12, 13, 14, 15],
      bonusNumber: 16,
    });
    expect(overwritten[2]?.mainNumbers).toEqual([10, 11, 12, 13, 14, 15]);
  });
});

describe("removeMyNumberFromStore", () => {
  it("해당 게임 저장본 삭제", () => {
    const saved = saveMyNumberToStore({}, 0, sampleDraw);
    const cleared = removeMyNumberFromStore(saved, 0);
    expect(hasSavedMyNumber(cleared, 0)).toBe(false);
    expect(cleared[0]).toBeUndefined();
  });
});

describe("readMyNumbersFromStorage", () => {
  it("Storage-like에서 키로 읽음", () => {
    const memory = new Map<string, string>();
    memory.set(
      MY_NUMBERS_STORAGE_KEY,
      serializeMyNumbersStore({ 0: sampleDraw })
    );

    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };

    expect(readMyNumbersFromStorage(storage)[0]).toEqual(sampleDraw);
  });
});
