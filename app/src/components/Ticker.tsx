import { useTicker } from "../lib/api";
import { formatAmount, formatTimeAgo } from "../lib/validators";
import { getCategoryMeta } from "../lib/categories";

export default function Ticker() {
  const { data } = useTicker();
  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="w-full bg-ink text-surface text-xs py-2 text-center">
        Be the first to claim a spot on the board.
      </div>
    );
  }

  const track = [...items, ...items];

  return (
    <div className="w-full bg-ink flex items-stretch overflow-hidden">
      <div className="hidden sm:flex shrink-0 items-center gap-1.5 px-4 text-[11px] font-semibold uppercase tracking-wide text-white bg-white/5 border-r border-white/10">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-70 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        Latest
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex whitespace-nowrap py-2 animate-marquee">
          {track.map((item, index) => {
            const meta = getCategoryMeta(item.category);
            return (
              <span
                key={`${item.domain}-${index}`}
                className="inline-flex items-center gap-2 text-xs px-5 border-r border-white/10 text-white/70"
              >
                {meta ? <meta.icon size={13} weight="regular" /> : null}
                <span className="font-semibold text-white">{item.domain}</span>
                <span className="amount text-accent-soft">{formatAmount(item.amountCents)}</span>
                <span className="text-white/40">{formatTimeAgo(item.createdAt)}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
