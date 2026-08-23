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
      className={`block border px-4 py-3 sm:px-5 sm:py-3.5 transition-colors ${
        accent
          ? "border-accent bg-accent/5 hover:border-accent-dark"
          : "border-ink/30 bg-paper hover:border-ink"
      }`}
    >
      <ProductCardContent item={item} size="sm" variant="detailed" rank={item.rank} />
    </a>
  );
}
