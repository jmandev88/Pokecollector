import VaultCardCollectionList from "@/app/components/Vault/VaultCardCollectionList";
import VaultCardListShell from "@/app/components/Vault/VaultCardListShell";
import { isAdminUser } from "@/app/config/admin";
import { fetchCardsByArtist } from "@/db/mcc_cards/mcc_cards.repo";
import { fetchUserCollection } from "@/db/mcc_user_collection/mcc_user_collection.repo";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Artist({
  params,
}: {
  params: Promise<{ lang: string; artist: string }>;
}) {
  const { lang, artist } = await params;
  const artistName = decodeURIComponent(artist);
  const cards = (await fetchCardsByArtist(lang, artist)) ?? [];
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
      title={artistName}
      subtitle="Cards filtered by illustrator or artist."
      count={cards.length}
      showAdminNav={showAdminNav}
    >
      <VaultCardCollectionList
        lang={lang}
        cards={cards}
        collectionMap={collectionMap}
        showCollectionControls={!!session?.user?.id}
        emptyMessage="No cards found for this language and artist."
      />
    </VaultCardListShell>
  );
}
