import { getCategoryMeta } from "../lib/categories";

interface CategoryPillProps {
  category: string;
  size?: "sm" | "md";
}

export default function CategoryPill({ category, size = "sm" }: CategoryPillProps) {
  const meta = getCategoryMeta(category);
  if (!meta) return null;

  const padding = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs";
  const iconSize = size === "sm" ? 12 : 13;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-soft text-ink-soft font-medium ${padding}`}
    >
      <meta.icon size={iconSize} weight="regular" />
      {meta.label}
    </span>
  );
}
