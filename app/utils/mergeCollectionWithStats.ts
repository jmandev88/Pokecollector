// utils/mergeCollectionWithStats.ts

export function mergeCollectionWithStats(
  sets: any[],
  stats: any[],
  other_cards: any[]
) {
  const statsMap = Object.fromEntries(
    stats.map((stat) => [
      stat.expansion_id,
      stat
    ])
  );

  return sets.map((set) => ({
    ...set,
    other_cards: other_cards.find((s) => s.expansion_id === set.expansionId)?.others_cards || [],
    stats: statsMap[set.expansionId] ?? {
      variant_count: 0,
      owned_count: 0,
      master_count: 0,
      completion_percentage: 0,
    }
  }));
}