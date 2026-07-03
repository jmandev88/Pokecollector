import Header from "@/app/components/layout/Header/Header";
import {
  fetchCardCount,
  fetchCardCountByPokedexNumber,
  fetchCardCountByRarity,
  fetchCardCountByStamp,
  fetchCardCountByType,
} from "@/db/mcc_cards/mcc_cards.repo";
import { fetchSetCount } from "@/db/mcc_sets/mcc_sets.repo";
import { fetchSealedCount } from "@/db/mcc_sealed/mcc_sealed.repo";
import { fetchCardVariantsCount } from "@/db/mcc_card_variants/mcc_card_variants.repo";
import { getPokemonName } from "../utils/getPokemonName";
import Image from "next/image";
import formatCount from "../utils/formatCount";
import Link from "next/link";
import {
  getCollectionSetStats,
  getFullUserCollection,
} from "@/app/actions/collections.actions";
import { groupCollectionBySet } from "../utils/groupCollectionBySet";
import { mergeCollectionWithStats } from "../utils/mergeCollectionWithStats";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { formatVariantName } from "../utils/formatVariantName";
import { normalizeStampName } from "../utils/normalizeStampName";
import { groupTradesBySet } from "../utils/groupTradesBySet";
import { fetchTradeCandidates } from "@/db/mcc_user_collection/mcc_user_collection.repo";
import {
  fetchLatestOwnedSealedBoosters,
  fetchSealedBoosterCollectionStats,
  fetchSealedBoosterTradeCandidates,
} from "@/db/mcc_user_sealed_collection/mcc_user_sealed_collection.repo";

type ImageItem = {
  type: string;
  small?: string;
  medium?: string;
  large?: string;
};

type CardPreview = {
  id?: string;
  card_id?: string;
  name?: string;
  card_name?: string;
  variant_name?: string;
  variant_images?: ImageItem[];
  images?: ImageItem[];
  owner_name?: string | null;
};

type CollectionSet = {
  expansion_id: string;
  expansionId: string;
  expansion: {
    name?: string;
    series?: string;
  };
  cards: CardPreview[];
  other_cards: CardPreview[];
  stats: {
    card_count: number | string;
    variant_count: number | string;
    owned_card_count: number | string;
    owned_variant_count: number | string;
    completion_normal_percent: number | string;
    completion_master_percent: number | string;
  };
};

type SealedBoosterStats = {
  booster_pack_count: number;
  owned_booster_pack_count: number;
  quantity_count: number;
  completion_percent: string | number | null;
};

type SealedBoosterProduct = {
  sealed_id: string;
  sealed_name: string;
  images?: ImageItem[];
  quantity: number;
};

type SealedBoosterTradeCandidate = SealedBoosterProduct & {
  owner_id: string;
  owner_name: string | null;
};

type OwnedSealedBooster = SealedBoosterProduct & {
  updated_at: string;
};

type CountValue = string | number;

function toNumber(value: CountValue | null | undefined) {
  return Number(value ?? 0);
}

function percentage(value: CountValue, total: CountValue) {
  const totalNumber = toNumber(total);

  if (!totalNumber) {
    return "0%";
  }

  return `${Math.round((toNumber(value) / totalNumber) * 100)}%`;
}

function progressPercent(value: CountValue | null | undefined) {
  return Math.max(0, Math.min(100, toNumber(value)));
}

function cardImage(card: CardPreview) {
  return (
    card.variant_images?.find((image) => image.type === "front")?.medium ??
    card.variant_images?.[0]?.medium ??
    card.images?.find((image) => image.type === "front")?.medium ??
    card.images?.[0]?.medium ??
    "/placeholder_card.png"
  );
}

function sealedImage(product: SealedBoosterProduct) {
  return (
    product.images?.find((image) => image.type === "front")?.medium ??
    product.images?.[0]?.medium ??
    product.images?.[0]?.small ??
    product.images?.[0]?.large ??
    "/placeholder_card.png"
  );
}

function DashboardIcon({
  icon,
  tone = "text-indigo-200 bg-indigo-400/10",
}: {
  icon: string;
  tone?: string;
}) {
  return (
    <span
      className={`material-symbols-outlined flex h-10 w-10 items-center justify-center rounded-md text-[22px] ${tone}`}
    >
      {icon}
    </span>
  );
}

function SectionTitle({
  icon,
  title,
  tone = "text-indigo-200",
}: {
  icon: string;
  title: string;
  tone?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-base font-semibold text-slate-100">
        <span className={`material-symbols-outlined text-[19px] ${tone}`}>
          {icon}
        </span>
        {title}
      </div>
      <span className="text-[10px] uppercase tracking-wide text-slate-500">
        View all
      </span>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  color = "bg-cyan-300",
}: {
  label: string;
  value: CountValue | null | undefined;
  color?: string;
}) {
  return (
    <div className="rounded-md border border-white/5 bg-slate-900/45 p-3">
      <div className="mb-2 text-[10px] uppercase text-slate-500">{label}</div>
      <div className="h-1.5 rounded-full bg-slate-700/80">
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: `${progressPercent(value)}%` }}
        />
      </div>
    </div>
  );
}

export default async function Dashboard({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const session = await getServerSession(authOptions);

  const cardCount = await fetchCardCount(lang);
  const setCount = await fetchSetCount(lang);
  const sealedCount = await fetchSealedCount(lang);
  const cardVariantsCount = await fetchCardVariantsCount(lang);
  const cardCountByRarity = await fetchCardCountByRarity(lang);
  const cardCountByType = await fetchCardCountByType(lang);
  const cardCountByPokedexNumber = await fetchCardCountByPokedexNumber(lang);
  const cardCountByStamp = await fetchCardCountByStamp(lang);

  let setsWithStats: CollectionSet[] = [];
  let cardsOthersHave: CardPreview[] = [];
  let sealedBoosterStats: SealedBoosterStats | null = null;
  let sealedBoosterTrades: SealedBoosterTradeCandidate[] = [];
  let latestOwnedSealedBoosters: OwnedSealedBooster[] = [];

  if (session?.user?.id) {
    const collection = await getFullUserCollection();
    const collectionStats = await getCollectionSetStats();
    const sets = groupCollectionBySet(collection);
    const trades = await fetchTradeCandidates(session.user.id);
    const tradesBySet = groupTradesBySet(trades);

    cardsOthersHave = trades;
    setsWithStats = mergeCollectionWithStats(
      sets,
      collectionStats,
      tradesBySet
    ) as CollectionSet[];
    sealedBoosterStats = await fetchSealedBoosterCollectionStats(
      session.user.id,
      lang
    );
    sealedBoosterTrades = await fetchSealedBoosterTradeCandidates(
      session.user.id,
      lang
    );
    latestOwnedSealedBoosters = await fetchLatestOwnedSealedBoosters(
      session.user.id,
      lang
    );
  }

  const featuredSet = setsWithStats[0];
  const rarityTotal = cardCountByRarity.reduce(
    (total, rarity) => total + toNumber(rarity.card_count),
    0
  );
  const typeTone: Record<string, string> = {
    Water: "border-blue-400/30 bg-blue-950/40 text-blue-300",
    Grass: "border-emerald-400/30 bg-emerald-950/40 text-emerald-300",
    Fire: "border-rose-400/30 bg-rose-950/30 text-rose-300",
    Psychic: "border-purple-400/30 bg-purple-950/35 text-purple-300",
    Colorless: "border-slate-400/25 bg-slate-900/45 text-slate-300",
    Electric: "border-yellow-400/30 bg-yellow-950/25 text-yellow-300",
  };

  return (
    <div className="min-h-screen bg-[#071121] text-slate-100">
      <Header lang={lang} />

      <main className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-8">
        <section className="rounded-lg border border-slate-700/70 bg-slate-900/65 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: "style",
                label: "Total Cards",
                value: cardCount,
                tone: "text-indigo-200 bg-indigo-400/10",
              },
              {
                icon: "layers",
                label: "Variants",
                value: cardVariantsCount,
                tone: "text-slate-200 bg-slate-400/10",
              },
              {
                icon: "select_check_box",
                label: "Complete Sets",
                value: setCount,
                tone: "text-slate-200 bg-slate-400/10",
              },
              {
                icon: "inventory_2",
                label: "Sealed Products",
                value: sealedCount,
                tone: "text-emerald-300 bg-emerald-400/10",
              },
            ].map((stat, index) => (
              <div
                className="flex items-center gap-4 border-slate-700/70 xl:border-r xl:last:border-r-0"
                key={stat.label}
              >
                <DashboardIcon icon={stat.icon} tone={stat.tone} />
                <div className="min-w-0">
                  <div className="text-2xl font-semibold tracking-tight">
                    {formatCount(stat.value)}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                    {stat.label}
                  </div>
                </div>
                {index < 3 && <div className="ml-auto hidden h-10 w-px bg-slate-700/70 xl:block" />}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-7 xl:grid-cols-2">
          <div>
            <SectionTitle icon="workspace_premium" title="Rarity Breakdown" />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {cardCountByRarity.slice(0, 6).map((rarity) => (
                <Link
                  className="rounded-md border border-slate-700/80 bg-slate-900/65 p-4 transition hover:border-indigo-300/60"
                  href={`/${lang}/rarity/${rarity.rarity}`}
                  key={rarity.rarity}
                >
                  <div className="text-xs text-slate-300">{rarity.rarity}</div>
                  <div className="mt-3 flex items-end justify-between">
                    <div className="text-xl font-bold">
                      {formatCount(rarity.card_count)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {percentage(rarity.card_count, rarityTotal)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle
              icon="category"
              title="Type Distribution"
              tone="text-emerald-300"
            />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {cardCountByType.slice(0, 6).map((type) => (
                <Link
                  className={`rounded-md border p-4 transition hover:border-cyan-300/70 ${
                    typeTone[type.card_type] ??
                    "border-slate-700/80 bg-slate-900/65 text-slate-300"
                  }`}
                  href={`/${lang}/type/${type.card_type}`}
                  key={type.card_type}
                >
                  <div className="text-[10px] font-bold uppercase">
                    {type.card_type}
                  </div>
                  <div className="mt-3 text-xl font-bold text-slate-50">
                    {formatCount(type.card_count)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-7 xl:grid-cols-2">
          <div>
            <SectionTitle
              icon="format_list_numbered"
              title="Top Pokedex Entries"
              tone="text-orange-300"
            />
            <div className="grid gap-2 md:grid-cols-2">
              {cardCountByPokedexNumber.slice(0, 4).map((pokedex) => (
                <Link
                  href={`/${lang}/pokedex/${pokedex.pokedex_number}`}
                  key={pokedex.pokedex_number}
                  className="flex items-center justify-between rounded-md border border-slate-700/80 bg-slate-900/65 px-4 py-3 text-sm transition hover:border-orange-300/50"
                >
                  <span>
                    #{pokedex.pokedex_number}{" "}
                    {getPokemonName(pokedex.pokedex_number)}
                  </span>
                  <span className="font-bold text-orange-200">
                    {formatCount(pokedex.card_count)} cards
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle icon="verified" title="Card Stamping" />
            <div className="grid gap-2 md:grid-cols-2">
              {cardCountByStamp.slice(0, 4).map((stamp, index) => (
                <Link
                  href={`/${lang}/stamp/${encodeURIComponent(stamp.stamp)}`}
                  key={stamp.stamp}
                  className={`flex items-center justify-between rounded-md border bg-slate-900/65 px-4 py-3 text-sm transition hover:border-cyan-300/60 ${
                    index === 0 ? "border-cyan-300/70" : "border-slate-700/80"
                  }`}
                >
                  <span>{normalizeStampName(stamp.stamp)}</span>
                  <span className="font-bold text-cyan-200">
                    {formatCount(stamp.collectible_count)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {session?.user?.id && featuredSet && (
          <section className="mt-8 rounded-xl border border-indigo-300/25 bg-slate-900/70 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-12 overflow-hidden rounded border border-slate-700 bg-slate-950">
                  {featuredSet.cards[0] && (
                    <Image
                      src={cardImage(featuredSet.cards[0])}
                      alt={featuredSet.cards[0].card_name ?? "Collection card"}
                      width={80}
                      height={112}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {featuredSet.expansion.name}
                  </h2>
                  <div className="mt-1 text-sm text-slate-400">
                    {featuredSet.expansion.series}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl text-indigo-100">
                  {featuredSet.stats.completion_normal_percent}%
                </div>
                <div className="mt-1 text-[10px] uppercase text-slate-500">
                  Set completion
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ProgressBar
                label={`Standard (${featuredSet.stats.owned_card_count}/${featuredSet.stats.card_count})`}
                value={featuredSet.stats.completion_normal_percent}
                color="bg-indigo-300"
              />
              <ProgressBar
                label={`Master (${featuredSet.stats.owned_variant_count}/${featuredSet.stats.variant_count})`}
                value={featuredSet.stats.completion_master_percent}
                color="bg-emerald-300"
              />
              <div className="rounded-md border border-white/5 bg-slate-900/45 p-3">
                <div className="mb-2 text-[10px] uppercase text-slate-500">
                  Owned variants
                </div>
                <div className="text-lg text-slate-100">
                  {featuredSet.stats.owned_variant_count}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center gap-2 text-[11px] uppercase text-indigo-100">
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>
                  Cards I have
                </div>
                <div className="space-y-2">
                  {featuredSet.cards.slice(0, 2).map((card) => (
                    <div
                      className="flex items-center justify-between rounded bg-slate-950/30 p-3"
                      key={card.card_id ?? card.id}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={cardImage(card)}
                          alt={card.card_name ?? card.name ?? "Card"}
                          width={32}
                          height={44}
                          className="h-10 w-8 rounded object-cover"
                        />
                        <span>{card.card_name ?? card.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {card.variant_name
                          ? formatVariantName(card.variant_name)
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-[11px] uppercase text-slate-400">
                  <span className="material-symbols-outlined text-[16px]">
                    group
                  </span>
                  Cards others have
                </div>
                <div className="space-y-2">
                  {featuredSet.other_cards.slice(0, 2).map((card) => (
                    <div
                      className="flex items-center justify-between rounded bg-slate-950/25 p-3"
                      key={`${card.owner_name}-${card.card_id ?? card.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-8 rounded bg-slate-700" />
                        <span>{card.card_name ?? card.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {card.owner_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href={`/${lang}/sets/${featuredSet.expansionId}`}
                className="rounded-md bg-indigo-200 px-5 py-2 text-xs font-semibold uppercase text-slate-950"
              >
                View set
              </Link>
              <Link
                href={`/${lang}/sets`}
                className="rounded-md border border-slate-600 px-5 py-2 text-xs font-semibold uppercase text-slate-200"
              >
                Checklist
              </Link>
            </div>
          </section>
        )}

        {session?.user?.id && sealedBoosterStats && (
          <section className="mt-1 rounded-xl border border-emerald-300/25 bg-slate-900/70 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-base font-semibold">
                <span className="material-symbols-outlined text-[19px] text-emerald-300">
                  inventory_2
                </span>
                Sealed Booster Packs Collection
              </div>
              <div className="text-right">
                <div className="text-xl text-emerald-300">
                  {sealedBoosterStats.completion_percent ?? 0}%
                </div>
                <div className="mt-1 text-[10px] uppercase text-slate-500">
                  Sealed completion
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ProgressBar
                label={`Standard (${sealedBoosterStats.owned_booster_pack_count}/${sealedBoosterStats.booster_pack_count})`}
                value={sealedBoosterStats.completion_percent}
                color="bg-emerald-300"
              />
              <ProgressBar
                label={`Quantity (${sealedBoosterStats.quantity_count})`}
                value={sealedBoosterStats.completion_percent}
                color="bg-indigo-300"
              />
              <ProgressBar label="Original" value={0} color="bg-rose-300" />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center gap-2 text-[11px] uppercase text-emerald-300">
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>
                  Packs I have
                </div>
                <div className="space-y-2">
                  {latestOwnedSealedBoosters.slice(0, 2).map((product) => (
                    <Link
                      className="flex items-center justify-between rounded bg-slate-950/30 p-3"
                      href={`/${lang}/sealed/${product.sealed_id}`}
                      key={product.sealed_id}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={sealedImage(product)}
                          alt={product.sealed_name}
                          width={36}
                          height={48}
                          className="h-10 w-8 rounded object-contain"
                        />
                        <span>{product.sealed_name}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        qty {product.quantity}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-[11px] uppercase text-slate-400">
                  <span className="material-symbols-outlined text-[16px]">
                    group
                  </span>
                  Packs others have
                </div>
                <div className="space-y-2">
                  {sealedBoosterTrades.slice(0, 2).map((product) => (
                    <Link
                      className="flex items-center justify-between rounded bg-slate-950/25 p-3"
                      href={`/${lang}/sealed/${product.sealed_id}`}
                      key={`${product.owner_id}-${product.sealed_id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={sealedImage(product)}
                          alt={product.sealed_name}
                          width={36}
                          height={48}
                          className="h-10 w-8 rounded object-contain"
                        />
                        <span>{product.sealed_name}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {product.owner_name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Link
                href={`/${lang}/sealed`}
                className="text-xs uppercase tracking-wide text-slate-400 hover:text-emerald-200"
              >
                View all sealed
              </Link>
            </div>
          </section>
        )}

        {session?.user?.id && cardsOthersHave.length > 0 && (
          <section className="mt-10">
            <SectionTitle icon="style" title="Cards Others Have" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
              {cardsOthersHave.slice(0, 6).map((card) => (
                <div
                  className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-3"
                  key={`${card.owner_name}-${card.card_id ?? card.id}`}
                >
                  <Image
                    src={cardImage(card)}
                    alt={card.card_name ?? card.name ?? "Card"}
                    width={200}
                    height={280}
                    className="aspect-[5/7] w-full rounded-md object-cover"
                  />
                  <div className="mt-3 text-sm font-semibold">
                    {card.card_name ?? card.name}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {card.owner_name}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-16 border-t border-slate-700/80 px-8 py-8 text-xs text-slate-400">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">MCC</span>
            <span className="h-4 w-px bg-slate-700" />
            <span>© 2024 Collection Tracker</span>
          </div>
          <div className="flex gap-6">
            <span>Terms</span>
            <span>Privacy</span>
            <span>API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
