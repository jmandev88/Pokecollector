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
import { fetchCardsByType } from "@/db/mcc_cards/mcc_cards.repo";
import { fetchUserCollection } from "@/db/mcc_user_collection/mcc_user_collection.repo";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Type({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; type: string }>;
  searchParams: Promise<CardListingSearchParams>;
}) {
  const { lang, type } = await params;
  const cards = (await fetchCardsByType(lang, type)) ?? [];
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
      title={`${decodeURIComponent(type)} Type`}
      subtitle="Cards filtered by type."
      count={filteredCards.length}
      showAdminNav={showAdminNav}
    >
      <VaultCardListingControls
        basePath={`/${lang}/type/${type}`}
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
        emptyMessage="No cards found for this language and type."
      />
    </VaultCardListShell>
  );
}
