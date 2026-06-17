import Header from "@/app/components/layout/Header/Header";
import { fetchCardCount } from "@/db/mcc_cards/mcc_cards.repo";
import { fetchSetCount } from "@/db/mcc_sets/mcc_sets.repo";
import { fetchSealedCount } from "@/db/mcc_sealed/mcc_sealed.repo";
import { fetchCardVariantsCount } from "@/db/mcc_card_variants/mcc_card_variants.repo";

import formatCount from "./utils/formatCount";

export default async function Sets({params,}: {params: Promise<{ lang: string }>}) {
  const lang = "en"
  const cardCount = await fetchCardCount(lang);
  const setCount = await fetchSetCount(lang);
  const sealedCount = await fetchSealedCount(lang);
  const cardVariantsCount = await fetchCardVariantsCount(lang);
  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 text-center">
          <div><div><span className="text-7xl font-bold">{formatCount(cardCount)}</span></div><div><span className="opacity-50">Cards</span></div></div>
          <div><div><span className="text-7xl font-bold">{formatCount(cardVariantsCount)}</span></div><div><span className="opacity-50">Card Variants</span></div></div>
          <div><div><span className="text-7xl font-bold">{formatCount(setCount)}</span></div><div><span className="opacity-50">Sets</span></div></div>
          <div><div><span className="text-7xl font-bold">{formatCount(sealedCount)}</span></div><div><span className="opacity-50">Sealed Products</span></div></div>
        </div>
      </div>
    </div>
  );
}
