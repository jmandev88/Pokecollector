// app/utils/groupTradesBySet.ts

export function groupTradesBySet(cards: any[]) {
  const sets: Record<string, any> = {};

  cards.forEach((card) => {
    if (!sets[card.expansion_id]) {
      sets[card.expansion_id] = {
        expansion_id: card.expansion_id,
        expansion: card.expansion,
        others_cards: [],
      };
    }

    sets[card.expansion_id].others_cards.push(card);
  });

  return Object.values(sets);
}