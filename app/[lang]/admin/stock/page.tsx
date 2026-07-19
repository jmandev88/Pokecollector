import AdminStockTable from "@/app/components/Admin/AdminStockTable";
import VaultLanguageSelector from "@/app/components/Vault/VaultLanguageSelector";
import { ADMIN_USER_ID } from "@/app/config/admin";
import {
  fetchAdminStockCards,
  fetchAdminStockSets,
} from "@/db/mcc_card_stock/mcc_card_stock.repo";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";

type SearchParams = {
  set?: string;
  q?: string;
  page?: string;
};

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

function pageHref({
  lang,
  set,
  q,
  page,
}: {
  lang: string;
  set?: string;
  q?: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (set) {
    params.set("set", set);
  }

  if (q) {
    params.set("q", q);
  }

  params.set("page", String(page));

  return `/${lang}/admin/stock?${params.toString()}`;
}

export default async function AdminStockPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);

  if (session?.user?.id !== ADMIN_USER_ID) {
    notFound();
  }

  const setId = resolvedSearchParams.set ?? "";
  const query = resolvedSearchParams.q ?? "";
  const page = Math.max(1, Number(resolvedSearchParams.page ?? 1));
  const [sets, cardsResult] = await Promise.all([
    fetchAdminStockSets(lang),
    fetchAdminStockCards({
      lang,
      setId,
      query,
      page,
    }),
  ]);
  const totalPages = Math.max(
    1,
    Math.ceil(cardsResult.totalCount / cardsResult.pageSize)
  );

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#2c1715]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[60px] flex-col items-center border-r border-[#f2d9d4] bg-[#fff0ed] py-5 md:flex">
        <Link href={`/${lang}`} className="text-[#ce130c]">
          <span className="material-symbols-outlined text-[28px]">style</span>
        </Link>

        <nav className="mt-12 flex flex-1 flex-col items-center gap-5">
          <SidebarLink href={`/${lang}`} icon="dashboard" />
          <SidebarLink href={`/${lang}/sets`} icon="collections_bookmark" />
          <SidebarLink href={`/${lang}/browse`} icon="category" />
          <SidebarLink href={`/${lang}/sealed`} icon="storefront" />
          <SidebarLink
            href={`/${lang}/admin/stock`}
            icon="admin_panel_settings"
            active
          />
        </nav>

        <span className="material-symbols-outlined text-[21px] text-[#704f49]">
          settings
        </span>
      </aside>

      <div className="min-h-screen md:pl-[60px]">
        <header className="flex min-h-[96px] items-center justify-between border-b border-[#f4dfdb] bg-white/85 px-6 md:px-12">
          <div className="flex items-center gap-9">
            <h1 className="text-xl font-black tracking-tight text-[#c7130c] md:text-2xl">
              Stock Admin
            </h1>
            <div className="hidden h-6 w-px bg-[#eac9c2] md:block" />
            <div className="hidden text-[9px] font-black uppercase tracking-[0.12em] text-[#69443f] md:block">
              Pocket Monsters Vault v2.0
            </div>
          </div>

          <div className="flex items-center gap-6">
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
                Card Stock
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#6e514e]">
                Search all card variants and update stock quantities.
              </p>
            </div>

            <div className="rounded-full bg-[#cf160f] px-4 py-2 text-[11px] font-black text-white shadow">
              {cardsResult.totalCount.toLocaleString("en-GB")} results
            </div>
          </section>

          <form className="mt-8 grid gap-3 rounded-xl border border-[#f3dfdb] bg-white/70 p-4 shadow-sm md:grid-cols-[1fr_260px_auto]">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search card name..."
              className="h-11 rounded-lg border border-[#efcbc4] bg-white px-4 text-sm font-semibold text-[#2c1715] outline-none focus:border-[#cf160f]"
            />
            <select
              name="set"
              defaultValue={setId}
              className="h-11 rounded-lg border border-[#efcbc4] bg-white px-3 text-sm font-semibold text-[#2c1715] outline-none focus:border-[#cf160f]"
            >
              <option value="">All sets</option>
              {sets.map((set) => (
                <option value={set.set_id} key={set.set_id}>
                  {set.en_translation || set.set_name}
                </option>
              ))}
            </select>
            <button className="h-11 rounded-lg bg-[#cf160f] px-5 text-xs font-black uppercase text-white">
              Filter
            </button>
          </form>

          <AdminStockTable
            key={`${setId}:${query}:${page}`}
            cards={cardsResult.rows}
          />

          <div className="mt-6 flex items-center justify-between">
            <Link
              href={pageHref({
                lang,
                set: setId,
                q: query,
                page: Math.max(1, page - 1),
              })}
              className={`rounded-lg px-4 py-2 text-xs font-black uppercase ${
                page <= 1
                  ? "pointer-events-none bg-[#fff0ed] text-[#c9aaa4]"
                  : "bg-[#cf160f] text-white"
              }`}
            >
              Previous
            </Link>

            <div className="text-xs font-black uppercase text-[#704f49]">
              Page {page.toLocaleString("en-GB")} of{" "}
              {totalPages.toLocaleString("en-GB")}
            </div>

            <Link
              href={pageHref({
                lang,
                set: setId,
                q: query,
                page: Math.min(totalPages, page + 1),
              })}
              className={`rounded-lg px-4 py-2 text-xs font-black uppercase ${
                page >= totalPages
                  ? "pointer-events-none bg-[#fff0ed] text-[#c9aaa4]"
                  : "bg-[#cf160f] text-white"
              }`}
            >
              Next
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
