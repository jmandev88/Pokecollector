# Pokecollector

## Data imports

The app stores card, set, sealed product, and collection data in Neon/Postgres.

- `scripts/importSets.mjs` imports expansion/set metadata into `mcc_sets`.
- `scripts/importCards.mjs` imports cards for configured expansions into `mcc_cards` and card variants into `mcc_card_variants`.
- `scripts/importSealed.mjs` imports sealed products into `mcc_sealed`.

The import scripts fetch from the Scrydex Pokemon API and persist the API response fields directly where possible. JSON fields such as `types`, `national_pokedex_numbers`, `images`, `expansion`, and `variants` are stored as `jsonb`.

## Homepage aggregates

The homepage summary panels are built from repository queries:

- **Rarity** comes from `mcc_cards.rarity`.
- **Type** comes from each value in the `mcc_cards.types` JSON array.
- **Pokedex Number** comes from each value in the `mcc_cards.national_pokedex_numbers` JSON array.
- **Stamp** comes from `mcc_card_variants.name`.

Rarity, Type, and Pokedex Number join against grouped counts from `mcc_card_variants` so the UI can show both:

- `card_count`: distinct card rows in `mcc_cards`.
- `collectible_count`: card variant count where variants exist, otherwise `1` for the base card.

Stamp is already variant-based, so it counts distinct cards joined to each matching `mcc_card_variants.name` and counts the matching variant rows as collectibles.

The sealed booster collection panel uses:

- `mcc_sealed` for booster pack products.
- `mcc_user_sealed_collection` for the signed-in user's sealed quantities.
- `mcc_users` plus `mcc_user_sealed_collection` to list booster packs other users have that the signed-in user does not.

Main booster packs are filtered with `type = 'Booster Pack'` and by matching the product name to the expansion name plus `Booster Pack`, with a special exception for `Base Set Booster Pack`.
