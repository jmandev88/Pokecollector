import Header from "@/app/components/layout/Header/Header";
import { fetchCards } from "@/db/mcc_cards/mcc_cards.repo";
import Image from "next/image";
import Link from "next/link";

export default async function Sets({params,}: {params: Promise<{ lang: string, setid: string }>}) {
  const { lang, setid } = await params
  const cards = await fetchCards(lang, setid);
  
  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-8">
            {cards ? cards.map((card) => (
              <div key={card.id} className="">
                    <Image
                      className="w-full"
                      src={
                        card.images?.find((img: any) => img.type === "front")?.medium || "/placeholder_card.png"
                      }
                      alt={card.name}
                      width={200}
                      height={200}
                    />
              </div>
            )) : (
              <p>No cards found for this language and set.</p>
            )}
          </div>
      </div>
    </div>
  );
}
