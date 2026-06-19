import Header from "@/app/components/layout/Header/Header";
import { fetchCardCount, fetchCardCountByRarity, fetchCardCountByType, fetchCardCountByPokedexNumber } from "@/db/mcc_cards/mcc_cards.repo";
import { fetchSetCount } from "@/db/mcc_sets/mcc_sets.repo";
import { fetchSealedCount } from "@/db/mcc_sealed/mcc_sealed.repo";
import { fetchCardVariantsCount } from "@/db/mcc_card_variants/mcc_card_variants.repo";

import formatCount from "../utils/formatCount";
import Link from "next/dist/client/link";

export default async function Sets({params,}: {params: Promise<{ lang: string }>}) {
  const { lang } = await params
  const cardCount = await fetchCardCount(lang);
  const setCount = await fetchSetCount(lang);
  const sealedCount = await fetchSealedCount(lang);
  const cardVariantsCount = await fetchCardVariantsCount(lang);
  const cardCountByRarity = await fetchCardCountByRarity(lang);
  const cardCountByType = await fetchCardCountByType(lang);
  const cardCountByPokedexNumber = await fetchCardCountByPokedexNumber(lang);

  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 text-center mb8 pb-8 border-b-1 border-white">
          <div><div><span className="text-7xl font-bold">{formatCount(cardCount)}</span></div><div><span className="opacity-50">Cards</span></div></div>
          <div><div><span className="text-7xl font-bold">{formatCount(cardVariantsCount)}</span></div><div><span className="opacity-50">Card Variants</span></div></div>
          <div><div><span className="text-7xl font-bold">{formatCount(setCount)}</span></div><div><span className="opacity-50">Sets</span></div></div>
          <div><div><span className="text-7xl font-bold">{formatCount(sealedCount)}</span></div><div><span className="opacity-50">Sealed Products</span></div></div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 text-center mt-8">
          <div className="max-h-64 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {cardCountByRarity.map((rarity) => (
              <Link href={`/${lang}/rarity/${rarity.rarity}`} key={rarity.rarity} className="flex justify-between items-center">
                <span className="text-lg font-semibold">{rarity.rarity}</span>
                <span className="text-sm">{formatCount(rarity.card_count)} cards, {formatCount(rarity.collectible_count)} collectibles</span>
              </Link>
            ))}
          </div>
          <div className="max-h-64 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {cardCountByType.map((type) => (
              <Link href={`/${lang}/type/${type.card_type}`} key={type.card_type} className="flex justify-between items-center">
                <span className="text-lg font-semibold">{type.card_type}</span>
                <span className="text-sm">{formatCount(type.card_count)} cards, {formatCount(type.collectible_count)} collectibles</span>
              </Link>
            ))}
          </div>
          <div className="max-h-64 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {cardCountByPokedexNumber.map((pokedex) => (
              <Link href={`/${lang}/pokedex/${pokedex.pokedex_number}`} key={pokedex.pokedex_number} className="flex justify-between items-center">
                <span className="text-lg font-semibold">{pokedex.pokedex_number}</span>
                <span className="text-sm">{formatCount(pokedex.card_count)} cards, {formatCount(pokedex.collectible_count)} collectibles</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
