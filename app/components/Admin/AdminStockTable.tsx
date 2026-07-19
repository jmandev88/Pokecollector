"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  decrementCardStock,
  incrementCardStock,
  updateCardStock,
  updateCardStockPrice,
} from "@/app/actions/adminStock.actions";
import { formatVariantName } from "@/app/utils/formatVariantName";

type AdminStockImage = {
  type: string;
  medium?: string;
  large?: string;
};

type AdminStockCard = {
  card_id: string;
  card_name: string;
  number?: string | null;
  rarity?: string | null;
  expansion_id?: string | null;
  expansion?: {
    name?: string;
    series?: string;
  } | null;
  images?: AdminStockImage[];
  variant_id: string;
  variant_name?: string | null;
  variant_images?: AdminStockImage[];
  stock_quantity: number;
  stock_price?: string | null;
};

function imageFor(card: AdminStockCard) {
  return (
    card.variant_images?.find((image) => image.type === "front")?.medium ??
    card.variant_images?.[0]?.medium ??
    card.images?.find((image) => image.type === "front")?.medium ??
    card.images?.[0]?.medium ??
    "/placeholder_card.png"
  );
}

export default function AdminStockTable({
  cards,
}: {
  cards: AdminStockCard[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const currentPath = search ? `${pathname}?${search}` : pathname;
  const initialQuantities = useMemo(
    () =>
      Object.fromEntries(
        cards.map((card) => [card.variant_id, Number(card.stock_quantity ?? 0)])
      ),
    [cards]
  );
  const [quantities, setQuantities] = useState(initialQuantities);
  const [isPending, startTransition] = useTransition();

  const adjust = (variantId: string, delta: number) => {
    const previous = quantities[variantId] ?? 0;
    const next = Math.max(previous + delta, 0);

    setQuantities((current) => ({
      ...current,
      [variantId]: next,
    }));

    startTransition(async () => {
      try {
        if (delta > 0) {
          await incrementCardStock(variantId, currentPath);
        } else {
          await decrementCardStock(variantId, currentPath);
        }
      } catch {
        setQuantities((current) => ({
          ...current,
          [variantId]: previous,
        }));
      }
    });
  };

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-[#f3dfdb] bg-white/70 shadow-sm">
      <div className="grid grid-cols-[72px_1fr_180px] gap-4 border-b border-[#f3dfdb] bg-[#fff0ed] px-4 py-3 text-[10px] font-black uppercase text-[#9b7068] md:grid-cols-[72px_1fr_120px_200px_220px]">
        <div>Image</div>
        <div>Card</div>
        <div className="hidden md:block">Set</div>
        <div className="hidden md:block">Price</div>
        <div>Stock</div>
      </div>

      {cards.map((card) => (
        <div
          key={card.variant_id}
          className="grid grid-cols-[72px_1fr_180px] gap-4 border-b border-[#f3dfdb] px-4 py-4 last:border-b-0 md:grid-cols-[72px_1fr_120px_200px_220px]"
        >
          <div className="flex h-20 items-center justify-center rounded-lg bg-[#fff0ed] p-1 ring-1 ring-[#f3dfdb]">
            <Image
              src={imageFor(card)}
              alt={card.card_name}
              width={56}
              height={78}
              className="max-h-[72px] w-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <div className="text-sm font-black text-[#2c1715]">
              {card.card_name}
            </div>
            <div className="mt-1 text-xs font-semibold text-[#755652]">
              #{card.number ?? "N/A"} • {card.rarity ?? "Unknown"}
            </div>
            <div className="mt-1 truncate text-[11px] font-semibold text-[#9b7068]">
              {formatVariantName(card.variant_name ?? "") || "Default Variant"}
            </div>
            <div className="mt-1 text-[10px] font-semibold text-[#9b7068] md:hidden">
              {card.expansion?.name ?? card.expansion_id}
            </div>
          </div>

          <div className="hidden text-xs font-semibold text-[#704f49] md:block">
            <div>{card.expansion?.name ?? card.expansion_id}</div>
            <div className="mt-1 text-[10px] text-[#9b7068]">
              {card.expansion_id}
            </div>
          </div>

          <form action={updateCardStockPrice} className="hidden space-y-2 md:block">
            <input type="hidden" name="variantId" value={card.variant_id} />
            <input type="hidden" name="path" value={currentPath} />
            <input
              name="price"
              type="text"
              defaultValue={card.stock_price ?? ""}
              placeholder="£0.00"
              className="h-9 w-full rounded-md border border-[#efcbc4] bg-white px-3 text-xs font-semibold text-[#2c1715] outline-none focus:border-[#cf160f]"
            />
            <button className="h-8 rounded-md bg-[#704f49] px-3 text-[10px] font-black uppercase text-white">
              Save Price
            </button>
          </form>

          <div className="space-y-2">
            <form action={updateCardStockPrice} className="space-y-2 md:hidden">
              <input type="hidden" name="variantId" value={card.variant_id} />
              <input type="hidden" name="path" value={currentPath} />
              <input
                name="price"
                type="text"
                defaultValue={card.stock_price ?? ""}
                placeholder="£0.00"
                className="h-8 w-full rounded-md border border-[#efcbc4] bg-white px-2 text-xs font-semibold text-[#2c1715] outline-none focus:border-[#cf160f]"
              />
              <button className="h-8 rounded-md bg-[#704f49] px-3 text-[10px] font-black uppercase text-white">
                Save Price
              </button>
            </form>

            <div className="flex overflow-hidden rounded-lg border border-[#efcbc4] bg-white">
              <button
                disabled={isPending || (quantities[card.variant_id] ?? 0) <= 0}
                onClick={() => adjust(card.variant_id, -1)}
                className="h-9 w-10 cursor-pointer bg-[#fff2ef] font-black text-[#cf160f] disabled:cursor-not-allowed disabled:opacity-35"
              >
                -
              </button>
              <div className="flex h-9 min-w-12 flex-1 items-center justify-center px-3 text-sm font-black">
                {quantities[card.variant_id] ?? 0}
              </div>
              <button
                disabled={isPending}
                onClick={() => adjust(card.variant_id, 1)}
                className="h-9 w-10 cursor-pointer bg-[#cf160f] font-black text-white disabled:opacity-60"
              >
                +
              </button>
            </div>

            <form action={updateCardStock} className="flex gap-2">
              <input type="hidden" name="variantId" value={card.variant_id} />
              <input type="hidden" name="path" value={currentPath} />
              <input
                name="quantity"
                type="number"
                min="0"
                value={quantities[card.variant_id] ?? 0}
                onChange={(event) =>
                  setQuantities((current) => ({
                    ...current,
                    [card.variant_id]: Math.max(
                      0,
                      Number(event.target.value || 0)
                    ),
                  }))
                }
                className="h-8 min-w-0 flex-1 rounded-md border border-[#efcbc4] bg-white px-2 text-xs font-semibold text-[#2c1715]"
              />
              <button className="h-8 rounded-md bg-[#704f49] px-3 text-[10px] font-black uppercase text-white">
                Set
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
