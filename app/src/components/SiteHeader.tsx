import { Link, useLocation } from "react-router-dom";
import PresenceBar from "./PresenceBar";

export default function SiteHeader() {
  const location = useLocation();

  function goToLeaderboard(event: React.MouseEvent<HTMLAnchorElement>) {
    if (location.pathname !== "/") return;
    event.preventDefault();
    document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header className="border-b border-border">
      <div className="relative max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-3">
        <Link to="/" className="relative z-10 display text-lg sm:text-xl font-semibold text-ink shrink-0">
          TheBidBoard
        </Link>
        <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto min-w-0 px-2">
            <PresenceBar />
          </div>
        </div>
        <nav className="relative z-10 flex items-center gap-2 sm:gap-5 text-[13px] sm:text-sm font-medium text-ink-soft shrink-0">
          <Link to="/#leaderboard" onClick={goToLeaderboard} className="hover:text-ink transition-colors">
            Leaderboard
          </Link>
          <Link to="/stats" className="hover:text-ink transition-colors">
            Stats
          </Link>
          <Link
            to="/#claim"
            className="rounded-full bg-ink text-surface px-3 sm:px-4 py-1.5 hover:bg-accent-dark transition-colors whitespace-nowrap"
          >
            <span className="sm:hidden">Claim</span>
            <span className="hidden sm:inline">Claim a spot</span>
          </Link>
        </nav>
      </div>
      <div className="md:hidden border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-2 flex justify-center">
          <PresenceBar />
        </div>
      </div>
    </header>
  );
}
