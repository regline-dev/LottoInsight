import { describe, expect, it } from "vitest";
import { applySlipNumberTap } from "@/lib/lotto/slipSelect";

describe("applySlipNumberTap", () => {
  describe("6개 미만", () => {
    it("빈 칸을 누르면 번호 추가", () => {
      const result = applySlipNumberTap([1, 2, 3], null, 10);
      expect(result.mainNumbers).toEqual([1, 2, 3, 10]);
      expect(result.pendingReplaceNumber).toBeNull();
    });

    it("선택된 칸을 누르면 해제", () => {
      const result = applySlipNumberTap([1, 2, 3], null, 2);
      expect(result.mainNumbers).toEqual([1, 3]);
      expect(result.pendingReplaceNumber).toBeNull();
    });

    it("추가 후 오름차순 정렬", () => {
      const result = applySlipNumberTap([5, 20], null, 3);
      expect(result.mainNumbers).toEqual([3, 5, 20]);
    });
  });

  describe("이미 6개", () => {
    const full = [1, 2, 3, 4, 5, 6];

    it("빈 칸을 먼저 누르면 무시", () => {
      const result = applySlipNumberTap(full, null, 45);
      expect(result.mainNumbers).toEqual(full);
      expect(result.pendingReplaceNumber).toBeNull();
    });

    it("선택된 칸을 누르면 교체 대기(하늘색)", () => {
      const result = applySlipNumberTap(full, null, 3);
      expect(result.mainNumbers).toEqual(full);
      expect(result.pendingReplaceNumber).toBe(3);
    });

    it("교체 대기 중 같은 칸을 다시 누르면 취소", () => {
      const result = applySlipNumberTap(full, 3, 3);
      expect(result.mainNumbers).toEqual(full);
      expect(result.pendingReplaceNumber).toBeNull();
    });

    it("교체 대기 중 다른 선택 칸을 누르면 대기 대상만 변경", () => {
      const result = applySlipNumberTap(full, 3, 5);
      expect(result.mainNumbers).toEqual(full);
      expect(result.pendingReplaceNumber).toBe(5);
    });

    it("교체 대기 중 빈 칸을 누르면 교체", () => {
      const result = applySlipNumberTap(full, 3, 45);
      expect(result.mainNumbers).toEqual([1, 2, 4, 5, 6, 45]);
      expect(result.pendingReplaceNumber).toBeNull();
    });
  });
});
