import { neon } from "@neondatabase/serverless";
import fs from "fs";

const sql = neon("postgresql://neondb_owner:npg_8eHU7FbVTpvD@ep-rapid-pond-ahorbczd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require");

// optional CLI filter (same pattern as your other script)
const targetCardIds =
  process.argv.slice(2).length > 0
    ? new Set(process.argv.slice(2))
    : null;

/**
 * Insert base card
 */
async function upsertCard(card, setId = null) {
  await sql`
    INSERT INTO mcc_cards (
      id,
      name,
      supertype,
      types,
      rarity,
      number,
      expansion_id,
      language,
      language_code,
      abilities,
      attacks,
      images,
      expansion,
      translations
    )
    VALUES (
      ${card.id},
      ${card.name},
      ${card.supertype},
      ${card.types},
      ${card.rarity},
      ${card.number},
      ${card.expansion?.id ?? null},
      ${card.language},
      ${card.language_code},
      ${JSON.stringify(card.abilities || [])}::jsonb,
      ${JSON.stringify(card.attacks || [])}::jsonb,
      ${JSON.stringify(card.images || [])}::jsonb,
      ${JSON.stringify(card.expansion || {})}::jsonb,
      ${JSON.stringify(card.translation || {})}::jsonb
    )
    ON CONFLICT (id)
    DO UPDATE SET
      name = EXCLUDED.name,
      supertype = EXCLUDED.supertype,
      types = EXCLUDED.types,
      rarity = EXCLUDED.rarity,
      number = EXCLUDED.number,
      expansion_id = EXCLUDED.expansion_id,
      language = EXCLUDED.language,
      language_code = EXCLUDED.language_code,
      abilities = EXCLUDED.abilities,
      attacks = EXCLUDED.attacks,
      images = EXCLUDED.images,
      expansion = EXCLUDED.expansion,
      translations = EXCLUDED.translations;
  `;
}

/**
 * Insert variants (child rows)
 */
async function upsertVariants(card) {
  if (!Array.isArray(card.variants)) return;

  for (const variant of card.variants || []) {
    await sql`
      INSERT INTO mcc_card_variants (
        card_id,
        name,
        prices,
        pop_reports
      )
      VALUES (
        ${card.id},
        ${variant.name},
        ${JSON.stringify(variant.prices || [])}::jsonb,
        ${JSON.stringify(variant.pop_reports || [])}::jsonb
      )
      ON CONFLICT (card_id, name)
      DO UPDATE SET
        prices = EXCLUDED.prices,
        pop_reports = EXCLUDED.pop_reports;
    `;
  }
}

/**
 * Import runner
 */
async function importCards() {
  const file = fs.readFileSync("./me3.json", "utf-8");
  const json = JSON.parse(file);

  const cards = json.data;

  if (!Array.isArray(cards)) {
    throw new Error("cards.json must contain { data: [] }");
  }

  console.log(`📦 Importing ${cards.length} cards...`);

  for (const card of cards) {
    if (targetCardIds && !targetCardIds.has(card.id)) {
      continue;
    }

    try {
      await upsertCard(card);
      await upsertVariants(card);

      console.log(`✅ Imported: ${card.name}`);
    } catch (err) {
      console.error(`❌ Failed card ${card.id}:`, err.message);
    }
  }

  console.log("🎉 Import complete");
}

importCards();