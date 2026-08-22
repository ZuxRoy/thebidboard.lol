// Keep in sync with app/src/lib/categories.ts
export const CATEGORY_IDS = [
  "saas",
  "mobile-apps",
  "games",
  "tools-automation",
  "ai-agents",
  "seo-tools",
  "marketing-sales",
  "people",
  "ecommerce",
  "fintech",
  "edtech",
  "marketplace",
  "agencies",
  "developer-tools",
  "web3-crypto",
  "design-creative",
  "productivity",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export function isCategoryId(value: string): value is CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(value);
}
