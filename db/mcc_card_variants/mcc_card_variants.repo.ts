import { db } from "../neon";
import { normalizeLanguage } from "@/app/utils/language";

export async function fetchCardVariants(lang: string, setid: string) {
  const safeLang = normalizeLanguage(lang);
  const result = await db.query(
    `
    SELECT *
    FROM mcc_card_variants
    WHERE language_code = $1 AND expansion_id = $2
    `,
    [safeLang.toUpperCase(), setid]
  );

  return result.rows || null;
}

export async function fetchCardVariantsCount(lang: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM mcc_card_variants
    WHERE language_code = $1
    `,
    [safeLang.toUpperCase()]
  );

  return result.rows[0]?.count ?? 0;
}