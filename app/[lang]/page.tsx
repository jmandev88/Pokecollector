import VaultDashboard from "@/app/components/Vault/VaultDashboard";
import { fetchCardCount } from "@/db/mcc_cards/mcc_cards.repo";
import { fetchVaultStockArrivals } from "@/db/mcc_card_stock/mcc_card_stock.repo";
import { fetchCardVariantsCount } from "@/db/mcc_card_variants/mcc_card_variants.repo";
import { fetchSealedCount } from "@/db/mcc_sealed/mcc_sealed.repo";
import { fetchSetCount } from "@/db/mcc_sets/mcc_sets.repo";
import { fetchUserCollection } from "@/db/mcc_user_collection/mcc_user_collection.repo";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await getServerSession(authOptions);

  const [
    cards,
    cardCount,
    cardVariantsCount,
    setCount,
    sealedCount,
    collection,
  ] = await Promise.all([
    fetchVaultStockArrivals(lang),
    fetchCardCount(lang),
    fetchCardVariantsCount(lang),
    fetchSetCount(lang),
    fetchSealedCount(lang),
    session?.user?.id ? fetchUserCollection(session.user.id) : [],
  ]);

  return (
    <VaultDashboard
      lang={lang}
      cards={cards}
      ownedVariants={collection.map((item) => ({
        variantId: item.variant_id,
        quantity: item.quantity,
      }))}
      stats={{
        cardCount,
        cardVariantsCount,
        setCount,
        sealedCount,
      }}
    />
  );
}
