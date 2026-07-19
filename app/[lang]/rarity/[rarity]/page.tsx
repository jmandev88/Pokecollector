import VaultCardCollectionList from "@/app/components/Vault/VaultCardCollectionList";
import VaultCardListingControls from "@/app/components/Vault/VaultCardListingControls";
import VaultCardListShell from "@/app/components/Vault/VaultCardListShell";
import { isAdminUser } from "@/app/config/admin";
import {
  CARD_LISTING_PAGE_SIZE,
  CardListingSearchParams,
  filterCardsByName,
  paginateCards,
} from "@/app/utils/cardListingPagination";
import { fetchCardsByRarity } from "@/db/mcc_cards/mcc_cards.repo";
import { fetchUserCollection } from "@/db/mcc_user_collection/mcc_user_collection.repo";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Rarity({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; rarity: string }>;
  searchParams: Promise<CardListingSearchParams>;
}) {
  const { lang, rarity } = await params;
  const cards = (await fetchCardsByRarity(lang, rarity)) ?? [];
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q ?? "";
  const page = Math.max(1, Number(resolvedSearchParams.page ?? 1));
  const filteredCards = filterCardsByName(cards, query);
  const paginatedCards = paginateCards(filteredCards, page);
  const session = await getServerSession(authOptions);
  const showAdminNav = isAdminUser(session?.user?.id);
  let collectionMap: Record<string, number> = {};

  if (session?.user?.id) {
    const collection = await fetchUserCollection(session.user.id);

    collectionMap = Object.fromEntries(
      collection.map((card) => [card.variant_id, card.quantity])
    );
  }

  return (
    <VaultCardListShell
      lang={lang}
      title={decodeURIComponent(rarity)}
      subtitle="Cards filtered by rarity."
      count={filteredCards.length}
      showAdminNav={showAdminNav}
    >
      <VaultCardListingControls
        basePath={`/${lang}/rarity/${rarity}`}
        query={query}
        page={page}
        totalCount={filteredCards.length}
        pageSize={CARD_LISTING_PAGE_SIZE}
      />
      <VaultCardCollectionList
        lang={lang}
        cards={paginatedCards}
        progressCards={filteredCards}
        collectionMap={collectionMap}
        showCollectionControls={!!session?.user?.id}
        emptyMessage="No cards found for this language and rarity."
      />
    </VaultCardListShell>
  );
}
