import { neon } from "@neondatabase/serverless";

const sql = neon("postgresql://neondb_owner:npg_8eHU7FbVTpvD@ep-rapid-pond-ahorbczd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require");

const API_KEY = 'c1209faf6f2d409b59cd4d87e1ce76216926ba53bef3ea4056664846ccd5d21c';
const TEAM_ID = 'mcc';

const SET_IDS = [
  // "adv1_ja"
"adv2_ja",
"adv3_ja",
"adv4_ja",
"adv5_ja",
"advp_ja",
"base1",
"base1_ja",
"base2",
"base2_ja",
"base3",
"base3_ja",
"base4",
"base4_ja",
"base5",
"base6",
"basep",
"bp",
"bw1",
"bw10",
"bw11",
"bw1b_ja",
"bw1w_ja",
"bw2",
"bw2_ja",
"bw3",
"bw3h_ja",
"bw3p_ja",
"bw4",
"bw4_ja",
"bw5",
"bw5d_ja",
"bw5s_ja",
"bw6",
"bw6c_ja",
"bw6f_ja",
"bw7",
"bw7_ja",
"bw8",
"bw8s_ja",
"bw8t_ja",
"bw9",
"bw9_ja",
"bwp",
"bwp_ja",
"cel25",
"cel25c",
"clb",
"clc",
"clv",
"col1",
"cp1_ja",
"cp2_ja",
"cp3_ja",
"cp4_ja",
"cp5_ja",
"cp6_ja",
"dc1",
"det1",
"dp1",
"dp1_ja",
"dp2",
"dp2_ja",
"dp3",
"dp3_ja",
"dp4",
"dp4d_ja",
"dp4m_ja",
"dp5",
"dp5c_ja",
"dp5t_ja",
"dp6",
"dp6_ja",
"dp7",
"dpp",
"dpp_ja",
"ds1_ja",
"dv1",
"ebb1_ja",
"ecard1",
"ecard1_ja",
"ecard2",
"ecard2_ja",
"ecard3",
"ecard3_ja",
"ecard4_ja",
"ecard5_ja",
"ex1",
"ex10",
"ex11",
"ex12",
"ex13",
"ex14",
"ex15",
"ex16",
"ex2",
"ex3",
"ex4",
"ex5",
"ex6",
"ex7",
"ex8",
"ex9",
"fut20",
"g1",
"gym1",
"gym1_ja",
"gym2",
"gym2_ja",
"hgss1",
"hgss2",
"hgss3",
"hgss4",
"hsp",
"ipb_ja",
"ips_ja",
"l1hg_ja",
"l1ss_ja",
"l2_ja",
"l3_ja",
"ll1_ja",
"lp_ja",
"m1l_ja",
"m1s_ja",
"m2_ja",
"m2a_ja",
"m3_ja",
"m4_ja",
"m5_ja",
"ma_ja",
"mbg_ja",
"mcd11",
"mcd12",
"mcd14",
"mcd15",
"mcd16",
"mcd17",
"mcd18",
"mcd19",
"mcd21",
"mcd22",
"mcd23",
"mcd24",
"me1",
"me2",
"me2pt5",
"me3",
"me4",
"mep",
"miscp",
"miscp_ja",
"miscpj_ja",
"miscpp_ja",
"miscppp_ja",
"miscpt_ja",
"mp_ja",
"neo1",
"neo1_ja",
"neo1pf_ja",
"neo2",
"neo2_ja",
"neo2pf_ja",
"neo3",
"neo3_ja",
"neo3pf_ja",
"neo4",
"neo4_ja",
"np",
"pcg10_ja",
"pcg1_ja",
"pcg2_ja",
"pcg3_ja",
"pcg4_ja",
"pcg5_ja",
"pcg6_ja",
"pcg7_ja",
"pcg8_ja",
"pcg9_ja",
"pcggb1_ja",
"pcgp_ja",
"pgo",
"pl1",
"pl2",
"pl3",
"pl4",
"playp_ja",
"pop1",
"pop2",
"pop3",
"pop4",
"pop5",
"pop6",
"pop7",
"pop8",
"pop9",
"pt1_ja",
"pt2_ja",
"pt3_ja",
"pt4_ja",
"ptp_ja",
"rsv10pt5",
"ru1",
"saf_ja",
"sag_ja",
"sal_ja",
"sar_ja",
"saw_ja",
"sc1_ja",
"sgg_ja",
"si1",
"sm0_ja",
"sm1",
"sm10",
"sm10_ja",
"sm10a_ja",
"sm10b_ja",
"sm11",
"sm115",
"sm11_ja",
"sm11a_ja",
"sm11b_ja",
"sm12",
"sm12_ja",
"sm12a_ja",
"sm1m_ja",
"sm1p_ja",
"sm1s_ja",
"sm2",
"sm2k_ja",
"sm2l_ja",
"sm2p_ja",
"sm3",
"sm35",
"sm3h_ja",
"sm3n_ja",
"sm3p_ja",
"sm4",
"sm4a_ja",
"sm4p_ja",
"sm4s_ja",
"sm5",
"sm5m_ja",
"sm5p_ja",
"sm5s_ja",
"sm6",
"sm6_ja",
"sm6a_ja",
"sm6b_ja",
"sm7",
"sm75",
"sm7_ja",
"sm7a_ja",
"sm7b_ja",
"sm8",
"sm8_ja",
"sm8a_ja",
"sm8b_ja",
"sm9",
"sm9_ja",
"sm9a_ja",
"sm9b_ja",
"sma",
"smp",
"smp_ja",
"sv1",
"sv10",
"sv10_ja",
"sv11b_ja",
"sv11w_ja",
"sv1a_ja",
"sv1s_ja",
"sv1v_ja",
"sv2",
"sv2a_ja",
"sv2d_ja",
"sv2p_ja",
"sv3",
"sv3_ja",
"sv3a_ja",
"sv3pt5",
"sv4",
"sv4a_ja",
"sv4k_ja",
"sv4m_ja",
"sv4pt5",
"sv5",
"sv5a_ja",
"sv5k_ja",
"sv5m_ja",
"sv6",
"sv6_ja",
"sv6a_ja",
"sv6pt5",
"sv7",
"sv7_ja",
"sv7a_ja",
"sv8",
"sv8_ja",
"sv8a_ja",
"sv8pt5",
"sv9",
"sv9_ja",
"sv9a_ja",
"sve",
"svp",
"svp_ja",
"swsh1",
"swsh10",
"swsh10a_ja",
"swsh10b_ja",
"swsh10d_ja",
"swsh10p_ja",
"swsh10tg",
"swsh11",
"swsh11_ja",
"swsh11a_ja",
"swsh11tg",
"swsh12",
"swsh12_ja",
"swsh12a_ja",
"swsh12pt5",
"swsh12pt5gg",
"swsh12tg",
"swsh1a_ja",
"swsh1h_ja",
"swsh1w_ja",
"swsh2",
"swsh2_ja",
"swsh2a_ja",
"swsh3",
"swsh35",
"swsh3_ja",
"swsh3a_ja",
"swsh4",
"swsh45",
"swsh45sv",
"swsh4_ja",
"swsh4a_ja",
"swsh5",
"swsh5a_ja",
"swsh5i_ja",
"swsh5r_ja",
"swsh6",
"swsh6a_ja",
"swsh6h_ja",
"swsh6k_ja",
"swsh7",
"swsh7d_ja",
"swsh7r_ja",
"swsh8",
"swsh8_ja",
"swsh8a_ja",
"swsh8b_ja",
"swsh9",
"swsh9_ja",
"swsh9a_ja",
"swsh9tg",
"swshp",
"swshp_ja",
"tcgp-A1",
"tcgp-A1a",
"tcgp-A2",
"tcgp-A2a",
"tcgp-A2b",
"tcgp-A3",
"tcgp-A3a",
"tcgp-A3b",
"tcgp-A4",
"tcgp-A4a",
"tcgp-A4b",
"tcgp-B1",
"tcgp-B1a",
"tcgp-B2",
"tcgp-B2a",
"tcgp-B2b",
"tcgp-B3",
"tcgp-PA",
"tcgp-PB",
"tk1a",
"tk1b",
"tk2a",
"tk2b",
"topsun_ja",
"vnd1_ja",
"vnd2_ja",
"vnd3_ja",
"vs1_ja",
"wb1",
"web1_ja",
"xy0",
"xy1",
"xy10",
"xy10_ja",
"xy11",
"xy11c_ja",
"xy11f_ja",
"xy12",
"xy1x_ja",
"xy1y_ja",
"xy2",
"xy2_ja",
"xy3",
"xy3_ja",
"xy4",
"xy4_ja",
"xy5",
"xy5g_ja",
"xy5t_ja",
"xy6",
"xy6_ja",
"xy7",
"xy7_ja",
"xy8",
"xy8b_ja",
"xy8r_ja",
"xy9",
"xy9_ja",
"xy_ja",
"xyp",
"xyp_ja",
"zsv10pt5"
];


const PAGE_SIZE = 100;

/**
 * 🔒 ALWAYS safe JSON serializer
 */
function safeJson(value, fallback) {
  if (value === undefined || value === null) {
    return JSON.stringify(fallback);
  }

  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value));
    } catch {
      return JSON.stringify(fallback);
    }
  }

  return JSON.stringify(value);
}

/**
 * Fetch cards
 */
async function fetchCards(setId, page) {
  const res = await fetch(
    `https://api.scrydex.com/pokemon/v1/expansions/${setId}/cards?page=${page}`,
    {
      headers: {
        "X-Api-Key": API_KEY,
        "X-Team-ID": TEAM_ID,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed ${setId} page ${page}: ${res.status}`);
  }

  return res.json();
}

/**
 * Insert card
 */
async function upsertCard(card) {
  await sql`
    INSERT INTO mcc_cards (
      id,
      name,
      supertype,
      subtypes,
      types,
      hp,
      evolves_from,
      rarity,
      rarity_code,
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

      ${safeJson(card.subtypes, [])}::jsonb,
      ${safeJson(card.types, [])}::jsonb,
      ${card.hp ?? null},

      ${safeJson(card.evolves_from, [])}::jsonb,

      ${card.rarity},
      ${card.rarity_code},
      ${card.number},
      ${card.expansion?.id ?? null},
      ${card.language},
      ${card.language_code},

      ${safeJson(card.abilities, [])}::jsonb,
      ${safeJson(card.attacks, [])}::jsonb,
      ${safeJson(card.images, [])}::jsonb,

      ${safeJson(card.expansion, {})}::jsonb,
      ${safeJson(card.translation, {})}::jsonb
    )
    ON CONFLICT (id)
    DO UPDATE SET
      name = EXCLUDED.name,
      supertype = EXCLUDED.supertype,
      subtypes = EXCLUDED.subtypes,
      types = EXCLUDED.types,
      hp = EXCLUDED.hp,
      evolves_from = EXCLUDED.evolves_from,
      rarity = EXCLUDED.rarity,
      rarity_code = EXCLUDED.rarity_code,
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
 * Variants
 */
async function upsertVariants(card) {
  if (!Array.isArray(card.variants)) return;

  for (const variant of card.variants) {
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
        ${safeJson(variant.prices, [])}::jsonb,
        ${safeJson(variant.pop_reports, [])}::jsonb
      )
      ON CONFLICT (card_id, name)
      DO UPDATE SET
        prices = EXCLUDED.prices,
        pop_reports = EXCLUDED.pop_reports;
    `;
  }
}

/**
 * Process one set
 */
async function processSet(setId) {
  console.log(`\n📦 Processing set: ${setId}`);

  let page = 1;
  let total = 0;

  while (true) {
    const json = await fetchCards(setId, page);
    const cards = json.data || [];

    if (cards.length === 0) break;

    console.log(`➡️ ${setId} page ${page} (${cards.length})`);

    for (const card of cards) {
      try {
        await upsertCard(card);
        await upsertVariants(card);
        total++;
      } catch (err) {
        console.error(`❌ ${card.id}:`, err.message);
      }
    }

    if (cards.length < PAGE_SIZE) break;

    page++;
  }

  console.log(`✅ Done ${setId}: ${total} cards`);
}

/**
 * Runner
 */
async function run() {
  console.log(`🚀 Importing ${SET_IDS.length} sets`);

  for (const setId of SET_IDS) {
    try {
      await processSet(setId);
    } catch (err) {
      console.error(`💥 Set failed ${setId}:`, err.message);
    }
  }

  console.log("🎉 Complete");
}

run();