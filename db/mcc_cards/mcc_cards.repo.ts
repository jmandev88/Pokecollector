import { db } from "../neon";
import { normalizeLanguage } from "@/app/utils/language";

export async function fetchCardsByExpansion(lang: string, setid: string) {
  const safeLang = normalizeLanguage(lang);
  const result = await db.query(
    `
    SELECT *
    FROM mcc_cards
    WHERE language_code = $1 AND expansion_id = $2
    `,
    [safeLang.toUpperCase(), setid]
  );

  return result.rows || null;
}

export async function fetchCardsByRarity(lang: string, setid: string) {
  const safeLang = normalizeLanguage(lang);
  const result = await db.query(
    `
    SELECT *
    FROM mcc_cards
    WHERE language_code = $1 AND rarity = $2
    `,
    [safeLang.toUpperCase(), setid]
  );

  return result.rows || null;
}

export async function fetchCardsByPokedexNumber( lang: string, pokedexNumber: number) {
  const safeLang = normalizeLanguage(lang);
  const result = await db.query(
    `
    SELECT *
    FROM mcc_cards
    WHERE language_code = $1
      AND national_pokedex_numbers @> $2::jsonb
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
    SELECT *
    FROM mcc_cards
    WHERE language_code = $1
      AND types @> $2::jsonb
    `,
    [
      safeLang.toUpperCase(),
      JSON.stringify([type]),
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