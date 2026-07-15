import { describe, expect, it } from "vitest";
import { getRecentDrawsFromFile } from "@/lib/lotto/draws";
import type { LottoDrawsFile } from "@/lib/lotto/sync";

const sampleFile: LottoDrawsFile = {
  updatedAt: "",
  count: 3,
  draws: [
    {
      drwNo: 1,
      drwNoDate: "2002-12-07",
      mainNumbers: [1, 2, 3, 4, 5, 6],
      bonusNumber: 7,
    },
    {
      drwNo: 2,
      drwNoDate: "2002-12-14",
      mainNumbers: [2, 3, 4, 5, 6, 7],
      bonusNumber: 8,
    },
    {
      drwNo: 3,
      drwNoDate: "2002-12-21",
      mainNumbers: [3, 4, 5, 6, 7, 8],
      bonusNumber: 9,
    },
  ],
};

describe("getRecentDrawsFromFile", () => {
  it("최신 → 과거 순", () => {
    const recent = getRecentDrawsFromFile(sampleFile, 2);
    expect(recent.map((d) => d.drwNo)).toEqual([3, 2]);
  });
});
