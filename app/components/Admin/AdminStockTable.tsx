"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { updateCardStockLot } from "@/app/actions/adminStock.actions";
import { CARD_STOCK_CONDITIONS } from "@/app/config/cardStock";
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
  stock_lots?: {
    condition: string;
    quantity: number;
    price?: string | null;
  }[];
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

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-[#f3dfdb] bg-white/70 shadow-sm">
      <div className="grid grid-cols-[72px_1fr] gap-4 border-b border-[#f3dfdb] bg-[#fff0ed] px-4 py-3 text-[10px] font-black uppercase text-[#9b7068] md:grid-cols-[72px_1fr_120px_1.7fr]">
        <div>Image</div>
        <div>Card</div>
        <div className="hidden md:block">Set</div>
        <div className="hidden md:block">Conditioned Stock</div>
      </div>

      {cards.map((card) => {
        const lotsByCondition = Object.fromEntries(
          (card.stock_lots ?? []).map((lot) => [lot.condition, lot])
        );

        return (
          <div
            key={card.variant_id}
            className="grid grid-cols-[72px_1fr] gap-4 border-b border-[#f3dfdb] px-4 py-4 last:border-b-0 md:grid-cols-[72px_1fr_120px_1.7fr]"
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
                {formatVariantName(card.variant_name ?? "") ||
                  "Default Variant"}
              </div>
              <div className="mt-1 text-[10px] font-semibold text-[#9b7068] md:hidden">
                {card.expansion?.name ?? card.expansion_id}
              </div>
              <div className="mt-2 inline-flex rounded-full bg-[#fff0ed] px-3 py-1 text-[10px] font-black uppercase text-[#704f49] ring-1 ring-[#f3dfdb]">
                Total {Number(card.stock_quantity ?? 0).toLocaleString("en-GB")}
              </div>
            </div>

            <div className="hidden text-xs font-semibold text-[#704f49] md:block">
              <div>{card.expansion?.name ?? card.expansion_id}</div>
              <div className="mt-1 text-[10px] text-[#9b7068]">
                {card.expansion_id}
              </div>
            </div>

            <div className="col-span-2 rounded-xl border border-[#f3dfdb] bg-[#fff8f6] p-3 md:col-span-1">
              <div className="grid gap-2">
                {CARD_STOCK_CONDITIONS.map((condition) => {
                  const lot = lotsByCondition[condition.value];

                  return (
                    <form
                      action={updateCardStockLot}
                      key={condition.value}
                      className="grid grid-cols-[1fr_72px_92px_auto] items-center gap-2"
                    >
                      <input
                        type="hidden"
                        name="variantId"
                        value={card.variant_id}
                      />
                      <input type="hidden" name="path" value={currentPath} />
                      <input
                        type="hidden"
                        name="condition"
                        value={condition.value}
                      />
                      <div className="truncate text-[10px] font-black uppercase text-[#704f49]">
                        {condition.label}
                      </div>
                      <input
                        name="quantity"
                        type="number"
                        min="0"
                        defaultValue={Number(lot?.quantity ?? 0)}
                        className="h-8 min-w-0 rounded-md border border-[#efcbc4] bg-white px-2 text-xs font-semibold text-[#2c1715] outline-none focus:border-[#cf160f]"
                      />
                      <input
                        name="price"
                        type="text"
                        defaultValue={lot?.price ?? ""}
                        placeholder="£0.00"
                        className="h-8 min-w-0 rounded-md border border-[#efcbc4] bg-white px-2 text-xs font-semibold text-[#2c1715] outline-none focus:border-[#cf160f]"
                      />
                      <button className="h-8 rounded-md bg-[#704f49] px-3 text-[10px] font-black uppercase text-white">
                        Save
                      </button>
                    </form>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
