import VaultBrowseShell from "@/app/components/Vault/VaultBrowseShell";
import {
  fetchCardCountByPokedexNumber,
  fetchCardCountByRarity,
  fetchCardCountByStamp,
  fetchCardCountByType,
} from "@/db/mcc_cards/mcc_cards.repo";
import { ADMIN_USER_ID } from "@/app/config/admin";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";

const browseGroups = [
  {
    id: "rarity",
    label: "Rarity",
    description: "Browse cards by rarity tier.",
    icon: "workspace_premium",
  },
  {
    id: "pokedex",
    label: "Pokédex",
    description: "Browse cards by national Pokédex number.",
    icon: "format_list_numbered",
  },
  {
    id: "stamp",
    label: "Stamp",
    description: "Browse cards by variant stamp.",
    icon: "verified",
  },
  {
    id: "type",
    label: "Type",
    description: "Browse cards by elemental type.",
    icon: "category",
  },
];

export default async function Browse({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await getServerSession(authOptions);
  const showAdminNav = session?.user?.id === ADMIN_USER_ID;
  const [rarities, pokedexNumbers, stamps, types] = await Promise.all([
    fetchCardCountByRarity(lang),
    fetchCardCountByPokedexNumber(lang),
    fetchCardCountByStamp(lang),
    fetchCardCountByType(lang),
  ]);
  const counts: Record<string, number> = {
    rarity: rarities.length,
    pokedex: pokedexNumbers.length,
    stamp: stamps.length,
    type: types.length,
  };

  return (
    <VaultBrowseShell
      lang={lang}
      title="Filter Library"
      subtitle="Choose a card index, then drill into every available listing."
      showAdminNav={showAdminNav}
    >
      <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {browseGroups.map((group) => (
          <Link
            href={`/${lang}/browse/${group.id}`}
            key={group.id}
            className="group flex min-h-[190px] cursor-pointer flex-col justify-between rounded-xl border border-[#f3dfdb] bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#efb8af] hover:bg-white hover:shadow-xl"
          >
            <div>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#fff0ed] text-[#cf160f] ring-1 ring-[#f3dfdb]">
                <span className="material-symbols-outlined text-[22px]">
                  {group.icon}
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight">
                {group.label}
              </h3>
              <p className="mt-2 text-sm font-semibold text-[#755652]">
                {group.description}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="rounded-full bg-[#cf160f] px-3 py-1.5 text-[10px] font-black uppercase text-white shadow">
                {counts[group.id].toLocaleString("en-GB")} listings
              </span>
              <span className="material-symbols-outlined text-[20px] text-[#cf160f] transition group-hover:translate-x-1">
                chevron_right
              </span>
            </div>
          </Link>
        ))}
      </section>
    </VaultBrowseShell>
  );
}
