// app/components/Card/CardTile.tsx

import { formatVariantName } from "@/app/utils/formatVariantName";
import Image from "next/image";

type CardTileProps = {
  card: {
    id: string;
    name: string;
    variant_name: string;
    variant_images?: {
      type: string;
      medium: string;
    }[];
    rarity: string;
    images?: {
      type: string;
      medium: string;
    }[];
  };
};

export default function CardTile({ card }: CardTileProps) {
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
      <div className="text-xs justify-between pt-4">
        <div>
            {formatVariantName(card.variant_name)}
        </div>
        <div>
            {card.rarity}
        </div>
      </div>
    </div>
  );
}