import { db } from "../neon";
import { normalizeLanguage } from "@/app/utils/language";

export async function fetchSet(lang: string) {
  const safeLang = normalizeLanguage(lang);
  const result = await db.query(
    `
    SELECT *
    FROM mcc_sets
    WHERE set_language_code = $1
    `,
    [safeLang.toUpperCase()]
  );

  return result.rows || null;
}