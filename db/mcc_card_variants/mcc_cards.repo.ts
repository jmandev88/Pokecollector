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