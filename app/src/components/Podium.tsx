import { Crown } from "lucide-react";
import type { ListingRow as ListingRowData } from "../lib/api";
import { getCategoryMeta } from "../lib/categories";
import { formatAmount } from "../lib/validators";
import SocialIconsRow from "./SocialIconsRow";

interface PodiumProps {
  items: ListingRowData[];
}

type CardSize = "first" | "second" | "third";

const SIZE_STYLES: Record<
  CardSize,
  { card: string; badge: string; domain: string; amount: string; description: string; wrapper: string }
> = {
  first: {
    card: "p-6 sm:p-8",
    badge: "w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl bg-accent text-paper",
    domain: "text-2xl sm:text-3xl",
    amount: "text-2xl sm:text-3xl",
    description: "text-sm sm:text-base",
    wrapper: "",
  },
  second: {
    card: "p-4 sm:p-5",
    badge: "w-10 h-10 sm:w-11 sm:h-11 text-base sm:text-lg bg-ink text-paper",
    domain: "text-base sm:text-lg",
    amount: "text-lg",
    description: "text-sm",
    wrapper: "",
  },
  third: {
    card: "p-3.5 sm:p-4",
    badge: "w-9 h-9 text-base bg-ink text-paper",
    domain: "text-sm sm:text-base",
    amount: "text-base",
    description: "text-xs sm:text-sm",
    wrapper: "sm:mt-5",
  },
};

function PodiumCard({ item, size }: { item: ListingRowData; size: CardSize }) {
  const meta = getCategoryMeta(item.category);
  const styles = SIZE_STYLES[size];
  const isFirst = size === "first";

  return (
    <div className={styles.wrapper}>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`block newsprint-card text-center hover:-translate-y-0.5 transition-transform ${styles.card} ${
          isFirst ? "border-accent accent-shadow-card" : ""
        }`}
      >
        {isFirst ? <Crown className="w-7 h-7 mx-auto mb-1 text-gold" strokeWidth={1.75} fill="currentColor" /> : null}
        <div className={`mx-auto mb-2 flex items-center justify-center rounded-full font-bold headline ${styles.badge}`}>
          #{item.rank}
        </div>
        <p className={`font-bold break-words ${styles.domain}`}>{item.domain}</p>
        <p className={`amount text-accent-dark font-semibold my-1 ${styles.amount}`}>{formatAmount(item.amountCents)}</p>
        {meta ? (
          <p className="text-[11px] uppercase tracking-wide text-ink-soft flex items-center justify-center gap-1 mb-1">
            <meta.icon className="w-3 h-3" /> {meta.label}
          </p>
        ) : null}
        <p className={`text-ink-soft line-clamp-2 ${styles.description}`}>{item.description}</p>
        <div className="flex justify-center mt-3">
          <SocialIconsRow socials={item.socials} />
        </div>
      </a>
    </div>
  );
}

export default function Podium({ items }: PodiumProps) {
  if (items.length === 0) return null;

  const [first, ...rest] = items;

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
      <PodiumCard item={first} size="first" />
      {rest.length > 0 ? (
        <div className={`grid gap-4 ${rest.length === 1 ? "grid-cols-1 max-w-xs mx-auto" : "grid-cols-2"}`}>
          {rest.map((item, index) => (
            <PodiumCard key={item.id} item={item} size={index === 0 ? "second" : "third"} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
