import Header from "@/app/components/layout/Header/Header";
import { fetchSet, fetchSetsGrouped } from "@/db/mcc_sets/mcc_sets.repo";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Sets({params,}: {params: Promise<{ lang: string }>}) {
  const { lang } = await params
  const sets = await fetchSet(lang);
  const groupedSets = await fetchSetsGrouped(lang);
    const session = await getServerSession(authOptions);
  
    if (!session?.user?.id) {
      redirect("/en");
    }

  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
          {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5"> */}
            <div className="space-y-12">
              {Object.entries(groupedSets).map(([series, sets]) => (
                <div key={series}>
                  <h2 className="text-3xl font-bold mb-6">
                    {series}
                  </h2>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {sets.map((set) => (
                      <Link
                        href={`/${lang}/sets/${set.set_id}`}
                        key={set.id}
                        className="bg-gray-700 p-4 border border-gray-500 rounded-md h-64"
                      >
                        <div className="flex justify-between flex-col h-full">
                          <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold">
                            {set.en_translation || set.set_name}
                          </h3>

                          <div className="text-sm text-white ml-4">
                            {set.set_code}
                          </div>
                        </div>

                        <div className="mt-4">
                          <Image
                            className="mx-auto h-32 object-contain"
                            src={set.set_logo}
                            alt={set.set_name}
                            width={200}
                            height={200}
                          />
                        </div>
                        </div>

                        <div>
                          {set.series_release_date
  ? new Date(set.series_release_date).toLocaleDateString("en-GB")
  : ""}
                        </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          {/* </div> */}
      </div>
    </div>
  );
}
