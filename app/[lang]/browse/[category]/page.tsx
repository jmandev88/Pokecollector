import VaultBrowseShell from "@/app/components/Vault/VaultBrowseShell";
import { getPokemonName } from "@/app/utils/getPokemonName";
import { normalizeStampName } from "@/app/utils/normalizeStampName";
import { isAdminUser } from "@/app/config/admin";
import {
  fetchCardCountByArtist,
  fetchCardCountByPokedexNumber,
  fetchCardCountByRarity,
  fetchCardCountByStamp,
  fetchCardCountByType,
} from "@/db/mcc_cards/mcc_cards.repo";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";

type BrowseCategory = "rarity" | "pokedex" | "stamp" | "type" | "artist";

type BrowseEntry = {
  label: string;
  href: string;
  cardCount: number;
  collectibleCount: number;
  meta?: string;
};

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function categoryTitle(category: BrowseCategory) {
  const titles: Record<BrowseCategory, string> = {
    rarity: "Rarity Listings",
    pokedex: "Pokédex Listings",
    stamp: "Stamp Listings",
    type: "Type Listings",
    artist: "Artist Listings",
  };

  return titles[category];
}

function categorySubtitle(category: BrowseCategory) {
  const subtitles: Record<BrowseCategory, string> = {
    rarity: "Every rarity value found in the card database.",
    pokedex: "Every national Pokédex number found in the card database.",
    stamp: "Every variant stamp found in the card database.",
    type: "Every elemental type found in the card database.",
    artist: "Every illustrator or artist found in the card database.",
  };

  return subtitles[category];
}

async function fetchEntries(lang: string, category: BrowseCategory) {
  if (category === "rarity") {
    const rows = await fetchCardCountByRarity(lang);

    return rows.map(
      (row): BrowseEntry => ({
        label: row.rarity,
        href: `/${lang}/rarity/${encodeURIComponent(row.rarity)}`,
        cardCount: toNumber(row.card_count),
        collectibleCount: toNumber(row.collectible_count),
      })
    );
  }

  if (category === "type") {
    const rows = await fetchCardCountByType(lang);

    return rows.map(
      (row): BrowseEntry => ({
        label: row.card_type,
        href: `/${lang}/type/${encodeURIComponent(row.card_type)}`,
        cardCount: toNumber(row.card_count),
        collectibleCount: toNumber(row.collectible_count),
      })
    );
  }

  if (category === "artist") {
    const rows = await fetchCardCountByArtist(lang);

    return rows.map(
      (row): BrowseEntry => ({
        label: row.artist,
        href: `/${lang}/artist/${encodeURIComponent(row.artist)}`,
        cardCount: toNumber(row.card_count),
        collectibleCount: toNumber(row.collectible_count),
      })
    );
  }

  if (category === "pokedex") {
    const rows = await fetchCardCountByPokedexNumber(lang);

    return rows.map(
      (row): BrowseEntry => {
        const pokedexNumber = toNumber(row.pokedex_number);

        return {
          label: `#${pokedexNumber} ${getPokemonName(pokedexNumber)}`,
          href: `/${lang}/pokedex/${pokedexNumber}`,
          cardCount: toNumber(row.card_count),
          collectibleCount: toNumber(row.collectible_count),
          meta: `National Pokédex #${pokedexNumber}`,
        };
      }
    );
  }

  const rows = await fetchCardCountByStamp(lang);

  return rows.map(
    (row): BrowseEntry => ({
      label: normalizeStampName(row.stamp),
      href: `/${lang}/stamp/${encodeURIComponent(row.stamp)}`,
      cardCount: toNumber(row.card_count),
      collectibleCount: toNumber(row.collectible_count),
      meta: row.stamp,
    })
  );
}

export default async function BrowseCategoryPage({
  params,
}: {
  params: Promise<{ lang: string; category: string }>;
}) {
  const { lang, category } = await params;
  const session = await getServerSession(authOptions);
  const showAdminNav = isAdminUser(session?.user?.id);

  if (!["rarity", "pokedex", "stamp", "type", "artist"].includes(category)) {
    notFound();
  }

  const safeCategory = category as BrowseCategory;
  const entries = await fetchEntries(lang, safeCategory);

  return (
    <VaultBrowseShell
      lang={lang}
      title={categoryTitle(safeCategory)}
      subtitle={categorySubtitle(safeCategory)}
      showAdminNav={showAdminNav}
    >
      <section className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <Link
            href={entry.href}
            key={entry.href}
            className="group flex cursor-pointer items-center justify-between gap-5 rounded-xl border border-[#f3dfdb] bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#efb8af] hover:bg-white hover:shadow-lg"
          >
            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-[#2c1715]">
                {entry.label}
              </h3>
              {entry.meta && (
                <div className="mt-1 truncate text-[10px] font-semibold text-[#9b7068]">
                  {entry.meta}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] font-black text-[#cf160f]">
                  {entry.collectibleCount.toLocaleString("en-GB")}
                </div>
                <div className="text-[9px] font-black uppercase text-[#9b7068]">
                  variants
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-black text-[#2c1715]">
                  {entry.cardCount.toLocaleString("en-GB")}
                </div>
                <div className="text-[9px] font-black uppercase text-[#9b7068]">
                  cards
                </div>
              </div>
              <span className="material-symbols-outlined text-[18px] text-[#cf160f] transition group-hover:translate-x-1">
                chevron_right
              </span>
            </div>
          </Link>
        ))}
      </section>
    </VaultBrowseShell>
  );
}
