import { Pin, Crown } from "lucide-react";
import { useTopListing } from "../lib/api";
import { formatAmount } from "../lib/validators";

interface BulletinBoardProps {
  onPickAmount: (amountCents: number) => void;
}

const STARTING_AMOUNT_CENTS = 100;

export default function BulletinBoard({ onPickAmount }: BulletinBoardProps) {
  const { data } = useTopListing();
  const nextAmountCents = data?.nextAmountCents ?? 100;

  return (
    <div className="flex flex-row items-start gap-3 sm:gap-4">
      <PinnedNote rotate="-rotate-3">
        <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-ink-soft mb-0.5">
          Starting at
        </p>
        <p className="headline text-[11px] sm:text-sm font-bold mb-1.5 leading-tight">
          Book Spot on the Board
        </p>
        <button
          type="button"
          onClick={() => onPickAmount(STARTING_AMOUNT_CENTS)}
          className="w-full bg-ink text-paper uppercase tracking-wide text-[10px] sm:text-xs font-semibold px-2 py-1 border-2 border-ink hover:bg-ink/85 transition-colors"
        >
          Pay $1
        </button>
      </PinnedNote>

      <PinnedNote rotate="rotate-2" highlight>
        <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-auto mb-0.5 text-gold" strokeWidth={1.75} />
        <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-ink-soft mb-0.5">
          Position #1 open
        </p>
        <p className="headline text-[11px] sm:text-sm font-bold mb-1.5 leading-tight">
          Take Top Spot for{" "}
          <span className="amount text-accent-dark">{formatAmount(nextAmountCents)}</span>
        </p>
        <button
          type="button"
          onClick={() => onPickAmount(nextAmountCents)}
          className="w-full bg-accent text-paper uppercase tracking-wide text-[10px] sm:text-xs font-semibold px-2 py-1 border-2 border-ink hover:bg-accent-dark transition-colors"
        >
          Pay &amp; Take #1
        </button>
      </PinnedNote>
    </div>
  );
}

function PinnedNote({
  children,
  rotate,
  highlight,
}: {
  children: React.ReactNode;
  rotate: string;
  highlight?: boolean;
}) {
  return (
    <div className={`relative w-28 sm:w-36 shrink-0 ${rotate}`}>
      <Pin
        className={`absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 z-10 drop-shadow-sm ${
          highlight ? "text-accent" : "text-ink-soft"
        }`}
        fill="currentColor"
        strokeWidth={1}
      />
      <div
        className={`newsprint-card p-2 sm:p-2.5 pt-3.5 sm:pt-4 text-center ${
          highlight ? "border-accent accent-shadow-card" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
