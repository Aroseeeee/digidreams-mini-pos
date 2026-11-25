const categoryLabel: Record<string, string> = {
  Coffee: "Coffee",
  "Non-Coffee": "Non-Coffee",
  Food: "Food",
  "Coworking Space": "Coworking",
};

export function getCategoryLabel(categoryName: string): string {
  return categoryLabel[categoryName] ?? categoryName;
}
