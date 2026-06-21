export function groupCollectionBySet(collection: any[]) {
  const sets = new Map();

  for (const card of collection) {
    if (!sets.has(card.expansion_id)) {
      sets.set(card.expansion_id, {
        expansionId: card.expansion_id,
        expansion: card.expansion,
        cards: [],
      });
    }

    sets.get(card.expansion_id).cards.push(card);
  }

  return Array.from(sets.values());
}