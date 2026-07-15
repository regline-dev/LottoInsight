import LottoApp from "@/components/LottoApp";
import lottoDrawsFile from "@/data/lotto-draws.json";
import type { LottoDrawsFile } from "@/lib/lotto/sync";

export default function Home() {
  return <LottoApp drawsFile={lottoDrawsFile as LottoDrawsFile} />;
}
