import { neon } from "@neondatabase/serverless";
import fs from "fs";

const sql = neon("postgresql://neondb_owner:npg_8eHU7FbVTpvD@ep-rapid-pond-ahorbczd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require");

// Optional CLI filter
const targetSetIds =
  process.argv.slice(2).length > 0
    ? new Set(process.argv.slice(2))
    : null;

async function upsertSet(set) {
  await sql`
    INSERT INTO mcc_sets (
      set_id,
      details,
      set_name,
      set_series,
      set_code,
      set_total,
      set_printed_total,
      set_language,
      set_language_code,
      set_is_online_only,
      set_logo,
      set_symbol,
      set_release_date,
      en_translation
    )
    VALUES (
      ${set.id},
      ${JSON.stringify(set)}::jsonb,
      ${set.name},
      ${set.series},
      ${set.code},
      ${set.total?.toString() ?? null},
      ${set.printed_total?.toString() ?? null},
      ${set.language},
      ${set.language_code},
      ${set.is_online_only ?? false},
      ${set.logo},
      ${set.symbol},
      ${set.release_date
        ? new Date(set.release_date.replace(/\//g, "-"))
        : null},
      ${set.translation?.en?.name ?? null}
    )
    ON CONFLICT (set_id, set_language_code)
    DO UPDATE SET
      details = EXCLUDED.details,
      set_name = EXCLUDED.set_name,
      set_series = EXCLUDED.set_series,
      set_code = EXCLUDED.set_code,
      set_total = EXCLUDED.set_total,
      set_printed_total = EXCLUDED.set_printed_total,
      set_language = EXCLUDED.set_language,
      set_is_online_only = EXCLUDED.set_is_online_only,
      set_logo = EXCLUDED.set_logo,
      set_symbol = EXCLUDED.set_symbol,
      set_release_date = EXCLUDED.set_release_date,
      en_translation = EXCLUDED.en_translation,
      updated = NOW();
  `;
}

async function importSets() {
  const file = fs.readFileSync("./sets.json", "utf8");
  const json = JSON.parse(file);

  const sets = json.data;

  if (!Array.isArray(sets)) {
    throw new Error("sets.json must contain { data: [] }");
  }

  console.log(`📦 Importing ${sets.length} sets...`);

  for (const set of sets) {
    if (targetSetIds && !targetSetIds.has(set.id)) {
      continue;
    }

    try {
      await upsertSet(set);
      console.log(`✅ Imported: ${set.name}`);
    } catch (err) {
      console.error(`❌ Failed set ${set.id}:`, err.message);
    }
  }

  console.log("🎉 Import complete");
}

importSets();