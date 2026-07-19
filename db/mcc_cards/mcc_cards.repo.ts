import { db } from "../neon";
import { normalizeLanguage } from "@/app/utils/language";

const CARD_SELECT = `
  SELECT
    c.*,

    v.id AS variant_id,
    v.card_id AS variant_card_id,
    v.name AS variant_name,
    v.prices AS variant_prices,
    v.pop_reports AS variant_pop_reports,
    v.language_code AS variant_language_code,
    v.images AS variant_images

  FROM mcc_cards c
  LEFT JOIN mcc_card_variants v
    ON v.card_id = c.id

`;

const CARD_ORDER = `
ORDER BY
  CASE
    WHEN c.number ~ '^\\d+$'
    THEN c.number::int
  END,
  c.number
`;

export async function fetchCardsByExpansion(lang: string, setid: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    ${CARD_SELECT}
    WHERE c.language_code = $1
      AND c.expansion_id = $2
  ${CARD_ORDER}
    `,
    [safeLang.toUpperCase(), setid]
  );

  return result.rows || null;
}

export async function fetchCardsByRarity(lang: string, rarity: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    ${CARD_SELECT}
    WHERE c.language_code = $1
      AND c.rarity = $2
  ${CARD_ORDER}
    `,
    [safeLang.toUpperCase(), decodeURIComponent(rarity)]
  );

  return result.rows || null;
}

export async function fetchCardsByPokedexNumber(lang: string, pokedexNumber: number) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    ${CARD_SELECT}
    WHERE c.language_code = $1
      AND c.national_pokedex_numbers @> $2::jsonb
  ${CARD_ORDER}
    `,
    [
      safeLang.toUpperCase(),
      JSON.stringify([Number(pokedexNumber)]),
    ]
  );

  return result.rows || null;
}

export async function fetchCardsByType(lang: string, type: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    ${CARD_SELECT}
    WHERE c.language_code = $1
      AND c.types @> $2::jsonb
  ${CARD_ORDER}
    `,
    [
      safeLang.toUpperCase(),
      JSON.stringify([decodeURIComponent(type)]),
    ]
  );

  return result.rows || null;
}

export async function fetchCardsByStamp(lang: string, stamp: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    ${CARD_SELECT}
    WHERE c.language_code = $1
      AND v.name = $2
  ${CARD_ORDER}
    `,
    [safeLang.toUpperCase(), decodeURIComponent(stamp)]
  );

  return result.rows || null;
}

type VaultMarketplaceListing = {
  display_order: number;
  expansion_id: string;
  number: string;
  variant_id?: string | null;
  variant_name?: string | null;
  title: string;
  condition: string;
  seller: string;
  price: string;
  market_trend?: string | null;
};

export async function fetchVaultMarketplaceArrivals(
  lang: string,
  listings: VaultMarketplaceListing[]
) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    WITH listings AS (
      SELECT *
      FROM jsonb_to_recordset($2::jsonb) AS listing(
        display_order int,
        expansion_id text,
        number text,
        variant_id text,
        variant_name text,
        title text,
        condition text,
        seller text,
        price text,
        market_trend text
      )
    ),
    matched_listings AS (
      SELECT DISTINCT ON (listing.display_order)
        listing.display_order,
        listing.title AS listing_title,
        listing.condition AS listing_condition,
        listing.seller AS listing_seller,
        listing.price AS listing_price,
        listing.market_trend AS listing_market_trend,

        c.id AS card_id,
        c.name AS card_name,
        c.number,
        c.rarity,
        c.supertype,
        c.subtypes,
        c.types,
        c.hp,
        c.artist,
        c.printed_number,
        c.regulation_mark,
        c.attacks,
        c.weaknesses,
        c.retreat_cost,
        c.legalities,
        c.national_pokedex_numbers,
        c.images,
        c.expansion,
        c.expansion_id,
        c.expansion_sort_order,

        v.id AS variant_id,
        v.name AS variant_name,
        v.images AS variant_images,
        v.prices AS variant_prices,
        v.pop_reports AS variant_pop_reports
      FROM listings listing
      INNER JOIN mcc_cards c
        ON c.expansion_id = listing.expansion_id
        AND c.number = listing.number
      INNER JOIN mcc_card_variants v
        ON v.card_id = c.id
        AND (
          listing.variant_id IS NULL
          OR listing.variant_id = ''
          OR v.id::text = listing.variant_id
        )
        AND (
          listing.variant_name IS NULL
          OR listing.variant_name = ''
          OR v.name = listing.variant_name
        )
      WHERE c.language_code = $1
        AND v.images IS NOT NULL
        AND jsonb_array_length(v.images) > 0
      ORDER BY
        listing.display_order,
        CASE
          WHEN listing.variant_id IS NOT NULL
            AND listing.variant_id != ''
            AND v.id::text = listing.variant_id
          THEN 0
          ELSE 1
        END,
        CASE
          WHEN listing.variant_name IS NOT NULL
            AND listing.variant_name != ''
            AND v.name = listing.variant_name
          THEN 0
          ELSE 1
        END
    )
    SELECT
      *
    FROM matched_listings
    ORDER BY display_order
    `,
    [safeLang.toUpperCase(), JSON.stringify(listings)]
  );

  return result.rows;
}

export async function fetchCardCount(lang: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM mcc_cards
    WHERE language_code = $1
    `,
    [safeLang.toUpperCase()]
  );

  return result.rows[0]?.count ?? 0;
}

export async function fetchCardCountByRarity(lang: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
      SELECT
          c.rarity,
          COUNT(*) AS card_count,
          SUM(
              CASE
                  WHEN variant_counts.variant_count IS NULL THEN 1
                  ELSE variant_counts.variant_count
              END
          ) AS collectible_count
      FROM mcc_cards c
      LEFT JOIN (
          SELECT
              card_id,
              COUNT(*) AS variant_count
          FROM mcc_card_variants
          GROUP BY card_id
      ) variant_counts
          ON variant_counts.card_id = c.id
      WHERE c.language_code = $1
      AND c.rarity IS NOT NULL
      AND c.rarity != 'None'
      GROUP BY c.rarity
      ORDER BY collectible_count DESC;
    `,
    [safeLang.toUpperCase()]
  );
  return result.rows;

}

export async function fetchCardCountByType(lang: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    SELECT
        card_type,
        COUNT(*) AS card_count,
        SUM(
            CASE
                WHEN variant_counts.variant_count IS NULL THEN 1
                ELSE variant_counts.variant_count
            END
        ) AS collectible_count
    FROM (
        SELECT
            c.id,
            jsonb_array_elements_text(c.types) AS card_type
        FROM mcc_cards c
        WHERE c.language_code = $1
          AND c.types IS NOT NULL
          AND jsonb_array_length(c.types) > 0
    ) cards_by_type
    LEFT JOIN (
        SELECT
            card_id,
            COUNT(*) AS variant_count
        FROM mcc_card_variants
        GROUP BY card_id
    ) variant_counts
        ON variant_counts.card_id = cards_by_type.id
    GROUP BY card_type
    ORDER BY collectible_count DESC;
    `,
    [safeLang.toUpperCase()]
  );

  return result.rows;
}

export async function fetchCardCountByStamp(lang: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    SELECT
        v.name AS stamp,
        COUNT(DISTINCT c.id) AS card_count,
        COUNT(v.id) AS collectible_count
    FROM mcc_card_variants v
    INNER JOIN mcc_cards c
        ON c.id = v.card_id
    WHERE c.language_code = $1
      AND v.name IS NOT NULL
      AND v.name != ''
    GROUP BY v.name
    ORDER BY collectible_count DESC, v.name;
    `,
    [safeLang.toUpperCase()]
  );

  return result.rows;
}

export async function fetchCardCountByPokedexNumber(lang: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    SELECT
        pokedex_number,
        COUNT(*) AS card_count,
        SUM(
            COALESCE(variant_counts.variant_count, 1)
        ) AS collectible_count
    FROM (
        SELECT
            c.id,
            (jsonb_array_elements(c.national_pokedex_numbers))::int AS pokedex_number
        FROM mcc_cards c
        WHERE c.language_code = $1
          AND c.national_pokedex_numbers IS NOT NULL
          AND jsonb_array_length(c.national_pokedex_numbers) > 0
    ) cards_by_number
    LEFT JOIN (
        SELECT
            card_id,
            COUNT(*) AS variant_count
        FROM mcc_card_variants
        GROUP BY card_id
    ) variant_counts
      ON variant_counts.card_id = cards_by_number.id
    GROUP BY pokedex_number
    ORDER BY pokedex_number;
    `,
    [safeLang.toUpperCase()]
  );

  return result.rows;
}
