// utils/mergeCollectionWithStats.ts

export function mergeCollectionWithStats(
  sets: any[],
  stats: any[]
) {
  const statsMap = Object.fromEntries(
    stats.map((stat) => [
      stat.expansion_id,
      stat
    ])
  );

  return sets.map((set) => ({
    ...set,

    stats: statsMap[set.expansionId] ?? {
      variant_count: 0,
      owned_count: 0,
      master_count: 0,
      completion_percentage: 0,
    }
  }));
}