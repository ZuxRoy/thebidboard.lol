import { ArrowSquareOut } from "@phosphor-icons/react";
import type { ListingRow as ListingRowData } from "../lib/api";
import { formatAmount, formatTimeAgo } from "../lib/validators";
import ProductFavicon from "./ProductFavicon";
import CategoryPill from "./CategoryPill";
import SocialIconsRow from "./SocialIconsRow";
import RankBadge from "./RankBadge";

export type CardContentSize = "default" | "featured";

interface ProductCardContentProps {
  item: ListingRowData;
  size?: CardContentSize;
  compact?: boolean;
}

export default function ProductCardContent({ item, size = "default", compact = false }: ProductCardContentProps) {
  const isFeatured = size === "featured" && !compact;

  return (
    <div className="flex items-start gap-3 sm:gap-4 min-w-0 w-full">
      <RankBadge rank={item.rank} size={size} />
      <ProductFavicon domain={item.domain} size={isFeatured ? "xl" : "md"} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p
            className={`font-semibold text-ink truncate ${isFeatured ? "text-lg sm:text-xl" : "text-[15px] sm:text-base"}`}
          >
            {item.domain}
          </p>
          <p
            className={`amount font-bold text-accent-dark shrink-0 ${isFeatured ? "text-lg sm:text-xl" : "text-[15px] sm:text-base"}`}
          >
            {formatAmount(item.amountCents)}
          </p>
        </div>

        <p className={`text-ink-soft mt-1 ${isFeatured ? "text-sm sm:text-[15px]" : "text-sm"} ${compact ? "line-clamp-1" : "line-clamp-2"}`}>
          {item.description}
        </p>

        <div className="flex items-center justify-between gap-3 mt-2.5 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-ink-faint min-w-0">
            <CategoryPill category={item.category} size="sm" />
            <span className="hidden sm:inline">&middot;</span>
            <span className="hidden sm:inline whitespace-nowrap">{formatTimeAgo(item.createdAt)}</span>
            <span className="hidden md:inline">&middot;</span>
            <span className="hidden md:inline-flex items-center gap-1 whitespace-nowrap">
              <ArrowSquareOut size={12} weight="regular" />
              see details
            </span>
          </div>
          <SocialIconsRow socials={item.socials} size={isFeatured ? "md" : "sm"} />
        </div>
      </div>
    </div>
  );
}
