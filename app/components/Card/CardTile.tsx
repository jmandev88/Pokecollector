// app/components/Card/CardTile.tsx
"use client";

import { useTransition } from "react";
import CardQuantityControls from "./CardQuantityControls";
import { formatVariantName } from "@/app/utils/formatVariantName";
import Image from "next/image";
import AddToCollectionButton from "./AddToCollectionButton";

type CardTileProps = {
  card: {
    id: string;
    name: string;
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
  quantity?: number;
};

export default function CardTile({
  card,
  quantity = 0,
}: CardTileProps) {
  const image =
    card.variant_images?.find((img) => img.type === "front")?.medium ??
    card.images?.find((img) => img.type === "front")?.medium ??
    "/placeholder_card.png";

  return (
    <div className="mb-4 pb-4 border-b border-white/25">
      <Image
        className="w-full"
        src={image}
        alt={card.name}
        width={200}
        height={280}
      />
      
      <div className="text-xs pt-4">
        <div>
            {formatVariantName(card.variant_name)}
        </div>

        <div>
            {card.rarity}
        </div>

        <div className="mt-4">
  <CardQuantityControls
    variantId={card.variant_id}
    quantity={quantity}
  />
</div>
        </div>

    </div>
  );
}