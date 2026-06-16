import Header from "@/app/components/layout/Header/Header";
import { fetchSet } from "@/db/mcc_sets/mcc_sets.repo";
import Image from "next/image";
import Link from "next/link";

export default async function Sets({params,}: {params: Promise<{ lang: string }>}) {
  const { lang } = await params
  const sets = await fetchSet(lang);
  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {sets  ? sets.map((set) => (
              // <div key={set.id} className="bg-gray-700 p-4 border border-gray-500 rounded-md h-64">
              <Link href={`/${lang}/sets/${set.set_id}`} key={set.id} className="bg-gray-700 p-4 border border-gray-500 rounded-md h-64">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold inline-block">{set.en_translation ? set.en_translation : set.set_name}</h2>
                  <div className="text-sm text-white inline-block ml-4">{set.set_code}, {set.set_id}</div>
                  {/* {set.en_translation && <div className="text-sm text-gray-400 inline-block ml-4">({set.set_name})</div>} */}
                </div>
                <div className="mt-4">
                  <Image className="mx-auto h-32 object-contain" src={set.set_logo} alt={set.set_name} width={200} height={200} />
                </div>
              {/* </div> */}
              </Link>
            )) : (
              <p>No sets found for this language.</p>
            )}
          </div>
      </div>
    </div>
  );
}
