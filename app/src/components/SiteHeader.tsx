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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link to="/" className="display text-xl font-semibold text-ink shrink-0">
          TheBidBoard
        </Link>
        <div className="flex-1 flex justify-center min-w-0">
          <PresenceBar />
        </div>
        <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium text-ink-soft shrink-0">
          <Link to="/#leaderboard" onClick={goToLeaderboard} className="hover:text-ink transition-colors">
            Leaderboard
          </Link>
          <Link to="/stats" className="hover:text-ink transition-colors">
            Stats
          </Link>
          <Link
            to="/#claim"
            className="rounded-full bg-ink text-surface px-3 sm:px-4 py-1.5 hover:bg-accent-dark transition-colors"
          >
            Claim a spot
          </Link>
        </nav>
      </div>
    </header>
  );
}
