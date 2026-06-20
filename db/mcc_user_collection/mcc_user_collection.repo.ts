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