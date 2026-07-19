import { fetchSetsGrouped } from "@/db/mcc_sets/mcc_sets.repo";
import VaultLanguageSelector from "@/app/components/Vault/VaultLanguageSelector";
import { isAdminUser } from "@/app/config/admin";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";

type SetItem = {
  id: string | number;
  set_id: string;
  set_name: string;
  set_series?: string | null;
  en_translation?: string | null;
  set_code?: string | null;
  set_total?: string | number | null;
  set_printed_total?: string | number | null;
  set_logo: string;
  set_symbol?: string | null;
  set_is_online_only?: boolean | null;
  set_release_date?: string | Date | null;
  series_release_date?: string | Date | null;
};

type GroupedSets = Record<string, SetItem[]>;

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

function formatReleaseDate(date?: string | Date | null) {
  if (!date) {
    return "Release date pending";
  }

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function displayName(set: SetItem) {
  return set.en_translation || set.set_name;
}

export default async function Sets({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await getServerSession(authOptions);
  const showAdminNav = isAdminUser(session?.user?.id);

  const groupedSets = (await fetchSetsGrouped(lang)) as GroupedSets;
  const allSets = Object.values(groupedSets).flat();

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
              Set Registry
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
              <span className="text-sm">Search the sets...</span>
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
              <h2 className="text-2xl font-black tracking-tight">
                Pokémon Set Library
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#6e514e]">
                Browse every tracked expansion grouped by series.
              </p>
            </div>

            <div className="rounded-full bg-[#cf160f] px-4 py-2 text-[11px] font-black text-white shadow">
              {allSets.length.toLocaleString("en-GB")} sets
            </div>
          </section>

          <div className="mt-10 space-y-12">
          {Object.entries(groupedSets).map(([series, sets]) => (
            <div key={series}>
              <div className="mb-5 flex items-center justify-between gap-5 border-b border-[#f1d8d3] pb-3">
                <div>
                  <h3 className="text-xl font-black tracking-tight">
                    {series}
                  </h3>
                  <div className="mt-1 text-xs font-semibold text-[#765852]">
                    {sets.length} releases • earliest series date{" "}
                    {formatReleaseDate(sets[0]?.series_release_date)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {sets.map((set) => (
                  <Link
                    href={`/${lang}/sets/${set.set_id}`}
                    key={set.set_id}
                    className="group flex min-h-[230px] cursor-pointer flex-col justify-between rounded-xl border border-[#f3dfdb] bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#efb8af] hover:bg-white hover:shadow-xl"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="text-base font-black leading-tight text-[#2c1715]">
                            {displayName(set)}
                          </h4>
                          <div className="mt-1 text-xs font-semibold text-[#755652]">
                            {set.set_series ?? series}
                          </div>
                        </div>

                        {set.set_code && (
                          <div className="shrink-0 rounded-md bg-[#cf160f] px-2.5 py-1.5 text-[10px] font-black uppercase text-white shadow">
                            {set.set_code}
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex h-24 items-center justify-center rounded-lg bg-[#fff0ed] p-4 ring-1 ring-[#f3dfdb]">
                        {set.set_logo ? (
                            <Image
                            className="max-h-20 w-full object-contain transition group-hover:scale-[1.03]"
                              src={set.set_logo}
                              alt={set.set_name || "Set logo"}
                              width={200}
                            height={96}
                            />
                        ) : (
                          <span className="material-symbols-outlined text-[34px] text-[#e0b7b0]">
                            collections_bookmark
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2 text-[11px] font-semibold text-[#704f49]">
                      <div className="rounded-lg bg-[#fff0ed] p-2">
                        <div className="text-[8px] font-black uppercase text-[#9b7068]">
                          Cards
                        </div>
                        <div className="mt-1 text-[#2c1715]">
                          {set.set_printed_total ?? set.set_total ?? "N/A"}
                        </div>
                      </div>

                      <div className="rounded-lg bg-[#fff0ed] p-2">
                        <div className="text-[8px] font-black uppercase text-[#9b7068]">
                          Total
                        </div>
                        <div className="mt-1 text-[#2c1715]">
                          {set.set_total ?? "N/A"}
                        </div>
                      </div>

                      <div className="rounded-lg bg-[#fff0ed] p-2">
                        <div className="text-[8px] font-black uppercase text-[#9b7068]">
                          Release
                        </div>
                        <div className="mt-1 text-[#2c1715]">
                          {formatReleaseDate(set.set_release_date)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            ))}
          </div>
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
