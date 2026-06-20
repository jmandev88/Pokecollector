// app/components/Card/CardTile.tsx

import Image from "next/image";

type CardTileProps = {
  card: {
    id: string;
    name: string;
    variant_name: string;
    images?: {
      type: string;
      medium: string;
    }[];
  };
};

export default function CardTile({ card }: CardTileProps) {
  const image =
    card.images?.find((img) => img.type === "front")?.medium ??
    "/placeholder_card.png";

  return (
    <div>
      <Image
        className="w-full"
        src={image}
        alt={card.name}
        width={200}
        height={280}
      />
      <div>{card.variant_name}</div>
    </div>
  );
}