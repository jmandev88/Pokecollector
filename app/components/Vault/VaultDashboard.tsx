"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  decrementCollection,
  incrementCollection,
} from "@/app/actions/collections.actions";
import { normalizeStampName } from "@/app/utils/normalizeStampName";
import VaultLanguageSelector from "@/app/components/Vault/VaultLanguageSelector";

type VaultImage = {
  type: string;
  small?: string;
  medium?: string;
  large?: string;
};

type VaultCard = {
  listing_title?: string | null;
  listing_condition?: string | null;
  listing_seller?: string | null;
  listing_price?: string | null;
  listing_market_trend?: string | null;
  card_id: string;
  card_name: string;
  number?: string | null;
  rarity?: string | null;
  supertype?: string | null;
  subtypes?: string[] | null;
  types?: string[] | null;
  hp?: string | null;
  artist?: string | null;
  printed_number?: string | null;
  regulation_mark?: string | null;
  attacks?: unknown;
  weaknesses?: unknown;
  retreat_cost?: string[] | null;
  legalities?: Record<string, string> | null;
  national_pokedex_numbers?: number[] | null;
  images?: VaultImage[];
  expansion?: {
    name?: string;
    series?: string;
    release_date?: string;
  } | null;
  expansion_id?: string | null;
  variant_id: string;
  variant_name?: string | null;
  variant_images?: VaultImage[];
  variant_prices?: unknown;
};

type VaultDashboardProps = {
  lang: string;
  cards: VaultCard[];
  ownedVariants: {
    variantId: string;
    quantity: number;
  }[];
  stats: {
    cardCount: number | string;
    cardVariantsCount: number | string;
    setCount: number | string;
    sealedCount: number | string;
  };
};

function imageFor(card: VaultCard) {
  return (
    card.variant_images?.find((image) => image.type === "front")?.large ??
    card.variant_images?.find((image) => image.type === "front")?.medium ??
    card.variant_images?.[0]?.large ??
    card.variant_images?.[0]?.medium ??
    card.images?.find((image) => image.type === "front")?.large ??
    card.images?.find((image) => image.type === "front")?.medium ??
    card.images?.[0]?.large ??
    card.images?.[0]?.medium ??
    "/placeholder_card.png"
  );
}

function priceFor(card: VaultCard) {
  return card.listing_price ?? "Price pending";
}

function titleFor(card: VaultCard) {
  return card.listing_title ?? card.card_name;
}

function trendFor(card: VaultCard) {
  return card.listing_market_trend ?? "+2.4% this month";
}

function compactList(values?: (string | number)[] | null) {
  return values?.filter(Boolean).join(", ") || "None";
}

function firstNamedItem(items: unknown) {
  if (!Array.isArray(items)) {
    return null;
  }

  const firstItem = items.find(
    (item): item is { name?: string; type?: string; value?: string } =>
      Boolean(item) &&
      typeof item === "object" &&
      ("name" in item || "type" in item || "value" in item)
  );

  if (firstItem?.name) {
    return firstItem.name;
  }

  if (firstItem?.type && firstItem?.value) {
    return `${firstItem.type} ${firstItem.value}`;
  }

  if (firstItem?.type) {
    return firstItem.type;
  }

  return null;
}

function legalitiesSummary(legalities?: Record<string, string> | null) {
  if (!legalities) {
    return "Unknown";
  }

  return (
    Object.entries(legalities)
      .filter(([, status]) => Boolean(status))
      .slice(0, 3)
      .map(([format, status]) => `${format}: ${status}`)
      .join(", ") || "Unknown"
  );
}

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

export default function VaultDashboard({
  lang,
  cards,
  ownedVariants,
  stats,
}: VaultDashboardProps) {
  const { data: session } = useSession();
  const [selectedCard, setSelectedCard] = useState<VaultCard | null>(null);
  const [localQuantities, setLocalQuantities] = useState(() =>
    Object.fromEntries(
      ownedVariants.map((variant) => [variant.variantId, variant.quantity])
    )
  );
  const [isPending, startTransition] = useTransition();
  const featuredCards = cards.slice(0, 8);

  const selectedQuantity = useMemo(
    () => (selectedCard ? localQuantities[selectedCard.variant_id] ?? 0 : 0),
    [localQuantities, selectedCard]
  );
  const selectedIsOwned = selectedQuantity > 0;

  const handleIncrementCollection = () => {
    if (!selectedCard) {
      return;
    }

    if (!session?.user?.id) {
      signIn("google");
      return;
    }

    const variantId = selectedCard.variant_id;
    const previousQuantities = { ...localQuantities };

    startTransition(async () => {
      setLocalQuantities((current) => ({
        ...current,
        [variantId]: (current[variantId] ?? 0) + 1,
      }));

      try {
        await incrementCollection(variantId);
      } catch {
        setLocalQuantities(previousQuantities);
      }
    });
  };

  const handleDecrementCollection = () => {
    if (!selectedCard || selectedQuantity <= 0) {
      return;
    }

    if (!session?.user?.id) {
      signIn("google");
      return;
    }

    const variantId = selectedCard.variant_id;
    const previousQuantities = { ...localQuantities };

    startTransition(async () => {
      setLocalQuantities((current) => {
        const nextQuantity = Math.max((current[variantId] ?? 0) - 1, 0);
        const next = { ...current };

        if (nextQuantity === 0) {
          delete next[variantId];
        } else {
          next[variantId] = nextQuantity;
        }

        return next;
      });

      try {
        await decrementCollection(variantId);
      } catch {
        setLocalQuantities(previousQuantities);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#fff8f6] text-[#2c1715]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[60px] flex-col items-center border-r border-[#f2d9d4] bg-[#fff0ed] py-5 md:flex">
        <Link href={`/${lang}`} className="text-[#ce130c]">
          <span className="material-symbols-outlined text-[28px]">
            style
          </span>
        </Link>

        <nav className="mt-12 flex flex-1 flex-col items-center gap-5">
          <SidebarLink href={`/${lang}`} icon="dashboard" active />
          <SidebarLink href={`/${lang}/sets`} icon="collections_bookmark" />
          <SidebarLink href={`/${lang}/browse`} icon="category" />
          <SidebarLink href={`/${lang}/sealed`} icon="storefront" />
        </nav>

        <div className="flex flex-col items-center gap-5">
          <span className="material-symbols-outlined text-[21px] text-[#704f49]">
            settings
          </span>
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt="avatar"
              width={42}
              height={42}
              className="h-10 w-10 rounded-full border-2 border-white object-cover shadow"
            />
          ) : (
            <button
              onClick={() => signIn("google")}
              className="h-10 w-10 rounded-full border-2 border-white bg-[#ffd9d2] text-[8px] font-bold text-[#ce130c] shadow"
            >
              IN
            </button>
          )}
        </div>
      </aside>

      <div className="min-h-screen md:pl-[60px]">
        <header className="flex min-h-[96px] items-center justify-between border-b border-[#f4dfdb] bg-white/85 px-6 md:px-12">
          <div className="flex items-center gap-9">
            <h1 className="text-xl font-black tracking-tight text-[#c7130c] md:text-2xl">
              Collection Status
            </h1>
            <div className="hidden h-6 w-px bg-[#eac9c2] md:block" />
            <div className="hidden text-[9px] font-black uppercase tracking-[0.12em] text-[#69443f] md:block">
              Pocket Monsters Vault v2.0
            </div>
            <div className="sr-only">
              {stats.cardCount} cards, {stats.cardVariantsCount} variants,{" "}
              {stats.setCount} sets, {stats.sealedCount} sealed products
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden h-11 w-[320px] items-center gap-3 rounded-full border border-[#f0d4cf] bg-[#fff0ed] px-4 text-[#856c70] shadow-sm lg:flex">
              <span className="material-symbols-outlined text-[16px]">
                search
              </span>
              <span className="text-sm">Search the vault...</span>
            </div>
            <VaultLanguageSelector lang={lang} />
            <span className="material-symbols-outlined text-[23px] text-[#6f4d47]">
              notifications
            </span>
          </div>
        </header>

        <main className="min-h-[calc(100vh-180px)] px-6 py-12 md:px-12">
          <section className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                Recent Marketplace Arrivals
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#6e514e]">
                New listings from verified sellers across the globe.
              </p>
            </div>

            <Link
              href={`/${lang}/sets`}
              className="hidden items-center gap-2 text-base font-semibold text-[#cf160f] md:flex"
            >
              View All
              <span className="material-symbols-outlined text-[21px]">
                chevron_right
              </span>
            </Link>
          </section>

          <section className="mt-10 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {featuredCards.map((card) => (
              <button
                key={card.variant_id}
                onClick={() => setSelectedCard(card)}
                className="group block cursor-pointer text-left"
              >
                <div className="relative aspect-[5/7] overflow-hidden rounded-xl bg-[#eef3f4] shadow-sm ring-1 ring-[#f3dfdb] transition group-hover:-translate-y-1 group-hover:shadow-xl">
                  <Image
                    src={imageFor(card)}
                    alt={titleFor(card)}
                    width={320}
                    height={448}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-3 top-3 rounded-md bg-[#cf160f] px-2.5 py-2 text-[11px] font-black text-white shadow">
                    {priceFor(card)}
                  </div>
                  {(localQuantities[card.variant_id] ?? 0) > 0 && (
                    <div className="absolute left-3 top-3 rounded-full bg-[#13842e] px-3 py-1 text-[8px] font-black uppercase text-white">
                      Owned x{localQuantities[card.variant_id]}
                    </div>
                  )}
                </div>

                <div className="mt-4 text-base font-medium leading-tight">
                  {titleFor(card)}
                </div>
              </button>
            ))}
          </section>
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

      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
          <div className="grid w-full max-w-[1380px] overflow-hidden rounded-3xl bg-[#eee] shadow-2xl md:grid-cols-[42%_58%]">
            <div className="bg-white p-10 md:p-14">
              <div className="flex h-full items-center justify-center rounded-3xl border-4 border-[#ffe8e5] bg-[#f3f8fa] p-6">
                <Image
                  src={imageFor(selectedCard)}
                  alt={titleFor(selectedCard)}
                  width={560}
                  height={780}
                  className="max-h-[68vh] w-full object-contain drop-shadow-xl"
                />
              </div>
            </div>

            <div className="relative bg-[#eeeeec] p-10 md:p-14">
              <button
                onClick={() => setSelectedCard(null)}
                className="absolute right-8 top-7 flex h-14 w-14 items-center justify-center rounded-full bg-white/45 text-[#2c1715] transition hover:bg-white"
              >
                <span className="material-symbols-outlined text-[23px]">
                  close
                </span>
              </button>

              <div className="flex items-center gap-4">
                <span
                  className={`rounded-full px-4 py-2 text-[9px] font-black uppercase text-white ${
                    selectedIsOwned ? "bg-[#cf160f]" : "bg-[#6d5550]"
                  }`}
                >
                  {selectedIsOwned ? "Owned" : "Vault"}
                </span>
                <span className="text-base font-semibold uppercase tracking-wide text-[#6a4c47]">
                  Set #{selectedCard.number ?? selectedCard.expansion_id ?? "000"}
                </span>
              </div>

              <h3 className="mt-4 text-[32px] font-black leading-tight">
                {titleFor(selectedCard)}
              </h3>
              <div className="mt-2 text-base font-medium text-[#d0160f]">
                {selectedCard.expansion?.name ?? "Unknown Set"} —{" "}
                {selectedCard.expansion?.release_date?.slice(0, 4) ?? "Vault"}
              </div>
              <div className="mt-1 text-xs font-semibold text-[#704f49]">
                DB card: {selectedCard.card_name}
              </div>

              <div className="mt-8 rounded-2xl bg-white/55 p-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-xs font-black uppercase text-[#704f49]">
                      Card number
                    </div>
                    <div className="mt-1 text-base font-semibold">
                      {selectedCard.printed_number ??
                        selectedCard.number ??
                        "Unknown"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-black uppercase text-[#704f49]">
                      Supertype
                    </div>
                    <div className="mt-1 text-base font-semibold">
                      {selectedCard.supertype ?? "Unknown"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-black uppercase text-[#704f49]">
                      HP
                    </div>
                    <div className="mt-1 text-base font-semibold">
                      {selectedCard.hp ?? "N/A"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-black uppercase text-[#704f49]">
                      Types
                    </div>
                    <div className="mt-1 text-base font-semibold">
                      {compactList(selectedCard.types)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-black uppercase text-[#704f49]">
                      Subtypes
                    </div>
                    <div className="mt-1 text-base font-semibold">
                      {compactList(selectedCard.subtypes)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-black uppercase text-[#704f49]">
                      First attack
                    </div>
                    <div className="mt-1 text-base font-semibold">
                      {firstNamedItem(selectedCard.attacks) ?? "None"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-black uppercase text-[#704f49]">
                      Weakness
                    </div>
                    <div className="mt-1 text-base font-semibold">
                      {firstNamedItem(selectedCard.weaknesses) ?? "None"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-black uppercase text-[#704f49]">
                      Retreat cost
                    </div>
                    <div className="mt-1 text-base font-semibold">
                      {compactList(selectedCard.retreat_cost)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-black uppercase text-[#704f49]">
                      Pokédex
                    </div>
                    <div className="mt-1 text-base font-semibold">
                      {compactList(selectedCard.national_pokedex_numbers)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-9 rounded-2xl bg-[#fff2ef] p-7">
                <div className="grid gap-7 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-black uppercase text-[#704f49]">
                      Market price
                    </div>
                    <div className="mt-1 text-xl font-medium">
                      {priceFor(selectedCard)}
                    </div>
                    <div className="mt-1 text-[11px] font-bold text-[#15802e]">
                      {trendFor(selectedCard)}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-black uppercase text-[#704f49]">
                      Rarity
                    </div>
                    <div className="mt-1 text-xl font-medium">
                      {selectedCard.rarity ?? "Unknown"}
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="text-xs font-black uppercase text-[#704f49]">
                    DB details
                  </div>
                  <div className="mt-2 grid gap-2 text-xs font-semibold text-[#704f49] md:grid-cols-2">
                    <div>Artist: {selectedCard.artist ?? "Unknown"}</div>
                    <div>
                      Regulation: {selectedCard.regulation_mark ?? "N/A"}
                    </div>
                    <div className="md:col-span-2">
                      Legalities: {legalitiesSummary(selectedCard.legalities)}
                    </div>
                  </div>
                </div>
              </div>

              {selectedCard.variant_name && (
                <div className="mt-5 text-xs font-semibold text-[#704f49]">
                  Variant: {normalizeStampName(selectedCard.variant_name)}
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-[#f5d1ca] bg-white/55 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase text-[#704f49]">
                      Collection quantity
                    </div>
                  </div>

                  <div className="flex overflow-hidden rounded-lg border border-[#efcbc4] bg-white">
                    <button
                      disabled={isPending || selectedQuantity <= 0}
                      onClick={handleDecrementCollection}
                      className="flex h-14 w-16 items-center justify-center bg-[#fff2ef] text-xl font-black text-[#cf160f] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      -
                    </button>
                    <div className="flex h-14 min-w-20 items-center justify-center px-5 text-base font-black">
                      {selectedQuantity}
                    </div>
                    <button
                      disabled={isPending}
                      onClick={handleIncrementCollection}
                      className="flex h-14 w-16 items-center justify-center bg-[#cf160f] text-xl font-black text-white disabled:opacity-60"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-9 flex flex-wrap gap-6">
                <Link
                  href={`/${lang}/sets/${selectedCard.expansion_id ?? ""}`}
                  className="flex min-h-20 items-center rounded-lg bg-[#cf160f] px-10 text-base font-black text-white transition hover:bg-[#a9110c]"
                >
                  Manage in Vault
                </Link>
                <button className="flex h-20 w-20 items-center justify-center rounded-lg bg-[#ffd6ce] text-[#2c1715]">
                  <span className="material-symbols-outlined text-[23px]">
                    share
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
