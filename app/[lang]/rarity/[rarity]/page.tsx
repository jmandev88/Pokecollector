import VaultCardCollectionList from "@/app/components/Vault/VaultCardCollectionList";
import VaultCardListShell from "@/app/components/Vault/VaultCardListShell";
import { ADMIN_USER_ID } from "@/app/config/admin";
import { fetchCardsByRarity } from "@/db/mcc_cards/mcc_cards.repo";
import { fetchUserCollection } from "@/db/mcc_user_collection/mcc_user_collection.repo";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Rarity({
  params,
}: {
  params: Promise<{ lang: string; rarity: string }>;
}) {
  const { lang, rarity } = await params;
  const cards = (await fetchCardsByRarity(lang, rarity)) ?? [];
  const session = await getServerSession(authOptions);
  const showAdminNav = session?.user?.id === ADMIN_USER_ID;
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
      count={cards.length}
      showAdminNav={showAdminNav}
    >
      <VaultCardCollectionList
        cards={cards}
        collectionMap={collectionMap}
        showCollectionControls={!!session?.user?.id}
        emptyMessage="No cards found for this language and rarity."
      />
    </VaultCardListShell>
  );
}
