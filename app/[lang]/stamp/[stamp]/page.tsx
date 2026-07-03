import Header from "@/app/components/layout/Header/Header";
import CardTile from "@/app/components/Card/CardTile";
import { fetchCardsByStamp } from "@/db/mcc_cards/mcc_cards.repo";

export default async function Stamp({
  params,
}: {
  params: Promise<{ lang: string; stamp: string }>;
}) {
  const { lang, stamp } = await params;
  const cards = await fetchCardsByStamp(lang, stamp);

  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {cards ? (
            cards.map((card) => (
              <CardTile key={card.id} card={card} showCollectionControls={false} />
            ))
          ) : (
            <p>No cards found for this language and stamp.</p>
          )}
        </div>
      </div>
    </div>
  );
}
