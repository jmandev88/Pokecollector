import SealedQuantityControls from "@/app/components/Sealed/SealedQuantityControls";
import VaultLanguageSelector from "@/app/components/Vault/VaultLanguageSelector";
import { ADMIN_USER_ID } from "@/app/config/admin";
import { fetchSealedGrouped } from "@/db/mcc_sealed/mcc_sealed.repo";
import { fetchUserSealedCollection } from "@/db/mcc_user_sealed_collection/mcc_user_sealed_collection.repo";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";

type SealedImage = {
  type: string;
  large: string;
  medium?: string;
  small?: string;
};

type SealedVariant = {
  name: string;
  images?: SealedImage[];
  prices?: unknown[];
  marketplaces?: unknown[];
};

type SealedProduct = {
  id: string;
  name: string;
  en_translation?: string | null;
  images?: SealedImage[];
  variants?: SealedVariant[];
  set_name?: string | null;
  set_series?: string | null;
  set_release_date?: string | Date | null;
};

type SealedProductWithVariant = SealedProduct & {
  variantName: string | null;
  variantImage?: SealedImage;
};

type GroupedSealed = Record<string, SealedProduct[]>;

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

function imageFor(product: SealedProductWithVariant) {
  return (
    product.variantImage?.large ??
    product.variantImage?.medium ??
    product.images?.find((image) => image.type === "front")?.large ??
    product.images?.find((image) => image.type === "front")?.medium ??
    product.images?.[0]?.large ??
    product.images?.[0]?.medium ??
    "/placeholder_card.png"
  );
}

function productName(product: SealedProductWithVariant) {
  return product.en_translation || product.name;
}

function formatReleaseDate(date?: string | Date | null) {
  if (!date) {
    return "Release pending";
  }

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function Sealed({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await getServerSession(authOptions);
  const showAdminNav = session?.user?.id === ADMIN_USER_ID;
  const groupedSealed = (await fetchSealedGrouped(lang)) as GroupedSealed;
  const collection = session?.user?.id
    ? await fetchUserSealedCollection(session.user.id)
    : [];
  const collectionMap = Object.fromEntries(
    collection.map((product) => [product.sealed_id, product.quantity])
  );

  const flattenedSealed = Object.entries(groupedSealed).reduce<
    Record<string, SealedProductWithVariant[]>
  >((acc, [series, products]) => {
    acc[series] = products.flatMap((product): SealedProductWithVariant[] => {
      if (!product.variants?.length) {
        return [
          {
            ...product,
            variantName: null,
            variantImage: product.images?.[0],
          },
        ];
      }

      return product.variants.map(
        (variant): SealedProductWithVariant => ({
          ...product,
          variantName: variant.name,
          variantImage:
            variant.images?.find((image) => image.type === "front") ||
            variant.images?.[0],
        })
      );
    });

    return acc;
  }, {});
  const totalProducts = Object.values(flattenedSealed).reduce(
    (total, products) => total + products.length,
    0
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
          <SidebarLink href={`/${lang}/sealed`} icon="storefront" active />
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
              Sealed Vault
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
              <span className="text-sm">Search sealed products...</span>
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
                Sealed Booster Packs
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#6e514e]">
                Booster pack products grouped by series.
              </p>
            </div>

            <div className="rounded-full bg-[#cf160f] px-4 py-2 text-[11px] font-black text-white shadow">
              {totalProducts.toLocaleString("en-GB")} products
            </div>
          </section>

          <div className="mt-10 space-y-12">
            {Object.entries(flattenedSealed).map(([series, products]) => (
              <section key={series}>
                <div className="mb-5 flex items-center justify-between gap-5 border-b border-[#f1d8d3] pb-3">
                  <div>
                    <h3 className="text-xl font-black tracking-tight">
                      {series}
                    </h3>
                    <div className="mt-1 text-xs font-semibold text-[#765852]">
                      {products.length} booster products
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {products.map((product) => (
                    <div
                      key={`${product.id}-${product.variantName ?? "default"}`}
                      className="group flex min-h-[300px] flex-col justify-between rounded-xl border border-[#f3dfdb] bg-white/70 p-4 shadow-sm transition hover:-translate-y-1 hover:border-[#efb8af] hover:bg-white hover:shadow-xl"
                    >
                      <Link
                        href={`/${lang}/sealed/${product.id}`}
                        className="block cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h4 className="line-clamp-2 text-base font-black leading-tight text-[#2c1715]">
                              {productName(product)}
                            </h4>
                            <div className="mt-1 text-xs font-semibold text-[#755652]">
                              {product.set_name ?? "Booster Pack"}
                            </div>
                          </div>

                          {collectionMap[product.id] > 0 && (
                            <div className="shrink-0 rounded-full bg-[#13842e] px-2.5 py-1 text-[8px] font-black uppercase text-white">
                              Owned x{collectionMap[product.id]}
                            </div>
                          )}
                        </div>

                        {product.variantName && (
                          <div className="mt-3 inline-flex rounded-md bg-[#fff0ed] px-2.5 py-1 text-[10px] font-black uppercase text-[#cf160f] ring-1 ring-[#f3dfdb]">
                            {product.variantName}
                          </div>
                        )}

                        <div className="mt-5 flex h-36 items-center justify-center rounded-lg bg-[#fff0ed] p-4 ring-1 ring-[#f3dfdb]">
                          <Image
                            src={imageFor(product)}
                            alt={`${product.name} ${product.variantName ?? ""}`}
                            width={220}
                            height={220}
                            className="max-h-32 w-full object-contain transition group-hover:scale-[1.03]"
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-semibold text-[#704f49]">
                          <div className="rounded-lg bg-[#fff0ed] p-2">
                            <div className="text-[8px] font-black uppercase text-[#9b7068]">
                              Series
                            </div>
                            <div className="mt-1 truncate text-[#2c1715]">
                              {product.set_series ?? series}
                            </div>
                          </div>

                          <div className="rounded-lg bg-[#fff0ed] p-2">
                            <div className="text-[8px] font-black uppercase text-[#9b7068]">
                              Release
                            </div>
                            <div className="mt-1 text-[#2c1715]">
                              {formatReleaseDate(product.set_release_date)}
                            </div>
                          </div>
                        </div>
                      </Link>

                      {session?.user?.id && (
                        <div className="mt-4">
                          <SealedQuantityControls
                            sealedId={product.id}
                            quantity={collectionMap[product.id] ?? 0}
                            variant="vault"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>

        <footer className="flex min-h-[82px] items-center justify-between bg-[#ffe0da] px-6 text-[#72524d] md:px-12">
          <div className="text-[9px] font-black uppercase tracking-wide text-[#c7130c]">
            Pokekeep Vault
          </div>
          <div className="text-sm font-medium">
            © 2024 PokeKeep Vault. All product images property of The Pokémon Company.
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
