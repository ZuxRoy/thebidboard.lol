import { useState } from "react";
import { Globe } from "lucide-react";

interface ProductFaviconProps {
  domain: string;
  size?: "sm" | "md" | "lg";
}

const BOX_SIZE: Record<NonNullable<ProductFaviconProps["size"]>, string> = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-12 h-12",
};

const ICON_SIZE: Record<NonNullable<ProductFaviconProps["size"]>, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-6 h-6",
};

const IMG_SIZE: Record<NonNullable<ProductFaviconProps["size"]>, number> = {
  sm: 32,
  md: 48,
  lg: 64,
};

export default function ProductFavicon({ domain, size = "md" }: ProductFaviconProps) {
  const [failed, setFailed] = useState(false);
  const box = BOX_SIZE[size];

  return (
    <div
      className={`${box} shrink-0 flex items-center justify-center rounded-sm border-[1.5px] border-ink bg-paper overflow-hidden`}
    >
      {failed ? (
        <Globe className={`${ICON_SIZE[size]} text-ink-soft`} strokeWidth={2} />
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
