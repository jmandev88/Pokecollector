import Header from "@/app/components/layout/Header/Header";
import SealedQuantityControls from "@/app/components/Sealed/SealedQuantityControls";
import { fetchSealedGrouped } from "@/db/mcc_sealed/mcc_sealed.repo";
import { fetchUserSealedCollection } from "@/db/mcc_user_sealed_collection/mcc_user_sealed_collection.repo";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type SealedImage = {
  type: string;
  large: string;
  medium?: string;
  small?: string;
};

type SealedVariant = {
  name: string;
  images?: SealedImage[];
  prices?: unknown[];
  marketplaces?: unknown[];
};

type SealedProduct = {
  id: string;
  name: string;
  en_translation?: string | null;
  images?: SealedImage[];
  variants?: SealedVariant[];
};

type SealedProductWithVariant = SealedProduct & {
  variantName: string | null;
  variantImage?: SealedImage;
};

type GroupedSealed = Record<string, SealedProduct[]>;

export default async function Sealed({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/en");
  }

  const groupedSealed = (await fetchSealedGrouped(lang)) as GroupedSealed;
  const collection = await fetchUserSealedCollection(session.user.id);
  const collectionMap = Object.fromEntries(
    collection.map((product) => [
      product.sealed_id,
      product.quantity,
    ])
  );

 const flattenedSealed = Object.entries(groupedSealed).reduce<
  Record<string, SealedProductWithVariant[]>
>((acc, [series, products]) => {
  acc[series] = products.flatMap(
    (product): SealedProductWithVariant[] => {
      if (!product.variants?.length) {
        return [
          {
            ...product,
            variantName: null,
            variantImage: product.images?.[0],
          },
        ];
      }

      return product.variants.map(
        (variant): SealedProductWithVariant => ({
          ...product,
          variantName: variant.name,
          variantImage:
            variant.images?.find((image) => image.type === "front") ||
            variant.images?.[0],
        })
      );
    }
  );

  return acc;
}, {});

  return (
    <div className="min-h-screen min-w-full bg-gray-800 text-white">
      <Header lang={lang} />

      <div className="container min-w-full mx-auto p-4">
        <div className="space-y-12">
          {Object.entries(flattenedSealed).map(([series, products]) => (
            <div key={series}>
              <h2 className="mb-6 text-3xl font-bold">{series}</h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                {products.map((product) => (
                  <div
                    key={`${product.id}-${product.variantName ?? "default"}`}
                    className="h-80 rounded-md border border-gray-500 bg-gray-700 p-4"
                  >
                    <div className="flex h-full flex-col justify-between">
                      <Link href={`/${lang}/sealed/${product.id}`}>
                        <div>
                          <h3 className="text-lg font-bold">
                            {product.en_translation || product.name}
                          </h3>

                          {product.variantName && (
                            <div className="mt-1 text-sm text-yellow-400 capitalize">
                              {product.variantName}
                            </div>
                          )}

                          {product.variantImage?.large && (
                            <div className="mt-4">
                              <Image
                                src={product.variantImage.large}
                                alt={`${product.name} ${
                                  product.variantName ?? ""
                                }`}
                                width={200}
                                height={200}
                                className="mx-auto h-32 object-contain"
                              />
                            </div>
                          )}
                        </div>
                      </Link>

                      <SealedQuantityControls
                        sealedId={product.id}
                        quantity={collectionMap[product.id] ?? 0}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
