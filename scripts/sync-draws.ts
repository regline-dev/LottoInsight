/**
 * 동행복권 1~최신 회차 → data/lotto-draws.json
 * DB 없음. 로컬에서: npm run sync:draws
 */
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fetchLatestDrawRound } from "../lib/lotto/api";
import {
  buildDrawsFile,
  fetchDrawsInRange,
  getLastStoredRound,
  getSyncRange,
  mergeDrawRecords,
  type LottoDrawsFile,
} from "../lib/lotto/sync";

const OUTPUT_PATH = path.join(process.cwd(), "data", "lotto-draws.json");

async function readExistingFile(): Promise<LottoDrawsFile | null> {
  try {
    const raw = await readFile(OUTPUT_PATH, "utf-8");
    return JSON.parse(raw) as LottoDrawsFile;
  } catch {
    return null;
  }
}

async function main() {
  console.log("동행복권 회차 JSON 동기화 시작…");

  const existing = await readExistingFile();
  const lastStored = getLastStoredRound(existing);
  const latestRound = await fetchLatestDrawRound();

  console.log(`최신 회차: ${latestRound} / 저장됨: ${lastStored}`);

  const range = getSyncRange(lastStored, latestRound);

  if (!range && existing) {
    console.log("이미 최신입니다.");
    return;
  }

  const fromRound = range?.fromRound ?? 1;
  const toRound = range?.toRound ?? latestRound;

  console.log(`fetch ${fromRound} ~ ${toRound} …`);

  const incoming = await fetchDrawsInRange(fromRound, toRound, {
    delayMs: 150,
    onProgress: (done, total) => {
      if (done % 50 === 0 || done === total) {
        console.log(`  ${done}/${total}`);
      }
    },
  });

  const merged = mergeDrawRecords(existing?.draws ?? [], incoming);
  const file = buildDrawsFile(merged);

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(file, null, 2)}\n`, "utf-8");

  console.log(`완료: ${OUTPUT_PATH} (${file.count}회)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
