import Header from "@/app/components/layout/Header/Header";
import { fetchSet, fetchSetsGrouped } from "@/db/mcc_sets/mcc_sets.repo";
import Image from "next/image";
import Link from "next/link";

type SetItem = {
  id: string | number;
  set_id: string;
  set_name: string;
  en_translation?: string | null;
  set_code?: string | null;
  set_logo: string;
  series_release_date?: string | Date | null;
};

type GroupedSets = Record<string, SetItem[]>;

export default async function Sets({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const groupedSets = (await fetchSetsGrouped(lang)) as GroupedSets;

  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
        <div className="space-y-12">
          {Object.entries(groupedSets).map(([series, sets]) => (
            <div key={series}>
              <h2 className="mb-6 text-3xl font-bold">{series}</h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {sets.map((set) => (
                  <Link
                    href={`/${lang}/sets/${set.set_id}`}
                    key={set.set_id}
                    className="h-64 rounded-md border border-gray-500 bg-gray-700 p-4"
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold">
                            {set.en_translation || set.set_name}
                          </h3>

                          {set.set_code && (
                            <div className="ml-4 text-sm text-white">
                              {set.set_code}
                            </div>
                          )}
                        </div>

                        {set.set_logo && (
                          <div className="mt-4">
                            <Image
                              className="mx-auto h-32 object-contain"
                              src={set.set_logo}
                              alt={set.set_name || "Set logo"}
                              width={200}
                              height={200}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        {set.series_release_date
                          ? new Date(set.series_release_date).toLocaleDateString(
                              "en-GB"
                            )
                          : ""}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
