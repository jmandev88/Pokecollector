import { db } from "../neon";
import { normalizeLanguage } from "@/app/utils/language";

export async function fetchSealed(lang: string) {
  const safeLang = normalizeLanguage(lang);
  const result = await db.query(
    `
    SELECT *
    FROM mcc_sealed
    WHERE language_code = $1
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