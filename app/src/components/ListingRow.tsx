import type { ListingRow as ListingRowData } from "../lib/api";
import ProductCardContent from "./ProductCardContent";

interface ListingRowProps {
  item: ListingRowData;
  accent?: boolean;
}

export default function ListingRow({ item, accent = false }: ListingRowProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block border px-4 py-3.5 sm:px-5 sm:py-4 transition-colors ${
        accent
          ? "border-accent bg-accent/5 hover:border-accent-dark"
          : "border-ink/30 bg-paper hover:border-ink"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`amount shrink-0 text-sm sm:text-base font-bold pt-1.5 ${
            accent ? "text-accent-dark" : "text-ink-soft"
          }`}
        >
          #{item.rank}
        </span>
        <div className="min-w-0 flex-1">
          <ProductCardContent item={item} size="sm" />
        </div>
      </div>
    </a>
  );
}
