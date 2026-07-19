"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { signIn, useSession } from "next-auth/react";
import CardTile from "@/app/components/Card/CardTile";
import VaultCardModal, {
  VaultCartLot,
} from "@/app/components/Vault/VaultCardModal";
import { CARD_STOCK_CONDITIONS } from "@/app/config/cardStock";
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
  stock_quantity?: number | string | null;
  stock_condition_count?: number | string | null;
  stock_lots?: {
    condition: string;
    quantity: number;
    price?: string | null;
  }[];
};

type CartItem = {
  key: string;
  variantId: string;
  title: string;
  condition: string;
  price: string;
  quantity: number;
  maxQuantity: number;
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

const CART_SESSION_STORAGE_KEY = "mcc-vault-basket";

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.key === "string" &&
    typeof item.variantId === "string" &&
    typeof item.title === "string" &&
    typeof item.condition === "string" &&
    typeof item.price === "string" &&
    typeof item.quantity === "number" &&
    typeof item.maxQuantity === "number" &&
    item.quantity > 0 &&
    item.maxQuantity > 0
  );
}

function readSessionCartItems() {
  try {
    const savedCart = window.sessionStorage.getItem(CART_SESSION_STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    const parsedCart: unknown = JSON.parse(savedCart);

    return Array.isArray(parsedCart) ? parsedCart.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

function priceFor(card: VaultCard) {
  return card.listing_price ?? "Price pending";
}

function stockNoticeFor(card: VaultCard) {
  const quantity = Number(card.stock_quantity ?? 0);
  const conditionCount = Number(card.stock_condition_count ?? 0);

  if (quantity <= 0) {
    return null;
  }

  if (conditionCount > 1) {
    return `${quantity} in stock · ${conditionCount} conditions`;
  }

  if (conditionCount === 1) {
    return `${quantity} in stock · 1 condition`;
  }

  return `${quantity} in stock`;
}

function conditionLabel(condition: string) {
  return (
    CARD_STOCK_CONDITIONS.find((option) => option.value === condition)?.label ??
    condition
  );
}

function cartLotKey({
  variantId,
  condition,
  price,
}: {
  variantId: string;
  condition: string;
  price: string;
}) {
  return `${variantId}:${condition}:${price}`;
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasLoadedCartSession, setHasLoadedCartSession] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [localQuantities, setLocalQuantities] = useState(() =>
    Object.fromEntries(
      ownedVariants.map((variant) => [variant.variantId, variant.quantity])
    )
  );
  const [isPending, startTransition] = useTransition();
  const featuredCards = cards.slice(0, 8);

  useEffect(() => {
    setCartItems(readSessionCartItems());
    setHasLoadedCartSession(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedCartSession) {
      return;
    }

    window.sessionStorage.setItem(
      CART_SESSION_STORAGE_KEY,
      JSON.stringify(cartItems)
    );
  }, [cartItems, hasLoadedCartSession]);

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

  const handleAddToCart = (
    card: VaultCard,
    lot: VaultCartLot,
    quantity: number,
    openCart = true
  ) => {
    const title = card.listing_title ?? card.card_name;
    const price = lot.price ?? card.listing_price ?? "Price pending";
    const key = cartLotKey({
      variantId: card.variant_id,
      condition: lot.condition,
      price,
    });
    const maxQuantity = Number(lot.quantity ?? 0);

    setCartItems((current) => {
      const existingItem = current.find((item) => item.key === key);
      const currentQuantity = existingItem?.quantity ?? 0;
      const quantityToAdd = Math.min(
        Math.max(quantity, 0),
        Math.max(maxQuantity - currentQuantity, 0)
      );

      if (quantityToAdd <= 0) {
        return current;
      }

      if (existingItem) {
        return current.map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantityToAdd, maxQuantity),
                maxQuantity,
              }
            : item
        );
      }

      return [
        ...current,
        {
          key,
          variantId: card.variant_id,
          title,
          condition: lot.condition,
          price,
          quantity: quantityToAdd,
          maxQuantity,
        },
      ];
    });
    if (openCart) {
      setIsCartOpen(true);
    }
  };

  const handleRemoveFromCart = (
    card: VaultCard,
    lot: VaultCartLot,
    quantity = 1
  ) => {
    const price = lot.price ?? card.listing_price ?? "Price pending";
    const key = cartLotKey({
      variantId: card.variant_id,
      condition: lot.condition,
      price,
    });

    setCartItems((current) =>
      current.flatMap((item) => {
        if (item.key !== key) {
          return [item];
        }

        const nextQuantity = item.quantity - Math.max(quantity, 1);

        return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
      })
    );
  };

  const handleRemoveCartItem = (key: string) => {
    setCartItems((current) => current.filter((item) => item.key !== key));
  };

  const handleDecrementCartItem = (key: string) => {
    setCartItems((current) =>
      current.flatMap((item) => {
        if (item.key !== key) {
          return [item];
        }

        const nextQuantity = item.quantity - 1;

        return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
      })
    );
  };

  const cartQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const selectedCardCartQuantities = selectedCard
    ? Object.fromEntries(
        cartItems
          .filter((item) => item.variantId === selectedCard.variant_id)
          .map((item) => [
            `${item.condition}:${item.price}`,
            item.quantity,
          ])
      )
    : {};

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
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0ed] text-[#cf160f] ring-1 ring-[#f0d4cf] transition hover:bg-[#ffe2dc]"
            >
              <span className="material-symbols-outlined text-[20px]">
                shopping_basket
              </span>
              {cartQuantity > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#cf160f] px-1 text-[10px] font-black text-white">
                  {cartQuantity}
                </span>
              )}
            </button>
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
                showCollectionControls={false}
                variant="vault"
                marketPrice={priceFor(card)}
                stockNotice={stockNoticeFor(card)}
                onSelect={() => setSelectedCard(card)}
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
          cartQuantities={selectedCardCartQuantities}
          onAddToCart={(lot, quantity) =>
            handleAddToCart(selectedCard, lot, quantity, false)
          }
          onRemoveFromCart={(lot, quantity) =>
            handleRemoveFromCart(selectedCard, lot, quantity)
          }
        />
      )}

      {isCartOpen && (
        <div
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
        >
          <aside
            onClick={(event) => event.stopPropagation()}
            className="flex h-full w-full max-w-[420px] flex-col bg-[#fff8f6] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#f3dfdb] px-5 py-5">
              <div>
                <h3 className="text-lg font-black text-[#2c1715]">Basket</h3>
                <div className="mt-1 text-xs font-semibold text-[#704f49]">
                  {cartQuantity.toLocaleString("en-GB")} item
                  {cartQuantity === 1 ? "" : "s"}
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff0ed] text-[#2c1715] transition hover:bg-[#ffe2dc]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cartItems.length > 0 ? (
                <div className="grid gap-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.key}
                      className="rounded-xl border border-[#f3dfdb] bg-white/75 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black text-[#2c1715]">
                            {item.title}
                          </div>
                          <div className="mt-1 text-[10px] font-black uppercase text-[#704f49]">
                            {conditionLabel(item.condition)}
                          </div>
                        </div>
                        <div className="text-right text-sm font-black text-[#cf160f]">
                          {item.price}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[#704f49]">
                        <span>Quantity</span>
                        <span>
                          x{item.quantity} / {item.maxQuantity}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDecrementCartItem(item.key)}
                          className="rounded-md border border-[#f0b9b1] bg-white px-3 py-2 text-[10px] font-black uppercase text-[#cf160f] transition hover:bg-[#fff2ef]"
                        >
                          Remove 1
                        </button>
                        <button
                          onClick={() => handleRemoveCartItem(item.key)}
                          className="rounded-md bg-[#fff0ed] px-3 py-2 text-[10px] font-black uppercase text-[#704f49] transition hover:bg-[#ffe2dc]"
                        >
                          Remove All
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-[#f3dfdb] bg-white/70 p-6 text-sm font-semibold text-[#704f49]">
                  Your basket is empty.
                </div>
              )}
            </div>

            <div className="border-t border-[#f3dfdb] p-5">
              <button
                disabled
                className="h-11 w-full rounded-lg bg-[#cf160f] text-xs font-black uppercase text-white opacity-60"
              >
                Checkout coming soon
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
