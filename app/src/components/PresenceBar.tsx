import { Link } from "react-router-dom";
import { usePresenceStats } from "../lib/api";

export default function PresenceBar() {
  const { data } = usePresenceStats();
  const online = data?.onlineNow ?? 0;
  const visitors = data?.totalVisitors ?? 0;

  return (
    <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-border bg-surface-soft px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-[12px] text-ink-soft max-w-full">
      <span className="inline-flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        <span className="amount font-medium text-emerald-700">{online.toLocaleString()}</span>
        <span className="text-emerald-700">online</span>
      </span>
      <span className="text-ink-faint hidden sm:inline" aria-hidden>
        &middot;
      </span>
      <span className="hidden sm:inline whitespace-nowrap">
        <span className="amount font-medium text-ink">{visitors.toLocaleString()}</span> visitors
      </span>
      <span className="text-ink-faint hidden md:inline" aria-hidden>
        &middot;
      </span>
      <Link to="/stats" className="hidden md:inline font-medium text-ink-soft hover:text-ink transition-colors whitespace-nowrap">
        see stats &rarr;
      </Link>
    </div>
  );
}
