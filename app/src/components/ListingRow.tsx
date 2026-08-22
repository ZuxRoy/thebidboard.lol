import type { ListingRow as ListingRowData } from "../lib/api";
import { getCategoryMeta } from "../lib/categories";
import { formatAmount } from "../lib/validators";
import SocialIconsRow from "./SocialIconsRow";

interface ListingRowProps {
  item: ListingRowData;
}

export default function ListingRow({ item }: ListingRowProps) {
  const meta = getCategoryMeta(item.category);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 sm:gap-4 border border-ink/30 bg-paper px-3 py-3 sm:px-4 hover:border-ink transition-colors"
    >
      <span className="amount w-9 sm:w-11 shrink-0 text-center text-sm sm:text-base font-bold text-ink-soft">
        #{item.rank}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-bold truncate">{item.domain}</p>
          <p className="amount font-semibold text-accent-dark shrink-0">{formatAmount(item.amountCents)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          <p className="text-sm text-ink-soft truncate max-w-full sm:max-w-xs">{item.description}</p>
          {meta ? (
            <span className="text-[11px] uppercase tracking-wide text-ink-soft flex items-center gap-1 shrink-0">
              <meta.icon className="w-3 h-3" /> {meta.label}
            </span>
          ) : null}
        </div>
        <div className="mt-2">
          <SocialIconsRow socials={item.socials} />
        </div>
      </div>
    </a>
  );
}
