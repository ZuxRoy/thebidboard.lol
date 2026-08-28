import { useEffect, useState } from "react";
import { Globe } from "@phosphor-icons/react";
import { listingIconSrc, xProfileHandleFromDomain, xProfileHandleFromUrl } from "../lib/validators";

interface ProductFaviconProps {
  domain: string;
  url?: string;
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

export default function ProductFavicon({ domain, url = "", size = "md" }: ProductFaviconProps) {
  const [failed, setFailed] = useState(false);
  const box = BOX_SIZE[size];
  const src = listingIconSrc(url, domain, IMG_SIZE[size]);
  const isAvatar = Boolean(xProfileHandleFromUrl(url) ?? xProfileHandleFromDomain(domain));

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div
      className={`${box} shrink-0 flex items-center justify-center rounded-xl border border-border bg-surface-soft overflow-hidden`}
    >
      {failed || !src ? (
        <Globe size={ICON_SIZE[size]} className="text-ink-faint" weight="regular" />
      ) : (
        <img
          src={src}
          alt=""
          width={IMG_SIZE[size]}
          height={IMG_SIZE[size]}
          className={isAvatar ? "w-full h-full object-cover" : "w-3/4 h-3/4 object-contain"}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
