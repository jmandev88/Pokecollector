export const CARD_LISTING_PAGE_SIZE = 20;

export type CardListingSearchParams = {
  q?: string;
  page?: string;
};

type NamedCard = {
  name?: string | null;
  card_name?: string | null;
};

export function filterCardsByName<T extends NamedCard>(cards: T[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return cards;
  }

  return cards.filter((card) =>
    `${card.name ?? ""} ${card.card_name ?? ""}`
      .toLowerCase()
      .includes(normalizedQuery)
  );
}

export function paginateCards<T>(cards: T[], page: number) {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * CARD_LISTING_PAGE_SIZE;

  return cards.slice(start, start + CARD_LISTING_PAGE_SIZE);
}
