import Header from "@/app/components/layout/Header/Header";
import { fetchCardsByPokedexNumber } from "@/db/mcc_cards/mcc_cards.repo";
import CardTile from "@/app/components/Card/CardTile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Pokedex({params,}: {params: Promise<{ lang: string, pokedexnumber: number }>}) {
  const { lang, pokedexnumber } = await params
  const cards = await fetchCardsByPokedexNumber(lang, pokedexnumber);
      const session = await getServerSession(authOptions);
    
      if (!session?.user?.id) {
        redirect("/login");
      }
  
  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-8">
            {cards ? cards.map((card) => (
              <CardTile key={card.id} card={card} />
            )) : (
              <p>No cards found for this language and rarity.</p>
            )}
          </div>
      </div>
    </div>
  );
}
