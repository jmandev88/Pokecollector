import { db } from "../neon";
import { normalizeLanguage } from "@/app/utils/language";

export async function fetchCards(lang: string, setid: string) {
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