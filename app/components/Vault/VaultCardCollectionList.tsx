"use client";

import { useMemo, useState } from "react";
import CardTile from "@/app/components/Card/CardTile";

type VaultListCard = {
  id: string;
  name: string;
  expansion_id?: string | null;
  number?: string | null;
  variant_id: string;
  variant_name: string;
  rarity: string;
  variant_images?: {
    type: string;
    medium: string;
  }[];
  images?: {
    type: string;
    medium: string;
  }[];
};

function percent(owned: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((owned / total) * 100);
}

function standardCardKey(card: VaultListCard) {
  if (card.expansion_id && card.number) {
    return `${card.expansion_id}:${card.number}`;
  }

  return card.id;
}

function ProgressBar({
  label,
  owned,
  total,
  color,
}: {
  label: string;
  owned: number;
  total: number;
  color: string;
}) {
  const completion = percent(owned, total);

  return (
    <div className="rounded-xl border border-[#f3dfdb] bg-white/70 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-wide text-[#9b7068]">
            {label}
          </div>
          <div className="mt-1 text-xs font-semibold text-[#704f49]">
            {owned.toLocaleString("en-GB")} / {total.toLocaleString("en-GB")}
          </div>
        </div>
        <div className="text-lg font-black text-[#2c1715]">
          {completion}%
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#d9d9d9]">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${completion}%` }}
        />
      </div>
    </div>
  );
}

export default function VaultCardCollectionList({
  cards,
  collectionMap,
  showCollectionControls,
  emptyMessage,
}: {
  cards: VaultListCard[];
  collectionMap: Record<string, number>;
  showCollectionControls: boolean;
  emptyMessage: string;
}) {
  const [quantities, setQuantities] = useState(collectionMap);

  const progress = useMemo(() => {
    const cardKeys = new Set(cards.map(standardCardKey));
    const variantIds = new Set(cards.map((card) => card.variant_id));
    const ownedCardKeys = new Set<string>();
    const ownedVariantIds = new Set<string>();

    cards.forEach((card) => {
      if ((quantities[card.variant_id] ?? 0) > 0) {
        ownedCardKeys.add(standardCardKey(card));
        ownedVariantIds.add(card.variant_id);
      }
    });

    return {
      standardOwned: ownedCardKeys.size,
      standardTotal: cardKeys.size,
      masterOwned: ownedVariantIds.size,
      masterTotal: variantIds.size,
    };
  }, [cards, quantities]);

  const handleQuantityChange = (variantId: string, quantity: number) => {
    setQuantities((current) => {
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
    <>
      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProgressBar
          label="Standard collection"
          owned={progress.standardOwned}
          total={progress.standardTotal}
          color="bg-blue-500"
        />
        <ProgressBar
          label="Master collection"
          owned={progress.masterOwned}
          total={progress.masterTotal}
          color="bg-green-500"
        />
      </section>

      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {cards.length > 0 ? (
          cards.map((card) => (
            <CardTile
              key={card.id + card.variant_id}
              card={card}
              quantity={quantities[card.variant_id] ?? 0}
              showCollectionControls={showCollectionControls}
              variant="vault"
              onQuantityChange={handleQuantityChange}
            />
          ))
        ) : (
          <p className="col-span-full rounded-xl border border-[#f3dfdb] bg-white/70 p-6 text-sm font-semibold text-[#704f49]">
            {emptyMessage}
          </p>
        )}
      </section>
    </>
  );
}
