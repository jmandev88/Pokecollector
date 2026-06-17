import { neon } from "@neondatabase/serverless";

const sql = neon("postgresql://neondb_owner:npg_8eHU7FbVTpvD@ep-rapid-pond-ahorbczd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require");

const API_KEY = 'c1209faf6f2d409b59cd4d87e1ce76216926ba53bef3ea4056664846ccd5d21c';
const TEAM_ID = 'mcc';

const PAGE_SIZE = 100;

async function importSealed() {
  let page = 1;
  let imported = 0;

  while (true) {
    console.log(`📦 Fetching page ${page}`);

    const response = await fetch(
      `https://api.scrydex.com/pokemon/v1/sealed?page=${page}&page_size=${PAGE_SIZE}`,
      {
        headers: {
          "X-Api-Key": API_KEY,
          "X-Team-ID": TEAM_ID,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch page ${page}: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();
    const products = json.data || [];

    if (products.length === 0) {
      break;
    }

    for (const product of products) {
      try {
        await sql`
  INSERT INTO mcc_sealed (
    id,
    name,
    type,
    description,
    expansion_id,
    language_code,
    images,
    expansion,
    variants,
    expansion_sort_order
  )
  VALUES (
    ${product.id},
    ${product.name ?? null},
    ${product.type ?? null},
    ${product.description ?? null},
    ${product.expansion?.id ?? null},
    ${product.expansion?.language_code ?? null},
    ${JSON.stringify(product.images ?? [])}::jsonb,
    ${JSON.stringify(product.expansion ?? null)}::jsonb,
    ${JSON.stringify(product.variants ?? [])}::jsonb,
    ${product.expansion_sort_order ?? null}
  )
  ON CONFLICT (id)
  DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    description = EXCLUDED.description,
    expansion_id = EXCLUDED.expansion_id,
    language_code = EXCLUDED.language_code,
    images = EXCLUDED.images,
    expansion = EXCLUDED.expansion,
    variants = EXCLUDED.variants,
    expansion_sort_order = EXCLUDED.expansion_sort_order
`;

        imported++;

        if (imported % 100 === 0) {
          console.log(`✅ Imported ${imported}`);
        }
      } catch (error) {
        console.error(`❌ ${product.id}:`, error.message);
      }
    }

    console.log(
      `✅ Page ${page} complete (${products.length} products processed)`
    );

    if (products.length < PAGE_SIZE) {
      break;
    }

    page++;
  }

  console.log(`🎉 Finished importing ${imported} sealed products`);
}

importSealed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });