import { db } from "../neon";
import { normalizeLanguage } from "@/app/utils/language";

export async function addSealedToCollection(
  userId: string,
  sealedId: string
) {
  await db.query(
    `
    INSERT INTO mcc_user_sealed_collection (
      user_id,
      sealed_id,
      quantity
    )
    VALUES ($1, $2, 1)
    ON CONFLICT (user_id, sealed_id)
    DO UPDATE
    SET
      quantity = mcc_user_sealed_collection.quantity + 1,
      updated_at = now()
    `,
    [userId, sealedId]
  );
}

export async function removeSealedFromCollection(
  userId: string,
  sealedId: string
) {
  await db.query(
    `
    UPDATE mcc_user_sealed_collection
    SET
      quantity = quantity - 1,
      updated_at = now()
    WHERE user_id = $1
      AND sealed_id = $2
    `,
    [userId, sealedId]
  );

  await db.query(
    `
    DELETE
    FROM mcc_user_sealed_collection
    WHERE user_id = $1
      AND sealed_id = $2
      AND quantity <= 0
    `,
    [userId, sealedId]
  );
}

export async function fetchUserSealedCollection(
  userId: string
) {
  const result = await db.query(
    `
    SELECT
      sealed_id,
      quantity
    FROM mcc_user_sealed_collection
    WHERE user_id = $1
    `,
    [userId]
  );

  return result.rows;
}

export async function fetchSealedBoosterCollectionStats(
  userId: string,
  lang: string
) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    SELECT
      COUNT(sealed.id)::int AS booster_pack_count,
      COUNT(DISTINCT uc.sealed_id)::int AS owned_booster_pack_count,
      COALESCE(SUM(uc.quantity), 0)::int AS quantity_count,
      ROUND(
        COUNT(DISTINCT uc.sealed_id)::numeric
        /
        NULLIF(COUNT(sealed.id), 0)::numeric
        * 100,
        1
      ) AS completion_percent
    FROM mcc_sealed sealed
    LEFT JOIN mcc_user_sealed_collection uc
      ON uc.sealed_id = sealed.id
      AND uc.user_id = $1
    WHERE sealed.language_code = $2
      AND sealed.type = 'Booster Pack'
      AND (
        sealed.name = (sealed.expansion->>'name') || ' Booster Pack'
        OR sealed.name = 'Base Set Booster Pack'
      )
    `,
    [userId, safeLang.toUpperCase()]
  );

  return result.rows[0];
}

export async function fetchSealedBoosterTradeCandidates(
  userId: string,
  lang: string
) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    SELECT
      u.id AS owner_id,
      u.name AS owner_name,

      sealed.id AS sealed_id,
      sealed.name AS sealed_name,
      sealed.images,
      sealed.expansion,
      sealed.expansion_sort_order,

      uc.quantity
    FROM mcc_user_sealed_collection uc

    INNER JOIN mcc_users u
      ON u.id = uc.user_id

    INNER JOIN mcc_sealed sealed
      ON sealed.id = uc.sealed_id

    WHERE uc.user_id <> $1
      AND sealed.language_code = $2
      AND sealed.type = 'Booster Pack'
      AND (
        sealed.name = (sealed.expansion->>'name') || ' Booster Pack'
        OR sealed.name = 'Base Set Booster Pack'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM mcc_user_sealed_collection mine
        WHERE mine.user_id = $1
          AND mine.sealed_id = uc.sealed_id
      )

    ORDER BY
      sealed.expansion_sort_order,
      sealed.name,
      u.name
    `,
    [userId, safeLang.toUpperCase()]
  );

  return result.rows;
}
