import Link from "next/link";

function pageHref({
  basePath,
  query,
  page,
}: {
  basePath: string;
  query: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  params.set("page", String(page));

  return `${basePath}?${params.toString()}`;
}

export default function VaultCardListingControls({
  basePath,
  query,
  page,
  totalCount,
  pageSize,
}: {
  basePath: string;
  query: string;
  page: number;
  totalCount: number;
  pageSize: number;
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <section className="mt-8 rounded-xl border border-[#f3dfdb] bg-white/70 p-4 shadow-sm">
      <form className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search card name..."
          className="h-11 rounded-lg border border-[#efcbc4] bg-white px-4 text-sm font-semibold text-[#2c1715] outline-none focus:border-[#cf160f]"
        />
        <button className="h-11 rounded-lg bg-[#cf160f] px-5 text-xs font-black uppercase text-white">
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-black uppercase text-[#704f49]">
          {totalCount.toLocaleString("en-GB")} results · Page{" "}
          {page.toLocaleString("en-GB")} of {totalPages.toLocaleString("en-GB")}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={pageHref({
              basePath,
              query,
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
          <Link
            href={pageHref({
              basePath,
              query,
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
      </div>
    </section>
  );
}
