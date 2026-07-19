// app/components/Card/CardTile.tsx
"use client";

import CardQuantityControls from "./CardQuantityControls";
import { formatVariantName } from "@/app/utils/formatVariantName";
import Image from "next/image";

type CardTileProps = {
  card: {
    id: string;
    name: string;
    variant_id: string;
    variant_name: string;
    rarity: string;

    variant_images?: {
      type: string;
      medium?: string;
      large?: string;
    }[];

    images?: {
      type: string;
      medium?: string;
      large?: string;
    }[];
  };
  quantity?: number;
  showCollectionControls?: boolean;
  variant?: "default" | "vault";
  marketPrice?: string | null;
  onSelect?: () => void;
  onQuantityChange?: (variantId: string, quantity: number) => void;
};

export default function CardTile({
  card,
  quantity = 0,
  showCollectionControls = true,
  variant = "default",
  marketPrice,
  onSelect,
  onQuantityChange,
}: CardTileProps) {
  const image =
    card.variant_images?.find((img) => img.type === "front")?.medium ??
    card.variant_images?.find((img) => img.type === "front")?.large ??
    card.variant_images?.[0]?.medium ??
    card.variant_images?.[0]?.large ??
    card.images?.find((img) => img.type === "front")?.medium ??
    card.images?.find((img) => img.type === "front")?.large ??
    card.images?.[0]?.medium ??
    card.images?.[0]?.large ??
    "/placeholder_card.png";
  const isVault = variant === "vault";

  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (!onSelect) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={
        isVault
          ? "group flex h-full cursor-pointer flex-col justify-between rounded-xl border border-[#f3dfdb] bg-white/70 p-3 shadow-sm transition hover:-translate-y-1 hover:border-[#efb8af] hover:bg-white hover:shadow-xl"
          : "mb-4 flex flex-col justify-between border-b border-white/25"
      }
    >
      <div
        className={
          isVault
            ? "relative overflow-hidden rounded-lg bg-[#fff0ed] ring-1 ring-[#f3dfdb]"
            : ""
        }
      >
        <Image
          className={
            isVault
              ? "aspect-[5/7] w-full object-contain p-2 transition group-hover:scale-[1.02]"
              : "w-full"
          }
          src={image}
          alt={card.name}
          width={200}
          height={280}
        />
        {marketPrice && (
          <div className="absolute right-2 top-2 rounded-md bg-[#cf160f] px-2 py-1.5 text-[10px] font-black text-white shadow">
            {marketPrice}
          </div>
        )}
      </div>

      <div
        className={
          isVault
            ? "pt-3 text-xs text-[#2c1715]"
            : "mb-4 pt-4 text-xs"
        }
      >
        {showCollectionControls && (
          <div onClick={(event) => event.stopPropagation()}>
            <CardQuantityControls
              variantId={card.variant_id}
              quantity={quantity}
              variant={variant}
              onQuantityChange={(nextQuantity) =>
                onQuantityChange?.(card.variant_id, nextQuantity)
              }
            />
          </div>
        )}

        <div className={showCollectionControls ? "mt-3" : ""}>
          <div
            className={
              isVault
                ? "overflow-hidden text-ellipsis whitespace-nowrap text-sm font-black"
                : "overflow-hidden text-ellipsis whitespace-nowrap"
            }
          >
            {formatVariantName(card.variant_name)
              ? card.name + " - " + formatVariantName(card.variant_name)
              : card.name}
          </div>

          <div
            className={
              isVault
                ? "mt-1 min-h-4 text-[11px] font-semibold text-[#755652]"
                : ""
            }
          >
            {marketPrice ? (
              `Market price: ${marketPrice}`
            ) : (
              card.rarity ?? (
                <span dangerouslySetInnerHTML={{ __html: "&nbsp;" }}></span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
