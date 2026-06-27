import Header from "@/app/components/layout/Header/Header";
import { fetchCardCount, fetchCardCountByRarity, fetchCardCountByType, fetchCardCountByPokedexNumber } from "@/db/mcc_cards/mcc_cards.repo";
import { fetchSetCount } from "@/db/mcc_sets/mcc_sets.repo";
import { fetchSealedCount } from "@/db/mcc_sealed/mcc_sealed.repo";
import { fetchCardVariantsCount } from "@/db/mcc_card_variants/mcc_card_variants.repo";
import { getPokemonName } from "../utils/getPokemonName";
import Image from "next/image";
import formatCount from "../utils/formatCount";
import Link from "next/dist/client/link";
import { getFullUserCollection, getCollectionSetStats } from "@/app/actions/collections.actions";
import { groupCollectionBySet } from "../utils/groupCollectionBySet";
import { mergeCollectionWithStats } from "../utils/mergeCollectionWithStats";
import { Key } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatVariantName } from "../utils/formatVariantName";
import { groupTradesBySet } from "../utils/groupTradesBySet";
import { fetchTradeCandidates } from "@/db/mcc_user_collection/mcc_user_collection.repo";
import {
  fetchSealedBoosterCollectionStats,
  fetchLatestOwnedSealedBoosters,
  fetchSealedBoosterTradeCandidates,
} from "@/db/mcc_user_sealed_collection/mcc_user_sealed_collection.repo";

type SealedBoosterStats = {
  booster_pack_count: number;
  owned_booster_pack_count: number;
  quantity_count: number;
  completion_percent: string | number | null;
};

type SealedBoosterProduct = {
  sealed_id: string;
  sealed_name: string;
  images?: {
    type: string;
    small?: string;
    medium?: string;
    large?: string;
  }[];
  quantity: number;
};

type SealedBoosterTradeCandidate = SealedBoosterProduct & {
  owner_id: string;
  owner_name: string | null;
};

type OwnedSealedBooster = SealedBoosterProduct & {
  updated_at: string;
};

export default async function Sets({params,}: {params: Promise<{ lang: string }>}) {
  const { lang } = await params

  const session = await getServerSession(authOptions);


  const cardCount = await fetchCardCount(lang);
  const setCount = await fetchSetCount(lang);
  const sealedCount = await fetchSealedCount(lang);
  const cardVariantsCount = await fetchCardVariantsCount(lang);
  const cardCountByRarity = await fetchCardCountByRarity(lang);
  const cardCountByType = await fetchCardCountByType(lang);
  const cardCountByPokedexNumber = await fetchCardCountByPokedexNumber(lang);

  let setsWithStats: any[] = [];
  let sealedBoosterStats: SealedBoosterStats | null = null;
  let sealedBoosterTrades: SealedBoosterTradeCandidate[] = [];
  let latestOwnedSealedBoosters: OwnedSealedBooster[] = [];

  if (session?.user?.id) {
    const collection = await getFullUserCollection();
    const collectionStats = await getCollectionSetStats();
    sealedBoosterStats = await fetchSealedBoosterCollectionStats(
      session.user.id,
      lang
    );
    sealedBoosterTrades = await fetchSealedBoosterTradeCandidates(
      session.user.id,
      lang
    );
    latestOwnedSealedBoosters = await fetchLatestOwnedSealedBoosters(
      session.user.id,
      lang
    );

    const sets = groupCollectionBySet(collection);
    const trades = await fetchTradeCandidates(session?.user?.id);
const tradesBySet = groupTradesBySet(trades);

    setsWithStats = mergeCollectionWithStats(
      sets,
      collectionStats,
      tradesBySet
    );

  }

  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 text-center pt-4 pb-8 border-b-1 border-white/25">
          <div><div><span className="text-7xl font-bold">{formatCount(cardCount)}</span></div><div><span className="opacity-50">Cards</span></div></div>
          <div><div><span className="text-7xl font-bold">{formatCount(cardVariantsCount)}</span></div><div><span className="opacity-50">Card Variants</span></div></div>
          <div><div><span className="text-7xl font-bold">{formatCount(setCount)}</span></div><div><span className="opacity-50">Sets</span></div></div>
          <div><div><span className="text-7xl font-bold">{formatCount(sealedCount)}</span></div><div><span className="opacity-50">Sealed Products</span></div></div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
          <div>
            <div className="text-2xl pb-4 mb-4 border-b border-white/25">Rarity</div>
            <div className="max-h-64 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {cardCountByRarity.map((rarity) => (
                <Link href={`/${lang}/rarity/${rarity.rarity}`} key={rarity.rarity} className="flex justify-between items-center group">
                  <span className="text-lg font-semibold group-hover:underline group-hover:underline-offset-4">{rarity.rarity}</span>
                  <span className="text-sm">{formatCount(rarity.card_count)} cards, {formatCount(rarity.collectible_count)} collectibles</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-2xl pb-4 mb-4 border-b border-white/25">Type</div>
            <div className="max-h-64 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {cardCountByType.map((type) => (
                <Link href={`/${lang}/type/${type.card_type}`} key={type.card_type} className="flex justify-between items-center group">
                  <span className="text-lg font-semibold group-hover:underline group-hover:underline-offset-4">{type.card_type}</span>
                  <span className="text-sm">{formatCount(type.card_count)} cards, {formatCount(type.collectible_count)} collectibles</span>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="text-2xl pb-4 mb-4 border-b border-white/25">Pokedex Number</div>  
            <div className="max-h-64 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
              {cardCountByPokedexNumber.map((pokedex) => (
                <Link href={`/${lang}/pokedex/${pokedex.pokedex_number}`} key={pokedex.pokedex_number} className="flex justify-between items-center group">
                  <span className="text-lg font-semibold group-hover:underline group-hover:underline-offset-4">#{pokedex.pokedex_number} {getPokemonName(pokedex.pokedex_number)}</span>
                  <span className="text-sm">{formatCount(pokedex.card_count)} cards, {formatCount(pokedex.collectible_count)} collectibles</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1">
          {session?.user?.id && setsWithStats ? setsWithStats.map((set) => (
            <div className="flex flex-wrap bg-white/5 rounded-lg p-4 mt-8" key={set.expansion_id}>
              <div className="w-1/2">{set.expansion.name}</div>
              <div className="w-1/2 grid grid-cols-2 gap-4">
              <div>standard: {set.stats.owned_card_count} / {set.stats.card_count} - {set.stats.completion_normal_percent}%</div>
              <div>master: {set.stats.owned_variant_count} / {set.stats.variant_count} - {set.stats.completion_master_percent}%</div></div>
              <div className="flex gap-4 justify-between w-full mt-4 pt-4 border-t border-white/25">
                <div className="w-2/3 grid grid-cols-5 gap-4">
                  {set.cards.slice(0, 5).map((card: { variant_images: any[]; images: any[]; id: Key | null | undefined; name: string; }) => {
                    const image =
                      card.variant_images?.find((img: { type: string; }) => img.type === "front")?.medium ??
                      card.images?.find((img: { type: string; }) => img.type === "front")?.medium ??
                      "/placeholder_card.png"; 
                    return (
                      <div key={card.id}>
                        <div>
                          <Image
                            className="w-full"
                            src={image}
                            alt={card.name}
                            width={200}
                            height={280}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {set.other_cards?.length > 0 && (
                  <div className="w-1/3">

                    <div className="text-sm font-bold">
                      Cards others have
                    </div>

                    <div className="relative mb-2 pb-2 pt-2 mt-2 border-t border-white/25">
                      {set.other_cards.slice(0, 5).map((card: { variant_images: any[]; images: any[]; id: Key | null | undefined; name: string; card_name: string; variant_name: string; owner_name: string; }, index: number) => (
                        <div
                          key={card.id}
                          className="justify-between mb-2 pb-2 border-b border-white/25 flex text-xs"
                        >
                          <div>
                            {card.card_name} - {formatVariantName(card.variant_name)}
                          </div>

                          <div>
                            {card.owner_name}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </div>
            </div>
          )) : false }
        </div>
        {session?.user?.id && sealedBoosterStats && (
          <div className="bg-white/5 rounded-lg p-4 mt-8">
            <div className="flex flex-wrap gap-4 justify-between">
              <div>
                <div className="text-2xl font-bold">Sealed Booster Packs</div>
                <div className="mt-2 text-sm opacity-75">
                  {sealedBoosterStats.owned_booster_pack_count} / {sealedBoosterStats.booster_pack_count} collected - {sealedBoosterStats.completion_percent ?? 0}%
                </div>
              </div>

              <div className="text-right">
                <div className="text-4xl font-bold">
                  {sealedBoosterStats.quantity_count}
                </div>
                <div className="text-sm opacity-75">total owned</div>
              </div>
            </div>

            <div className="mt-4 grid gap-6 border-t border-white/25 pt-4 lg:grid-cols-2">
              <div>
                <div className="text-sm font-bold">
                  Latest booster packs added
                </div>

                <div className="mt-2 max-h-64 overflow-y-auto pr-4">
                  {latestOwnedSealedBoosters.length > 0 ? (
                    latestOwnedSealedBoosters.map((product) => {
                      const image =
                        product.images?.find((sealedImage) => sealedImage.type === "front")?.small ??
                        product.images?.[0]?.small ??
                        product.images?.[0]?.medium ??
                        product.images?.[0]?.large ??
                        "/placeholder_card.png";

                      return (
                        <Link
                          key={product.sealed_id}
                          href={`/${lang}/sealed/${product.sealed_id}`}
                          className="mb-2 flex items-center justify-between gap-3 border-b border-white/25 pb-2 text-xs hover:underline hover:underline-offset-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Image
                              src={image}
                              alt={product.sealed_name}
                              width={48}
                              height={48}
                              className="h-12 w-12 shrink-0 object-contain"
                            />

                            <span className="truncate font-semibold">
                              {product.sealed_name}
                            </span>
                          </div>

                          <div className="shrink-0 text-right opacity-75">
                            qty {product.quantity}
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-xs opacity-75">
                      No booster packs collected yet.
                    </div>
                  )}
                </div>
              </div>

              {sealedBoosterTrades.length > 0 && (
                <div>
                  <div className="text-sm font-bold">
                    Booster packs others have
                  </div>

                  <div className="mt-2 max-h-64 overflow-y-auto pr-4">
                    {sealedBoosterTrades.slice(0, 20).map((product) => {
                      const image =
                        product.images?.find((sealedImage) => sealedImage.type === "front")?.small ??
                        product.images?.[0]?.small ??
                        product.images?.[0]?.medium ??
                        product.images?.[0]?.large ??
                        "/placeholder_card.png";

                      return (
                        <Link
                          key={`${product.owner_id}-${product.sealed_id}`}
                          href={`/${lang}/sealed/${product.sealed_id}`}
                          className="mb-2 flex items-center justify-between gap-3 border-b border-white/25 pb-2 text-xs hover:underline hover:underline-offset-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Image
                              src={image}
                              alt={product.sealed_name}
                              width={48}
                              height={48}
                              className="h-12 w-12 shrink-0 object-contain"
                            />

                            <span className="truncate font-semibold">
                              {product.sealed_name}
                            </span>
                          </div>

                          <div className="shrink-0 text-right">
                            <div>{product.owner_name ?? "Unknown user"}</div>
                            <div className="opacity-75">qty {product.quantity}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
