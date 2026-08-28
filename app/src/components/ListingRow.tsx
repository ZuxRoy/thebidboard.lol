import type { ListingRow as ListingRowData } from "../lib/api";
import ProductCardContent, { type CardContentSize } from "./ProductCardContent";

interface ListingRowProps {
  item: ListingRowData;
  size?: CardContentSize;
  highlight?: 1 | 2 | 3;
  compact?: boolean;
  embedded?: boolean;
}

const HIGHLIGHT_CLASS: Record<1 | 2 | 3, string> = {
  1: "holo-glow-rank-1 border-rank-gold/50 p-4 sm:p-5",
  2: "holo-glow-rank-2 border-rank-silver/50 p-[0.95rem] sm:p-4",
  3: "holo-glow-rank-3 p-3.5 sm:p-[0.95rem]",
};

const COMPACT_HIGHLIGHT_CLASS: Record<1 | 2 | 3, string> = {
  1: "holo-glow-rank-1 border-rank-gold/50 p-3",
  2: "holo-glow-rank-2 border-rank-silver/50 p-3",
  3: "holo-glow-rank-3 p-3",
};

const EMBEDDED_HIGHLIGHT_CLASS: Record<1 | 2 | 3, string> = {
  1: "border-rank-gold/45 p-3",
  2: "border-rank-silver/45 p-3",
  3: "border-rank-bronze/40 p-3",
};

export default function ListingRow({
  item,
  size = "default",
  highlight,
  compact = false,
  embedded = false,
}: ListingRowProps) {
  const paddingClass = embedded
    ? highlight
      ? EMBEDDED_HIGHLIGHT_CLASS[highlight]
      : "p-3"
    : highlight
      ? (compact ? COMPACT_HIGHLIGHT_CLASS : HIGHLIGHT_CLASS)[highlight]
      : compact
        ? "p-3"
        : "p-3.5 sm:p-4";

  return (
    <article
      className={`relative transition-colors hover:border-ink-faint ${paddingClass} ${
        embedded
          ? "rounded-xl border bg-white/70"
          : "surface-card holo-glow"
      }`}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-0 rounded-[inherit]"
        aria-label={`${item.displayName || item.domain} details`}
      />
      <div className="relative z-10 pointer-events-none">
        <ProductCardContent item={item} size={size} compact={compact || embedded} />
      </div>
    </article>
  );
}
