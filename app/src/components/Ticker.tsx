import { useTicker } from "../lib/api";
import { formatAmount } from "../lib/validators";
import { getCategoryMeta } from "../lib/categories";

export default function Ticker() {
  const { data } = useTicker();
  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="w-full bg-ink text-paper text-xs tracking-wide py-1.5 text-center font-body">
        Be the first to claim a spot on the board.
      </div>
    );
  }

  const track = [...items, ...items];

  return (
    <div className="w-full bg-ink text-paper overflow-hidden border-b border-ink/80">
      <div className="flex whitespace-nowrap py-1.5 animate-marquee">
        {track.map((item, index) => {
          const meta = getCategoryMeta(item.category);
          return (
            <span
              key={`${item.domain}-${index}`}
              className="inline-flex items-center gap-1.5 text-xs px-4 border-r border-paper/20 font-body"
            >
              {meta ? <meta.icon className="w-3 h-3 opacity-70" strokeWidth={2} /> : null}
              <span className="font-semibold">{item.domain}</span>
              <span className="amount text-gold">{formatAmount(item.amountCents)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
