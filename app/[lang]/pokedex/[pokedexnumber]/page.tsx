import VaultCardCollectionList from "@/app/components/Vault/VaultCardCollectionList";
import VaultCardListShell from "@/app/components/Vault/VaultCardListShell";
import { isAdminUser } from "@/app/config/admin";
import { getPokemonName } from "@/app/utils/getPokemonName";
import { fetchCardsByPokedexNumber } from "@/db/mcc_cards/mcc_cards.repo";
import { fetchUserCollection } from "@/db/mcc_user_collection/mcc_user_collection.repo";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Pokedex({
  params,
}: {
  params: Promise<{ lang: string; pokedexnumber: number }>;
}) {
  const { lang, pokedexnumber } = await params;
  const pokedexNumber = Number(pokedexnumber);
  const cards = (await fetchCardsByPokedexNumber(lang, pokedexNumber)) ?? [];
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
      title={`#${pokedexNumber} ${getPokemonName(pokedexNumber)}`}
      subtitle="Cards filtered by Pokédex number."
      count={cards.length}
      showAdminNav={showAdminNav}
    >
      <VaultCardCollectionList
        cards={cards}
        collectionMap={collectionMap}
        showCollectionControls={!!session?.user?.id}
        emptyMessage="No cards found for this language and Pokédex number."
      />
    </VaultCardListShell>
  );
}
