import {
  SquaresFour,
  Cloud,
  DeviceMobile,
  GameController,
  Wrench,
  Robot,
  MagnifyingGlass,
  Megaphone,
  Users,
  ShoppingCart,
  Bank,
  GraduationCap,
  Storefront,
  Briefcase,
  Code,
  Coins,
  PaintBrush,
  ListChecks,
  type Icon,
} from "@phosphor-icons/react";

// Keep category ids in sync with api/src/services/categories.ts
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
export type FilterId = "all" | CategoryId;

export interface CategoryMeta {
  id: FilterId;
  label: string;
  icon: Icon;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "all", label: "All", icon: SquaresFour },
  { id: "saas", label: "SaaS", icon: Cloud },
  { id: "mobile-apps", label: "Mobile Apps", icon: DeviceMobile },
  { id: "games", label: "Games", icon: GameController },
  { id: "tools-automation", label: "Tools & Automation", icon: Wrench },
  { id: "ai-agents", label: "AI Agents", icon: Robot },
  { id: "seo-tools", label: "SEO Tools", icon: MagnifyingGlass },
  { id: "marketing-sales", label: "Marketing & Sales", icon: Megaphone },
  { id: "people", label: "People", icon: Users },
  { id: "ecommerce", label: "E-Commerce", icon: ShoppingCart },
  { id: "fintech", label: "Fintech", icon: Bank },
  { id: "edtech", label: "EdTech", icon: GraduationCap },
  { id: "marketplace", label: "Marketplace", icon: Storefront },
  { id: "agencies", label: "Agencies", icon: Briefcase },
  { id: "developer-tools", label: "Developer Tools", icon: Code },
  { id: "web3-crypto", label: "Web3 & Crypto", icon: Coins },
  { id: "design-creative", label: "Design & Creative", icon: PaintBrush },
  { id: "productivity", label: "Productivity", icon: ListChecks },
];

export const CATEGORY_FORM_OPTIONS = CATEGORIES.filter((c) => c.id !== "all") as Array<
  CategoryMeta & { id: CategoryId }
>;

export function getCategoryMeta(id: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
