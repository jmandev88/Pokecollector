import { db } from "../neon";
import { normalizeLanguage } from "@/app/utils/language";

const PAGE_SIZE = 20;

async function ensureCardStockTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS mcc_card_stock (
      variant_id uuid PRIMARY KEY REFERENCES mcc_card_variants(id) ON DELETE CASCADE,
      quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      price text,
      last_added_at timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.query(`
    ALTER TABLE mcc_card_stock
    ADD COLUMN IF NOT EXISTS price text
  `);

  await db.query(`
    ALTER TABLE mcc_card_stock
    ADD COLUMN IF NOT EXISTS last_added_at timestamptz
  `);

  await db.query(`
    UPDATE mcc_card_stock
    SET last_added_at = updated_at
    WHERE quantity > 0
      AND last_added_at IS NULL
  `);
}

export async function fetchAdminStockCards({
  lang,
  setId,
  query,
  page,
}: {
  lang: string;
  setId?: string;
  query?: string;
  page: number;
}) {
  await ensureCardStockTable();

  const safeLang = normalizeLanguage(lang);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * PAGE_SIZE;
  const filters = ["c.language_code = $1"];
  const values: (string | number)[] = [safeLang.toUpperCase()];

  if (setId) {
    values.push(setId);
    filters.push(`c.expansion_id = $${values.length}`);
  }

  if (query) {
    values.push(`%${query}%`);
    filters.push(`c.name ILIKE $${values.length}`);
  }

  const whereClause = filters.join(" AND ");
  const countResult = await db.query(
    `
    SELECT COUNT(*)::int AS count
    FROM mcc_card_variants v
    INNER JOIN mcc_cards c
      ON c.id = v.card_id
    WHERE ${whereClause}
    `,
    values
  );

  const result = await db.query(
    `
    SELECT
      c.id AS card_id,
      c.name AS card_name,
      c.number,
      c.rarity,
      c.expansion_id,
      c.expansion,
      c.images,

      v.id AS variant_id,
      v.name AS variant_name,
      v.images AS variant_images,

      COALESCE(stock.quantity, 0)::int AS stock_quantity,
      stock.price AS stock_price
    FROM mcc_card_variants v
    INNER JOIN mcc_cards c
      ON c.id = v.card_id
    LEFT JOIN mcc_card_stock stock
      ON stock.variant_id = v.id
    WHERE ${whereClause}
    ORDER BY
      c.expansion_sort_order DESC NULLS LAST,
      c.expansion_id,
      CASE WHEN c.number ~ '^\\d+$' THEN c.number::int END,
      c.number,
      c.name,
      v.name
    LIMIT ${PAGE_SIZE}
    OFFSET $${values.length + 1}
    `,
    [...values, offset]
  );

  return {
    rows: result.rows,
    totalCount: countResult.rows[0]?.count ?? 0,
    page: safePage,
    pageSize: PAGE_SIZE,
  };
}

export async function fetchAdminStockSets(lang: string) {
  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    SELECT
      set_id,
      set_name,
      en_translation,
      set_series,
      set_release_date
    FROM mcc_sets
    WHERE set_language_code = $1
    ORDER BY set_release_date DESC NULLS LAST, set_name
    `,
    [safeLang.toUpperCase()]
  );

  return result.rows;
}

export async function adjustCardStock(variantId: string, delta: number) {
  await ensureCardStockTable();

  await db.query(
    `
    INSERT INTO mcc_card_stock (
      variant_id,
      quantity,
      last_added_at
    )
    VALUES (
      $1,
      GREATEST($2::int, 0),
      CASE WHEN $2::int > 0 THEN now() END
    )
    ON CONFLICT (variant_id)
    DO UPDATE
    SET
      quantity = GREATEST(mcc_card_stock.quantity + $2::int, 0),
      last_added_at = CASE
        WHEN $2::int > 0 THEN now()
        ELSE mcc_card_stock.last_added_at
      END,
      updated_at = now()
    `,
    [variantId, delta]
  );
}

export async function setCardStock(variantId: string, quantity: number) {
  await ensureCardStockTable();

  await db.query(
    `
    INSERT INTO mcc_card_stock (
      variant_id,
      quantity,
      last_added_at
    )
    VALUES (
      $1,
      GREATEST($2::int, 0),
      CASE WHEN $2::int > 0 THEN now() END
    )
    ON CONFLICT (variant_id)
    DO UPDATE
    SET
      quantity = GREATEST($2::int, 0),
      last_added_at = CASE
        WHEN GREATEST($2::int, 0) > mcc_card_stock.quantity THEN now()
        ELSE mcc_card_stock.last_added_at
      END,
      updated_at = now()
    `,
    [variantId, quantity]
  );
}

export async function setCardStockPrice(variantId: string, price: string) {
  await ensureCardStockTable();

  const trimmedPrice = price.trim();

  await db.query(
    `
    INSERT INTO mcc_card_stock (
      variant_id,
      price
    )
    VALUES ($1, NULLIF($2, ''))
    ON CONFLICT (variant_id)
    DO UPDATE
    SET
      price = NULLIF($2, ''),
      updated_at = now()
    `,
    [variantId, trimmedPrice]
  );
}

type VaultStockListing = {
  display_order: number;
  expansion_id: string;
  number: string;
  variant_id?: string | null;
  variant_name?: string | null;
  title: string;
  condition: string;
  seller: string;
  price: string;
  market_trend?: string | null;
};

export async function fetchVaultStockArrivals(
  lang: string,
  listings: VaultStockListing[],
  limit = 8
) {
  await ensureCardStockTable();

  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    WITH listings AS (
      SELECT *
      FROM jsonb_to_recordset($2::jsonb) AS listing(
        display_order int,
        expansion_id text,
        number text,
        variant_id text,
        variant_name text,
        title text,
        condition text,
        seller text,
        price text,
        market_trend text
      )
    )
    SELECT
      listing.title AS listing_title,
      listing.condition AS listing_condition,
      listing.seller AS listing_seller,
      COALESCE(stock.price, listing.price) AS listing_price,
      listing.market_trend AS listing_market_trend,

      c.id AS card_id,
      c.name AS card_name,
      c.number,
      c.rarity,
      c.supertype,
      c.subtypes,
      c.types,
      c.hp,
      c.artist,
      c.printed_number,
      c.regulation_mark,
      c.attacks,
      c.weaknesses,
      c.retreat_cost,
      c.legalities,
      c.national_pokedex_numbers,
      c.images,
      c.expansion,
      c.expansion_id,
      c.expansion_sort_order,

      v.id AS variant_id,
      v.name AS variant_name,
      v.images AS variant_images,
      v.prices AS variant_prices,
      v.pop_reports AS variant_pop_reports,

      stock.quantity AS stock_quantity,
      stock.price AS stock_price,
      stock.last_added_at
    FROM mcc_card_stock stock
    INNER JOIN mcc_card_variants v
      ON v.id = stock.variant_id
    INNER JOIN mcc_cards c
      ON c.id = v.card_id
    LEFT JOIN LATERAL (
      SELECT *
      FROM listings listing
      WHERE (
        listing.variant_id IS NOT NULL
        AND listing.variant_id != ''
        AND listing.variant_id = v.id::text
      )
      OR (
        listing.expansion_id = c.expansion_id
        AND listing.number = c.number
        AND (
          listing.variant_name IS NULL
          OR listing.variant_name = ''
          OR listing.variant_name = v.name
        )
      )
      ORDER BY
        CASE
          WHEN listing.variant_id IS NOT NULL
            AND listing.variant_id != ''
            AND listing.variant_id = v.id::text
          THEN 0
          ELSE 1
        END,
        listing.display_order
      LIMIT 1
    ) listing ON true
    WHERE c.language_code = $1
      AND stock.quantity > 0
      AND stock.last_added_at IS NOT NULL
    ORDER BY stock.last_added_at DESC
    LIMIT $3
    `,
    [safeLang.toUpperCase(), JSON.stringify(listings), limit]
  );

  return result.rows;
}
