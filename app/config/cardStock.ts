export const CARD_STOCK_CONDITIONS = [
  { value: "mint", label: "Mint" },
  { value: "near_mint", label: "Near Mint" },
  { value: "excellent", label: "Excellent" },
  { value: "lightly_played", label: "Lightly Played" },
  { value: "played", label: "Played" },
  { value: "heavily_played", label: "Heavily Played" },
  { value: "damaged", label: "Damaged" },
];

export function isCardStockCondition(condition: string) {
  return CARD_STOCK_CONDITIONS.some((option) => option.value === condition);
}
