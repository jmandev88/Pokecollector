import Header from "@/app/components/layout/Header/Header";
import { fetchCardsByExpansion } from "@/db/mcc_cards/mcc_cards.repo";
import CardTile from "@/app/components/Card/CardTile";

export default async function Sets({params,}: {params: Promise<{ lang: string, setid: string }>}) {
  const { lang, setid } = await params
  const cards = await fetchCardsByExpansion(lang, setid);
  console.log(cards)
  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-8">
            {cards ? cards.map((card) => (
              <CardTile key={card.id} card={card} />
            )) : (
              <p>No cards found for this language and set.</p>
            )}
          </div>
      </div>
    </div>
  );
}