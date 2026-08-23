import { getCategoryMeta } from "../lib/categories";

interface CategoryPillProps {
  category: string;
  size?: "sm" | "md";
}

export default function CategoryPill({ category, size = "sm" }: CategoryPillProps) {
  const meta = getCategoryMeta(category);
  if (!meta) return null;

  const padding = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border-2 border-accent bg-accent/10 text-accent-dark font-semibold uppercase tracking-wide ${padding}`}
    >
      <meta.icon className={iconSize} strokeWidth={2} />
      {meta.label}
    </span>
  );
}
