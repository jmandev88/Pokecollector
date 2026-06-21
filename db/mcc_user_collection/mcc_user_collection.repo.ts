// db/mcc_user_collection/mcc_user_collection.repo.ts

import { db } from "../neon";

// db/mcc_user_collection/mcc_user_collection.repo.ts

export async function addCardToCollection(
  userId: string,
  variantId: string
) {
  await db.query(
    `
    INSERT INTO mcc_user_collection (
      user_id,
      variant_id,
      quantity
    )
    VALUES ($1, $2, 1)
    ON CONFLICT (user_id, variant_id)
    DO UPDATE
    SET
      quantity = mcc_user_collection.quantity + 1,
      updated_at = now()
    `,
    [userId, variantId]
  );
}

export async function removeCardFromCollection(
  userId: string,
  variantId: string
) {
  await db.query(
    `
    UPDATE mcc_user_collection
    SET
      quantity = quantity - 1,
      updated_at = now()
    WHERE user_id = $1
      AND variant_id = $2
    `,
    [userId, variantId]
  );

  await db.query(
    `
    DELETE
    FROM mcc_user_collection
    WHERE user_id = $1
      AND variant_id = $2
      AND quantity <= 0
    `,
    [userId, variantId]
  );
}

export async function fetchCollectionQuantity(
  userId: string,
  variantId: string
) {
  const result = await db.query(
    `
    SELECT quantity
    FROM mcc_user_collection
    WHERE user_id = $1
      AND variant_id = $2
    `,
    [userId, variantId]
  );

  return result.rows[0]?.quantity ?? 0;
}

export async function fetchUserCollection(
  userId: string
) {
  const result = await db.query(
    `
    SELECT
      variant_id,
      quantity
    FROM mcc_user_collection
    WHERE user_id = $1
    `,
    [userId]
  );

  return result.rows;
}

export async function fetchFullUserCollection(
  userId: string
) {
  const result = await db.query(
    `
    SELECT
      c.expansion_id,
      c.expansion,

      uc.quantity,

      v.id AS variant_id,
      v.name AS variant_name,
      v.images AS variant_images,
      v.prices AS variant_prices,
      v.pop_reports AS variant_pop_reports,
      v.language_code AS variant_language_code,

      c.id AS card_id,
      c.name AS card_name,
      c.number,
      c.rarity,
      c.images,
      c.types,
      c.national_pokedex_numbers,
      c.expansion_sort_order

    FROM mcc_user_collection uc

    INNER JOIN mcc_card_variants v
      ON v.id = uc.variant_id

    LEFT JOIN mcc_cards c
      ON c.id = v.card_id

    WHERE uc.user_id = $1

    ORDER BY
      c.expansion_id,
      c.number::int,
      v.name
    `,
    [userId]
  );

  return result.rows;
}

export async function fetchCollectionSetStats(
  userId: string
) {
  const result = await db.query(
    `
   SELECT
    c.expansion_id,
    c.expansion,

    -- Total cards in the set
    COUNT(DISTINCT c.id) AS card_count,

    -- Total variants in the set
    COUNT(v.id) AS variant_count,

    -- Distinct cards owned
    COUNT(DISTINCT CASE
        WHEN uc.variant_id IS NOT NULL
        THEN c.id
    END) AS owned_card_count,

    -- Distinct variants owned
    COUNT(DISTINCT uc.variant_id) AS owned_variant_count,

    -- Total physical cards owned (duplicates count)
    COALESCE(
        SUM(uc.quantity),
        0
    ) AS quantity_count,

    -- Normal set completion
    ROUND(
        COUNT(DISTINCT CASE
            WHEN uc.variant_id IS NOT NULL
            THEN c.id
        END)::numeric
        /
        COUNT(DISTINCT c.id)::numeric
        * 100,
        1
    ) AS completion_normal_percent,

    -- Master set completion
    ROUND(
        COUNT(DISTINCT uc.variant_id)::numeric
        /
        COUNT(v.id)::numeric
        * 100,
        1
    ) AS completion_master_percent

FROM mcc_card_variants v

INNER JOIN mcc_cards c
    ON c.id = v.card_id

LEFT JOIN mcc_user_collection uc
    ON uc.variant_id = v.id
    AND uc.user_id = $1

GROUP BY
    c.expansion_id,
    c.expansion

HAVING
    COUNT(DISTINCT uc.variant_id) > 0

    `,
    [userId]
  );

  return result.rows;
}

export async function fetchTradeCandidates(
  userId: string
) {
  const result = await db.query(
    `
    SELECT
      u.id AS owner_id,
      u.name AS owner_name,

      c.expansion_id,
      c.expansion,

      c.id AS card_id,
      c.name AS card_name,
      c.number,

      v.id AS variant_id,
      v.name AS variant_name,
      v.images AS variant_images,

      uc.quantity

    FROM mcc_user_collection uc

    INNER JOIN mcc_users u
      ON u.id = uc.user_id

    INNER JOIN mcc_card_variants v
      ON v.id = uc.variant_id

    INNER JOIN mcc_cards c
      ON c.id = v.card_id

    WHERE
      uc.user_id <> $1

      AND NOT EXISTS (
        SELECT 1
        FROM mcc_user_collection mine
        WHERE mine.user_id = $1
        AND mine.variant_id = uc.variant_id
      )

    ORDER BY
      c.expansion_id,
      c.number::int
    `,
    [userId]
  );

  return result.rows;
}