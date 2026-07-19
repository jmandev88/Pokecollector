"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { signIn, useSession } from "next-auth/react";
import CardTile from "@/app/components/Card/CardTile";
import VaultCardModal from "@/app/components/Vault/VaultCardModal";
import {
  decrementCollection,
  incrementCollection,
} from "@/app/actions/collections.actions";
import { isAdminUser } from "@/app/config/admin";
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

function priceFor(card: VaultCard) {
  return card.listing_price ?? "Price pending";
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

  const handleQuantityChange = (variantId: string, quantity: number) => {
    setLocalQuantities((current) => {
      const next = { ...current };

      if (quantity <= 0) {
        delete next[variantId];
      } else {
        next[variantId] = quantity;
      }

      return next;
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
          {isAdminUser(session?.user?.id) && (
            <SidebarLink
              href={`/${lang}/admin/stock`}
              icon="admin_panel_settings"
            />
          )}
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

          <section className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {featuredCards.map((card) => (
              <CardTile
                key={card.variant_id}
                card={{
                  id: card.card_id,
                  name: card.card_name,
                  variant_id: card.variant_id,
                  variant_name: card.variant_name ?? "",
                  rarity: card.rarity ?? "",
                  variant_images: card.variant_images,
                  images: card.images,
                }}
                quantity={localQuantities[card.variant_id] ?? 0}
                showCollectionControls={!!session?.user?.id}
                variant="vault"
                marketPrice={priceFor(card)}
                onSelect={() => setSelectedCard(card)}
                onQuantityChange={handleQuantityChange}
              />
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
        <VaultCardModal
          lang={lang}
          card={selectedCard}
          quantity={selectedQuantity}
          isPending={isPending}
          price={priceFor(selectedCard)}
          priceTrend={selectedCard.listing_market_trend}
          onClose={() => setSelectedCard(null)}
          onIncrement={handleIncrementCollection}
          onDecrement={handleDecrementCollection}
        />
      )}
    </div>
  );
}
