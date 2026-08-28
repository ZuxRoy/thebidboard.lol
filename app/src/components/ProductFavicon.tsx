import { useState } from "react";
import { Globe } from "@phosphor-icons/react";

interface ProductFaviconProps {
  domain: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const BOX_SIZE: Record<NonNullable<ProductFaviconProps["size"]>, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-14 h-14",
};

const ICON_SIZE: Record<NonNullable<ProductFaviconProps["size"]>, number> = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

const IMG_SIZE: Record<NonNullable<ProductFaviconProps["size"]>, number> = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 72,
};

export default function ProductFavicon({ domain, size = "md" }: ProductFaviconProps) {
  const [failed, setFailed] = useState(false);
  const box = BOX_SIZE[size];

  return (
    <div
      className={`${box} shrink-0 flex items-center justify-center rounded-xl border border-border bg-surface-soft overflow-hidden`}
    >
      {failed ? (
        <Globe size={ICON_SIZE[size]} className="text-ink-faint" weight="regular" />
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?sz=${IMG_SIZE[size]}&domain=${encodeURIComponent(domain)}`}
          alt=""
          width={IMG_SIZE[size]}
          height={IMG_SIZE[size]}
          className="w-3/4 h-3/4 object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
