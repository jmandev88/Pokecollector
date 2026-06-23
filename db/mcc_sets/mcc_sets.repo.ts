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

export async function fetchSetCount(lang: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM mcc_sets
    WHERE set_language_code = $1
    `,
    [safeLang.toUpperCase()]
  );

  return result.rows[0]?.count ?? 0;
}

export async function fetchSetsGrouped(lang: string) {
  const safeLang = normalizeLanguage(lang);

const result = await db.query(
  `
  SELECT
    s.*,
    COALESCE(sr.series_release_date, MIN(s.set_release_date) OVER (PARTITION BY s.set_series)) AS series_release_date
  FROM mcc_sets s
  LEFT JOIN (
    SELECT
      set_series,
      MIN(set_release_date) AS series_release_date
    FROM mcc_sets
    WHERE set_name = set_series
    GROUP BY set_series
  ) sr ON sr.set_series = s.set_series
  WHERE s.set_language_code = $1
  ORDER BY
    COALESCE(sr.series_release_date, MIN(s.set_release_date) OVER (PARTITION BY s.set_series)) DESC NULLS LAST,
    s.set_release_date DESC NULLS LAST,
    s.set_name ASC
  `,
  [safeLang.toUpperCase()]
);

  return result.rows.reduce((acc, set) => {
    const series = set.set_series || "Other";

    if (!acc[series]) acc[series] = [];

    acc[series].push(set);

    return acc;
  }, {} as Record<string, typeof result.rows>);
}