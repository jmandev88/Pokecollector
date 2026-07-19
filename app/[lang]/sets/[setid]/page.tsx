import VaultCardCollectionList from "@/app/components/Vault/VaultCardCollectionList";
import VaultCardListingControls from "@/app/components/Vault/VaultCardListingControls";
import VaultLanguageSelector from "@/app/components/Vault/VaultLanguageSelector";
import {
  CARD_LISTING_PAGE_SIZE,
  CardListingSearchParams,
  filterCardsByName,
  paginateCards,
} from "@/app/utils/cardListingPagination";
import Link from "next/link";

import { fetchCardsByExpansion } from "@/db/mcc_cards/mcc_cards.repo";
import { fetchUserCollection } from "@/db/mcc_user_collection/mcc_user_collection.repo";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/app/config/admin";

function SidebarLink({
  href,
  icon,
  active = false,
}: {
  href: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
        active
          ? "bg-[#74f47f] text-[#13762c]"
          : "text-[#704f49] hover:bg-[#ffe2dc]"
      }`}
    >
      <span className="material-symbols-outlined text-[19px]">{icon}</span>
    </Link>
  );
}

export default async function Sets({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; setid: string }>;
  searchParams: Promise<CardListingSearchParams>;
}) {
  const { lang, setid } = await params;
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q ?? "";
  const page = Math.max(1, Number(resolvedSearchParams.page ?? 1));

  const cards = await fetchCardsByExpansion(lang, setid);
  const cardsList = cards ?? [];
  const filteredCards = filterCardsByName(cardsList, query);
  const paginatedCards = paginateCards(filteredCards, page);
  const firstCard = cardsList[0];
  const setName = firstCard?.expansion?.name ?? setid;
  const setSeries = firstCard?.expansion?.series ?? "Set checklist";
  const setYear = firstCard?.expansion?.release_date?.slice(0, 4);
  const variantCount = cardsList.length;
  const uniqueCardCount = new Set(cardsList.map((card) => card.id)).size;

  const session = await getServerSession(authOptions);
  const showAdminNav = isAdminUser(session?.user?.id);

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
    <div className="min-h-screen bg-[#fff8f6] text-[#2c1715]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[60px] flex-col items-center border-r border-[#f2d9d4] bg-[#fff0ed] py-5 md:flex">
        <Link href={`/${lang}`} className="text-[#ce130c]">
          <span className="material-symbols-outlined text-[28px]">style</span>
        </Link>

        <nav className="mt-12 flex flex-1 flex-col items-center gap-5">
          <SidebarLink href={`/${lang}`} icon="dashboard" />
          <SidebarLink
            href={`/${lang}/sets`}
            icon="collections_bookmark"
            active
          />
          <SidebarLink href={`/${lang}/browse`} icon="category" />
          <SidebarLink href={`/${lang}/sealed`} icon="storefront" />
          {showAdminNav && (
            <SidebarLink
              href={`/${lang}/admin/stock`}
              icon="admin_panel_settings"
            />
          )}
        </nav>

        <span className="material-symbols-outlined text-[21px] text-[#704f49]">
          settings
        </span>
      </aside>

      <div className="min-h-screen md:pl-[60px]">
        <header className="flex min-h-[96px] items-center justify-between border-b border-[#f4dfdb] bg-white/85 px-6 md:px-12">
          <div className="flex items-center gap-9">
            <h1 className="text-xl font-black tracking-tight text-[#c7130c] md:text-2xl">
              Set Checklist
            </h1>
            <div className="hidden h-6 w-px bg-[#eac9c2] md:block" />
            <div className="hidden text-[9px] font-black uppercase tracking-[0.12em] text-[#69443f] md:block">
              Pocket Monsters Vault v2.0
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden h-11 w-[320px] items-center gap-3 rounded-full border border-[#f0d4cf] bg-[#fff0ed] px-4 text-[#856c70] shadow-sm lg:flex">
              <span className="material-symbols-outlined text-[16px]">
                search
              </span>
              <span className="text-sm">Search this set...</span>
            </div>
            <VaultLanguageSelector lang={lang} />
            <span className="material-symbols-outlined text-[23px] text-[#6f4d47]">
              notifications
            </span>
          </div>
        </header>

        <main className="min-h-[calc(100vh-180px)] px-6 py-10 md:px-12">
          <section className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Link
                href={`/${lang}/sets`}
                className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#cf160f]"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_left
                </span>
                All sets
              </Link>
              <h2 className="text-2xl font-black tracking-tight">{setName}</h2>
              <p className="mt-2 text-sm font-semibold text-[#6e514e]">
                {setSeries}
                {setYear ? ` • ${setYear}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-full bg-[#cf160f] px-4 py-2 text-[11px] font-black text-white shadow">
                {uniqueCardCount.toLocaleString("en-GB")} cards
              </div>
              <div className="rounded-full bg-[#fff0ed] px-4 py-2 text-[11px] font-black text-[#704f49] ring-1 ring-[#f3dfdb]">
                {variantCount.toLocaleString("en-GB")} variants
              </div>
            </div>
          </section>

          <VaultCardListingControls
            basePath={`/${lang}/sets/${setid}`}
            query={query}
            page={page}
            totalCount={filteredCards.length}
            pageSize={CARD_LISTING_PAGE_SIZE}
          />

          <VaultCardCollectionList
              lang={lang}
              cards={paginatedCards}
              progressCards={filteredCards}
              collectionMap={collectionMap}
              showCollectionControls={!!session?.user?.id}
            emptyMessage="No cards found for this language and set."
          />
        </main>

        <footer className="flex min-h-[82px] items-center justify-between bg-[#ffe0da] px-6 text-[#72524d] md:px-12">
          <div className="text-[9px] font-black uppercase tracking-wide text-[#c7130c]">
            Pokekeep Vault
          </div>
          <div className="text-sm font-medium">
            © 2024 PokeKeep Vault. All card images property of The Pokémon Company.
          </div>
          <div className="flex gap-10 text-sm font-medium">
            <span>Terms</span>
            <span>Privacy</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
