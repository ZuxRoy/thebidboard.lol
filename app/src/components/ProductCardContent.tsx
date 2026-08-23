import type { ListingRow as ListingRowData } from "../lib/api";
import { formatAmount } from "../lib/validators";
import ProductFavicon from "./ProductFavicon";
import CategoryPill from "./CategoryPill";
import SocialIconsRow from "./SocialIconsRow";

export type CardContentSize = "sm" | "md" | "lg";
export type CardContentVariant = "compact" | "detailed";

interface ProductCardContentProps {
  item: ListingRowData;
  size?: CardContentSize;
  variant?: CardContentVariant;
  rank?: number;
}

const DOMAIN_TEXT: Record<CardContentSize, string> = {
  sm: "text-sm sm:text-base",
  md: "text-base sm:text-lg",
  lg: "text-lg sm:text-xl",
};

const AMOUNT_TEXT: Record<CardContentSize, string> = {
  sm: "text-sm sm:text-base",
  md: "text-base sm:text-lg",
  lg: "text-lg sm:text-xl",
};

const DESCRIPTION_TEXT: Record<CardContentSize, string> = {
  sm: "text-sm",
  md: "text-sm sm:text-base",
  lg: "text-sm sm:text-base",
};

const FAVICON_SIZE: Record<CardContentSize, "sm" | "md" | "lg"> = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

const SOCIAL_SIZE: Record<CardContentSize, "sm" | "md" | "lg"> = {
  sm: "md",
  md: "lg",
  lg: "lg",
};

export default function ProductCardContent({
  item,
  size = "md",
  variant = "detailed",
  rank,
}: ProductCardContentProps) {
  const isCompact = variant === "compact";

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center gap-2.5 min-w-0">
        {rank !== undefined ? (
          <span className={`amount shrink-0 font-bold text-ink-soft ${AMOUNT_TEXT[size]}`}>
            #{rank}
          </span>
        ) : null}
        <ProductFavicon domain={item.domain} size={FAVICON_SIZE[size]} />
        <p className={`font-bold truncate flex-1 ${DOMAIN_TEXT[size]}`}>{item.domain}</p>
        <p className={`amount font-bold text-accent-dark shrink-0 ${AMOUNT_TEXT[size]}`}>
          {formatAmount(item.amountCents)}
        </p>
      </div>

      {isCompact ? (
        <div className="mt-1">
          <CategoryPill category={item.category} size="sm" />
        </div>
      ) : (
        <>
          <p className={`text-ink-soft ${DESCRIPTION_TEXT[size]}`}>{item.description}</p>
          <div className="flex items-center justify-between gap-2 mt-1">
            <CategoryPill category={item.category} size={size === "sm" ? "sm" : "md"} />
            <SocialIconsRow socials={item.socials} size={SOCIAL_SIZE[size]} />
          </div>
        </>
      )}
    </div>
  );
}
