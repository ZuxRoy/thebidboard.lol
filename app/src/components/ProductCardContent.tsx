import type { ListingRow as ListingRowData } from "../lib/api";
import { formatAmount } from "../lib/validators";
import ProductFavicon from "./ProductFavicon";
import CategoryPill from "./CategoryPill";
import SocialIconsRow from "./SocialIconsRow";

export type CardContentSize = "sm" | "md" | "lg";

interface ProductCardContentProps {
  item: ListingRowData;
  size?: CardContentSize;
}

const DOMAIN_TEXT: Record<CardContentSize, string> = {
  sm: "text-base",
  md: "text-lg sm:text-xl",
  lg: "text-xl sm:text-2xl",
};

const AMOUNT_TEXT: Record<CardContentSize, string> = {
  sm: "text-base",
  md: "text-lg sm:text-xl",
  lg: "text-xl sm:text-2xl",
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

export default function ProductCardContent({ item, size = "md" }: ProductCardContentProps) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <ProductFavicon domain={item.domain} size={FAVICON_SIZE[size]} />
        <p className={`amount font-bold text-accent-dark shrink-0 ${AMOUNT_TEXT[size]}`}>
          {formatAmount(item.amountCents)}
        </p>
      </div>

      <p className={`font-bold break-words ${DOMAIN_TEXT[size]}`}>{item.domain}</p>

      <p className={`text-ink-soft ${DESCRIPTION_TEXT[size]}`}>{item.description}</p>

      <div className="flex flex-wrap items-center gap-2.5 mt-1">
        <CategoryPill category={item.category} size={size === "sm" ? "sm" : "md"} />
        <SocialIconsRow socials={item.socials} size={SOCIAL_SIZE[size]} />
      </div>
    </div>
  );
}
