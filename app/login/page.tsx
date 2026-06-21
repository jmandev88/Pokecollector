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
export default async function Sets({params,}: {params: Promise<{ lang: string }>}) {
  const { lang } = await params
  

  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
          <Header lang={lang} />
    </div>
  );
}
