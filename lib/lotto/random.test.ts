import { describe, expect, it } from "vitest";
import {
  generateLottoDraw,
  generateLottoDrawSets,
  generateLottoNumbers,
  isValidLottoNumber,
} from "@/lib/lotto/random";

describe("isValidLottoNumber", () => {
  it("1~45 정수만 유효", () => {
    expect(isValidLottoNumber(1)).toBe(true);
    expect(isValidLottoNumber(45)).toBe(true);
    expect(isValidLottoNumber(0)).toBe(false);
    expect(isValidLottoNumber(46)).toBe(false);
    expect(isValidLottoNumber(1.5)).toBe(false);
  });
});

describe("generateLottoNumbers", () => {
  it("6개·중복 없음·1~45·오름차순", () => {
    const numbers = generateLottoNumbers();
    expect(numbers).toHaveLength(6);
    expect(new Set(numbers).size).toBe(6);
    numbers.forEach((n) => expect(isValidLottoNumber(n)).toBe(true));
    expect([...numbers].sort((a, b) => a - b)).toEqual(numbers);
  });
});

describe("generateLottoDraw", () => {
  it("본번호 6 + 보너스(본번호와 겹치지 않음)", () => {
    const draw = generateLottoDraw();
    expect(draw.mainNumbers).toHaveLength(6);
    expect(isValidLottoNumber(draw.bonusNumber)).toBe(true);
    expect(draw.mainNumbers.includes(draw.bonusNumber)).toBe(false);
  });
});

describe("generateLottoDrawSets", () => {
  it("게임 수만큼 세트 생성", () => {
    expect(generateLottoDrawSets(5)).toHaveLength(5);
  });

  it("게임 수 0 이하면 에러", () => {
    expect(() => generateLottoDrawSets(0)).toThrow();
  });
});
