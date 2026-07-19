"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CARD_STOCK_CONDITIONS } from "@/app/config/cardStock";
import { normalizeStampName } from "@/app/utils/normalizeStampName";

type VaultModalImage = {
  type: string;
  small?: string;
  medium?: string;
  large?: string;
};

export type VaultModalCard = {
  id?: string;
  name?: string;
  listing_title?: string | null;
  listing_price?: string | null;
  listing_market_trend?: string | null;
  card_id?: string;
  card_name?: string;
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
  legalities?: unknown;
  national_pokedex_numbers?: number[] | null;
  images?: VaultModalImage[];
  expansion?: {
    name?: string;
    series?: string;
    release_date?: string;
  } | null;
  expansion_id?: string | null;
  variant_id: string;
  variant_name?: string | null;
  variant_images?: VaultModalImage[];
  stock_lots?: {
    condition: string;
    quantity: number;
    price?: string | null;
  }[];
};

export type VaultCartLot = {
  condition: string;
  quantity: number;
  price?: string | null;
};

function cartLotKey(lot: VaultCartLot, fallbackPrice?: string | null) {
  return `${lot.condition}:${lot.price ?? fallbackPrice ?? "Price pending"}`;
}

function imageFor(card: VaultModalCard) {
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

function titleFor(card: VaultModalCard) {
  return card.listing_title ?? card.card_name ?? card.name ?? "Unknown card";
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

function readableKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function legalityValue(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(legalityValue).filter(Boolean).join(", ") || null;
  }

  if (typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    const status =
      objectValue.status ??
      objectValue.legality ??
      objectValue.value ??
      objectValue.name;

    if (status) {
      return legalityValue(status);
    }

    return (
      Object.entries(objectValue)
        .map(([key, nestedValue]) => {
          const formattedValue = legalityValue(nestedValue);

          return formattedValue ? `${readableKey(key)}: ${formattedValue}` : null;
        })
        .filter(Boolean)
        .join(", ") || null
    );
  }

  return null;
}

function legalitiesSummary(legalities?: unknown) {
  if (!legalities) {
    return "Unknown";
  }

  if (Array.isArray(legalities)) {
    return legalities.map(legalityValue).filter(Boolean).slice(0, 3).join(", ");
  }

  if (typeof legalities !== "object") {
    return legalityValue(legalities) ?? "Unknown";
  }

  return (
    Object.entries(legalities)
      .map(([format, status]) => {
        const formattedStatus = legalityValue(status);

        return formattedStatus ? `${readableKey(format)}: ${formattedStatus}` : null;
      })
      .filter(Boolean)
      .slice(0, 3)
      .join(", ") || "Unknown"
  );
}

export default function VaultCardModal({
  lang,
  card,
  quantity,
  isPending,
  price,
  priceTrend,
  onClose,
  onIncrement,
  onDecrement,
  onAddToCart,
  onRemoveFromCart,
  cartQuantities,
}: {
  lang: string;
  card: VaultModalCard;
  quantity: number;
  isPending: boolean;
  price?: string | null;
  priceTrend?: string | null;
  onClose: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onAddToCart?: (lot: VaultCartLot, quantity: number) => void;
  onRemoveFromCart?: (lot: VaultCartLot, quantity?: number) => void;
  cartQuantities?: Record<string, number>;
}) {
  const variantLabel = card.variant_name
    ? normalizeStampName(card.variant_name)
    : "Standard";
  const setLabel = card.expansion?.name ?? card.expansion_id ?? "Unknown Set";
  const stockedLots = (card.stock_lots ?? []).filter(
    (lot) => Number(lot.quantity ?? 0) > 0
  );
  const [selectedCondition, setSelectedCondition] = useState(
    stockedLots[0]?.condition ?? ""
  );
  const selectedLot = stockedLots.find(
    (lot) => lot.condition === selectedCondition
  );
  const selectedLotCartQuantity = selectedLot
    ? cartQuantities?.[cartLotKey(selectedLot, price)] ?? 0
    : 0;
  const selectedLotRemaining = selectedLot
    ? Math.max(Number(selectedLot.quantity ?? 0) - selectedLotCartQuantity, 0)
    : 0;
  const selectedLotAvailableLabel =
    selectedLotRemaining === 1
      ? "1 available"
      : `${selectedLotRemaining.toLocaleString("en-GB")} available`;

  const conditionLabel = (condition: string) =>
    CARD_STOCK_CONDITIONS.find((option) => option.value === condition)?.label ??
    condition;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
    >
      <div className="flex h-[min(92vh,75vw)] w-full max-w-[860px] flex-col overflow-hidden rounded-2xl bg-[#eee] shadow-2xl md:h-[min(75vh,75vw)] md:max-w-[58vw]">
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex h-full flex-col overflow-hidden"
      >
        <div className="shrink-0 border-b border-[#f5d1ca] bg-[#eeeeec]/95 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#cf160f] px-3 py-1.5 text-[8px] font-black uppercase text-white">
                {variantLabel}
              </span>
              <span className="truncate text-xs font-semibold uppercase tracking-wide text-[#6a4c47]">
                {setLabel}
              </span>
              <h3 className="min-w-0 flex-1 truncate text-xl font-black leading-tight">
                {titleFor(card)}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-[#2c1715] transition hover:bg-white"
            >
              <span className="material-symbols-outlined text-[17px]">
                close
              </span>
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            <div className="flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border border-[#d7e5f8] bg-white/60 p-2">
              <span className="px-1 text-[9px] font-black uppercase text-[#4f617c]">
                Collection
              </span>
              <div className="inline-flex items-center overflow-hidden rounded-lg border border-[#cad9ee] bg-white">
                <button
                  disabled={isPending || quantity <= 0}
                  onClick={onDecrement}
                  className="flex h-9 w-10 items-center justify-center bg-[#eef5ff] text-base font-black text-[#2463a8] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  -
                </button>
                <div className="flex h-9 min-w-12 items-center justify-center px-3 text-sm font-black">
                  {quantity}
                </div>
                <button
                  disabled={isPending}
                  onClick={onIncrement}
                  className="flex h-9 w-10 items-center justify-center bg-[#2463a8] text-base font-black text-white disabled:opacity-60"
                >
                  +
                </button>
              </div>
              <button
                disabled={isPending}
                onClick={onIncrement}
                className="h-9 rounded-lg bg-[#2463a8] px-4 text-xs font-black uppercase text-white transition hover:bg-[#1c4f86] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to Collection
              </button>
            </div>

            {onAddToCart &&
              (selectedLot ? (
                <div className="flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border border-[#f3d4ce] bg-white/60 p-2">
                  <span className="px-1 text-[9px] font-black uppercase text-[#704f49]">
                    Buy stock
                  </span>
                  <select
                    value={selectedCondition}
                    onChange={(event) => setSelectedCondition(event.target.value)}
                    className="h-9 rounded-lg border border-[#efcbc4] bg-white px-3 text-xs font-black text-[#2c1715] outline-none"
                  >
                    {stockedLots.map((lot) => (
                      <option value={lot.condition} key={lot.condition}>
                        {conditionLabel(lot.condition)}
                      </option>
                    ))}
                  </select>

                  <div className="inline-flex items-center overflow-hidden rounded-lg border border-[#efcbc4] bg-white">
                    <button
                      disabled={selectedLotCartQuantity <= 0}
                      onClick={() => onRemoveFromCart?.(selectedLot, 1)}
                      className="flex h-9 w-10 items-center justify-center bg-[#fff2ef] text-base font-black text-[#cf160f] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      -
                    </button>
                    <div className="flex h-9 min-w-12 items-center justify-center px-3 text-sm font-black">
                      {selectedLotCartQuantity}
                    </div>
                    <button
                      disabled={selectedLotRemaining <= 0}
                      onClick={() => onAddToCart(selectedLot, 1)}
                      className="flex h-9 w-10 items-center justify-center bg-[#cf160f] text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] font-black uppercase text-[#704f49]">
                    {selectedLotAvailableLabel}
                  </span>
                  {selectedLotCartQuantity > 0 && (
                    <span className="text-[10px] font-black uppercase text-[#cf160f]">
                      {selectedLotCartQuantity} in basket
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-fit max-w-full rounded-xl border border-[#f3d4ce] bg-white/60 px-3 py-2 text-[10px] font-black uppercase text-[#704f49]">
                  No stock available
                </div>
              ))}

            <div className="inline-flex items-center gap-3 self-end">
              <Link
                href={`/${lang}/sets/${card.expansion_id ?? ""}`}
                className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#cf160f] px-4 text-xs font-black text-white transition hover:bg-[#a9110c]"
              >
                Manage in Vault
              </Link>
              <button className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ffd6ce] text-[#2c1715]">
                <span className="material-symbols-outlined text-[18px]">
                  share
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden md:grid-cols-[40%_60%]">
          <div className="h-full overflow-hidden bg-white p-5">
            <div className="flex h-full items-start justify-center rounded-2xl border-2 border-[#ffe8e5] bg-[#f3f8fa] p-3">
              <Image
                src={imageFor(card)}
                alt={titleFor(card)}
                width={300}
                height={420}
                className="max-h-full w-full object-contain object-top drop-shadow-xl"
              />
            </div>
          </div>

          <div className="min-h-0 overflow-y-scroll bg-[#eeeeec] p-5">
            <div className="rounded-xl bg-white/55 p-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <div className="text-[9px] font-black uppercase text-[#704f49]">
                  Card number
                </div>
                <div className="mt-1 text-xs font-semibold">
                  {card.printed_number ?? card.number ?? "Unknown"}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-black uppercase text-[#704f49]">
                  Supertype
                </div>
                <div className="mt-1 text-xs font-semibold">
                  {card.supertype ?? "Unknown"}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-black uppercase text-[#704f49]">
                  HP
                </div>
                <div className="mt-1 text-xs font-semibold">
                  {card.hp ?? "N/A"}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <div className="text-[9px] font-black uppercase text-[#704f49]">
                  Types
                </div>
                <div className="mt-1 text-xs font-semibold">
                  {compactList(card.types)}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-black uppercase text-[#704f49]">
                  Subtypes
                </div>
                <div className="mt-1 text-xs font-semibold">
                  {compactList(card.subtypes)}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-black uppercase text-[#704f49]">
                  First attack
                </div>
                <div className="mt-1 text-xs font-semibold">
                  {firstNamedItem(card.attacks) ?? "None"}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-black uppercase text-[#704f49]">
                  Weakness
                </div>
                <div className="mt-1 text-xs font-semibold">
                  {firstNamedItem(card.weaknesses) ?? "None"}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-black uppercase text-[#704f49]">
                  Retreat cost
                </div>
                <div className="mt-1 text-xs font-semibold">
                  {compactList(card.retreat_cost)}
                </div>
              </div>

              <div>
                <div className="text-[9px] font-black uppercase text-[#704f49]">
                  Pokedex
                </div>
                <div className="mt-1 text-xs font-semibold">
                  {compactList(card.national_pokedex_numbers)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-[#fff2ef] p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-[9px] font-black uppercase text-[#704f49]">
                  Market price
                </div>
                <div className="mt-1 text-base font-medium">
                  {price ?? "Price pending"}
                </div>
                {priceTrend && (
                  <div className="mt-1 text-[10px] font-bold text-[#15802e]">
                    {priceTrend}
                  </div>
                )}
              </div>

              <div>
                <div className="text-[9px] font-black uppercase text-[#704f49]">
                  Rarity
                </div>
                <div className="mt-1 text-base font-medium">
                  {card.rarity ?? "Unknown"}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[9px] font-black uppercase text-[#704f49]">
                DB details
              </div>
              <div className="mt-2 grid gap-2 text-[10px] font-semibold text-[#704f49] md:grid-cols-2">
                <div>Artist: {card.artist ?? "Unknown"}</div>
                <div>Regulation: {card.regulation_mark ?? "N/A"}</div>
                <div className="md:col-span-2">
                  Legalities: {legalitiesSummary(card.legalities)}
                </div>
              </div>
            </div>
          </div>

          {stockedLots.length > 0 && (
            <div className="mt-4 rounded-xl bg-white/55 p-3">
              <div className="mb-3 text-[9px] font-black uppercase text-[#704f49]">
                Available Stock
              </div>
              <div className="grid gap-2">
                {stockedLots.map((lot) => {
                  const cartQuantity =
                    cartQuantities?.[cartLotKey(lot, price)] ?? 0;
                  const remainingQuantity = Math.max(
                    Number(lot.quantity ?? 0) - cartQuantity,
                    0
                  );

                  return (
                    <div
                      key={lot.condition}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#f3dfdb] bg-white px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-xs font-black text-[#2c1715]">
                          {conditionLabel(lot.condition)}
                        </div>
                        <div className="mt-0.5 text-[10px] font-semibold text-[#704f49]">
                          {remainingQuantity} remaining ·{" "}
                          {lot.price ?? price ?? "Price pending"}
                        </div>
                      </div>
                      {onAddToCart && (
                        <div className="flex shrink-0 items-center gap-2">
                          {cartQuantity > 0 && (
                            <button
                              onClick={() => onRemoveFromCart?.(lot, 1)}
                              className="rounded-md border border-[#f0b9b1] bg-white px-3 py-2 text-[10px] font-black uppercase text-[#cf160f] transition hover:bg-[#fff2ef]"
                            >
                              Remove
                            </button>
                          )}
                          <button
                            disabled={remainingQuantity <= 0}
                            onClick={() => onAddToCart(lot, 1)}
                            className="rounded-md bg-[#cf160f] px-3 py-2 text-[10px] font-black uppercase text-white transition hover:bg-[#a9110c] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {remainingQuantity <= 0 ? "Max" : "Add"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      </div>
    </div>
  );
}
