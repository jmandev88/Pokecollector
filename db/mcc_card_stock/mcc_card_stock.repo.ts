import { db } from "../neon";
import { CARD_STOCK_CONDITIONS, isCardStockCondition } from "@/app/config/cardStock";
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

  await db.query(`
    CREATE TABLE IF NOT EXISTS mcc_card_stock_lots (
      variant_id uuid NOT NULL REFERENCES mcc_card_variants(id) ON DELETE CASCADE,
      condition text NOT NULL,
      quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      price text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (variant_id, condition)
    )
  `);

  await db.query(`
    ALTER TABLE mcc_card_stock_lots
    ADD COLUMN IF NOT EXISTS price text
  `);

  await db.query(`
    INSERT INTO mcc_card_stock_lots (
      variant_id,
      condition,
      quantity,
      price,
      created_at,
      updated_at
    )
    SELECT
      stock.variant_id,
      'near_mint',
      stock.quantity,
      stock.price,
      stock.updated_at,
      stock.updated_at
    FROM mcc_card_stock stock
    WHERE stock.quantity > 0
      AND NOT EXISTS (
        SELECT 1
        FROM mcc_card_stock_lots lot
        WHERE lot.variant_id = stock.variant_id
      )
    ON CONFLICT (variant_id, condition)
    DO NOTHING
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
      stock.price AS stock_price,
      COALESCE(lots.stock_lots, '[]'::jsonb) AS stock_lots
    FROM mcc_card_variants v
    INNER JOIN mcc_cards c
      ON c.id = v.card_id
    LEFT JOIN mcc_card_stock stock
      ON stock.variant_id = v.id
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(
        jsonb_build_object(
          'condition', lot.condition,
          'quantity', lot.quantity,
          'price', lot.price
        )
        ORDER BY array_position($${values.length + 1}::text[], lot.condition)
      ) AS stock_lots
      FROM mcc_card_stock_lots lot
      WHERE lot.variant_id = v.id
    ) lots ON true
    WHERE ${whereClause}
    ORDER BY
      c.expansion_sort_order DESC NULLS LAST,
      c.expansion_id,
      CASE WHEN c.number ~ '^\\d+$' THEN c.number::int END,
      c.number,
      c.name,
      v.name
    LIMIT ${PAGE_SIZE}
    OFFSET $${values.length + 2}
    `,
    [...values, CARD_STOCK_CONDITIONS.map((condition) => condition.value), offset]
  );

  return {
    rows: result.rows,
    totalCount: countResult.rows[0]?.count ?? 0,
    page: safePage,
    pageSize: PAGE_SIZE,
  };
}

async function syncCardStockSummary(variantId: string, promote: boolean) {
  const result = await db.query(
    `
    WITH summary AS (
      SELECT
        COALESCE(SUM(quantity), 0)::int AS quantity,
        (
          SELECT price
          FROM mcc_card_stock_lots
          WHERE variant_id = $1
            AND quantity > 0
            AND price IS NOT NULL
            AND price != ''
          ORDER BY array_position($2::text[], condition), updated_at DESC
          LIMIT 1
        ) AS price
      FROM mcc_card_stock_lots
      WHERE variant_id = $1
    )
    INSERT INTO mcc_card_stock (
      variant_id,
      quantity,
      price,
      last_added_at
    )
    SELECT
      $1,
      summary.quantity,
      summary.price,
      CASE WHEN $3::boolean AND summary.quantity > 0 THEN now() END
    FROM summary
    ON CONFLICT (variant_id)
    DO UPDATE
    SET
      quantity = EXCLUDED.quantity,
      price = EXCLUDED.price,
      last_added_at = CASE
        WHEN $3::boolean AND EXCLUDED.quantity > 0 THEN now()
        ELSE mcc_card_stock.last_added_at
      END,
      updated_at = now()
    RETURNING quantity
    `,
    [
      variantId,
      CARD_STOCK_CONDITIONS.map((condition) => condition.value),
      promote,
    ]
  );

  return Number(result.rows[0]?.quantity ?? 0);
}

export async function setCardStockLot({
  variantId,
  condition,
  quantity,
  price,
}: {
  variantId: string;
  condition: string;
  quantity: number;
  price: string;
}) {
  await ensureCardStockTable();

  if (!isCardStockCondition(condition)) {
    throw new Error("Invalid stock condition");
  }

  const safeQuantity = Math.max(0, Math.floor(quantity));
  const trimmedPrice = price.trim();
  const previousResult = await db.query(
    `
    SELECT quantity
    FROM mcc_card_stock_lots
    WHERE variant_id = $1
      AND condition = $2
    `,
    [variantId, condition]
  );
  const previousQuantity = Number(previousResult.rows[0]?.quantity ?? 0);

  await db.query(
    `
    INSERT INTO mcc_card_stock_lots (
      variant_id,
      condition,
      quantity,
      price
    )
    VALUES ($1, $2, $3, NULLIF($4, ''))
    ON CONFLICT (variant_id, condition)
    DO UPDATE
    SET
      quantity = EXCLUDED.quantity,
      price = EXCLUDED.price,
      updated_at = now()
    `,
    [variantId, condition, safeQuantity, trimmedPrice]
  );

  return syncCardStockSummary(variantId, safeQuantity > previousQuantity);
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

export async function fetchVaultStockArrivals(lang: string, limit = 8) {
  await ensureCardStockTable();

  const safeLang = normalizeLanguage(lang);

  const result = await db.query(
    `
    SELECT
      c.name AS listing_title,
      NULL::text AS listing_condition,
      NULL::text AS listing_seller,
      stock.price AS listing_price,
      NULL::text AS listing_market_trend,

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
      stock.last_added_at,
      COALESCE(stock_lots.condition_count, 0)::int AS stock_condition_count
    FROM mcc_card_stock stock
    INNER JOIN mcc_card_variants v
      ON v.id = stock.variant_id
    INNER JOIN mcc_cards c
      ON c.id = v.card_id
    LEFT JOIN LATERAL (
      SELECT COUNT(*) AS condition_count
      FROM mcc_card_stock_lots lot
      WHERE lot.variant_id = stock.variant_id
        AND lot.quantity > 0
    ) stock_lots ON true
    WHERE c.language_code = $1
      AND stock.quantity > 0
      AND stock.last_added_at IS NOT NULL
    ORDER BY stock.last_added_at DESC
    LIMIT $2
    `,
    [safeLang.toUpperCase(), limit]
  );

  return result.rows;
}
