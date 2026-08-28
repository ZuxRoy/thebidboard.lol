interface RankBadgeProps {
  rank: number;
  size?: "default" | "featured";
}

function getTierClasses(rank: number): string {
  if (rank === 1) return "bg-rank-gold text-ink";
  if (rank === 2) return "bg-rank-silver text-ink";
  if (rank === 3) return "bg-rank-bronze text-surface";
  return "bg-surface-soft text-ink-soft border border-border";
}

export default function RankBadge({ rank, size = "default" }: RankBadgeProps) {
  const dimensions = size === "featured" ? "w-12 h-12 text-base" : "w-9 h-9 text-xs";

  return (
    <span
      className={`${dimensions} shrink-0 rounded-2xl flex items-center justify-center font-bold amount ${getTierClasses(rank)}`}
    >
      #{rank}
    </span>
  );
}
