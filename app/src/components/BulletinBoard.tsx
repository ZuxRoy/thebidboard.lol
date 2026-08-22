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
    <div className="corkboard w-full max-w-lg mx-auto rounded-sm px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col sm:flex-row justify-center items-stretch gap-5 sm:gap-6 max-w-2xl mx-auto">
        <PinnedNote rotate="-rotate-2 sm:-rotate-3">
          <p className="text-[10px] uppercase tracking-widest text-ink-soft mb-1">Starting at</p>
          <p className="headline text-lg sm:text-xl font-bold mb-2.5">Book Spot on the Board</p>
          <button
            type="button"
            onClick={() => onPickAmount(STARTING_AMOUNT_CENTS)}
            className="w-full bg-ink text-paper uppercase tracking-wide text-sm font-semibold px-3 py-1.5 border-2 border-ink hover:bg-ink/85 transition-colors"
          >
            Pay $1
          </button>
        </PinnedNote>

        <PinnedNote rotate="rotate-2 sm:rotate-2" highlight>
          <Crown className="w-4 h-4 mx-auto mb-1 text-gold" strokeWidth={1.75} />
          <p className="text-[10px] uppercase tracking-widest text-ink-soft mb-0.5">Position #1 is open</p>
          <p className="headline text-base sm:text-lg font-bold mb-2.5">
            Claim Top Spot for <span className="amount text-accent-dark">{formatAmount(nextAmountCents)}</span>
          </p>
          <button
            type="button"
            onClick={() => onPickAmount(nextAmountCents)}
            className="w-full bg-accent text-paper uppercase tracking-wide text-sm font-semibold px-3 py-1.5 border-2 border-ink hover:bg-accent-dark transition-colors"
          >
            Pay & Take #1
          </button>
        </PinnedNote>
      </div>
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
    <div className={`relative flex-1 max-w-[15rem] mx-auto sm:mx-0 ${rotate}`}>
      <Pin
        className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 z-10 drop-shadow-sm ${
          highlight ? "text-accent" : "text-ink-soft"
        }`}
        fill="currentColor"
        strokeWidth={1}
      />
      <div
        className={`newsprint-card p-3.5 pt-5 text-center ${highlight ? "border-accent accent-shadow-card" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
