import Header from "@/app/components/layout/Header/Header";
import CardTile from "@/app/components/Card/CardTile";

import { fetchCardsByExpansion } from "@/db/mcc_cards/mcc_cards.repo";
import { fetchUserCollection } from "@/db/mcc_user_collection/mcc_user_collection.repo";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Sets({
  params,
}: {
  params: Promise<{ lang: string; setid: string }>;
}) {
  const { lang, setid } = await params;

  const cards = await fetchCardsByExpansion(lang, setid);

  
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.id) {
      redirect("/login");
    }

  let collectionMap: Record<string, number> = {};

  if (session?.user?.id) {
    const collection = await fetchUserCollection(session.user.id);

    collectionMap = Object.fromEntries(
      collection.map((card) => [
        card.variant_id,
        card.quantity,
      ])
    );
  }

  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {cards ? (
            cards.map((card) => (
              <CardTile
                key={card.id + card.variant_id}
                card={card}
                quantity={collectionMap[card.variant_id] ?? 0}
              />
            ))
          ) : (
            <p>No cards found for this language and set.</p>
          )}
        </div>
      </div>
    </div>
  );
}