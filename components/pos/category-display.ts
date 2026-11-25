const categoryEmoji: Record<string, string> = {
  Coffee: "☕",
  "Non-Coffee": "🍵",
  Food: "🥐",
  "Coworking Space": "💻",
};

const categoryTheme: Record<string, string> = {
  Coffee: "from-amber-200 via-orange-100 to-amber-50",
  "Non-Coffee": "from-emerald-200 via-teal-100 to-emerald-50",
  Food: "from-rose-200 via-orange-100 to-rose-50",
  "Coworking Space": "from-sky-200 via-indigo-100 to-sky-50",
};

export function getCategoryEmoji(categoryName: string): string {
  return categoryEmoji[categoryName] ?? "🍽️";
}

export function getCategoryTheme(categoryName: string): string {
  return (
    categoryTheme[categoryName] ?? "from-stone-200 via-stone-100 to-stone-50"
  );
}
