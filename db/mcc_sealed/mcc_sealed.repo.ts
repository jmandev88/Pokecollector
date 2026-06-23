import { db } from "../neon";
import { normalizeLanguage } from "@/app/utils/language";

export async function fetchSealed(lang: string) {
  const safeLang = normalizeLanguage(lang);
  const result = await db.query(
    `
    SELECT *
    FROM mcc_sealed
    WHERE language_code = $1
    LIMIT 5
    `,
    [safeLang.toUpperCase()]
  );

  return result.rows || null;
}

export async function fetchSealedCount(lang: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM mcc_sealed
    WHERE language_code = $1
    `,
    [safeLang.toUpperCase()]
  );

  return result.rows[0]?.count ?? 0;
}

export async function fetchSealedGrouped(lang: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    SELECT
      sealed.*,
      sealed.expansion->>'id' AS set_id,
      sealed.expansion->>'series' AS set_series,
      sealed.expansion->>'name' AS set_name,
      sets.details->>'release_date' AS set_release_date
    FROM mcc_sealed sealed
    LEFT JOIN mcc_sets sets
      ON sets.details->>'series' = sealed.expansion->>'series'
      AND sets.details->>'name' = sealed.expansion->>'name'
      AND sets.details->>'language_code' = sealed.language_code
    WHERE sealed.language_code = $1
    ORDER BY
      to_date(sets.details->>'release_date', 'YYYY/MM/DD') DESC
    `,
    [safeLang.toUpperCase()]
  );

  const grouped = result.rows.reduce((acc, sealedProduct) => {
    const series = sealedProduct.set_series || "Other";

    if (!acc[series]) {
      acc[series] = [];
    }

    acc[series].push(sealedProduct);

    return acc;
  }, {} as Record<string, typeof result.rows>);

  return grouped;
}