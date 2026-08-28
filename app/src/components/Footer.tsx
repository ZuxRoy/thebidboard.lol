import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-faint">
        <p>TheBidBoard &copy; {new Date().getFullYear()}</p>
        <nav className="flex items-center gap-5">
          <Link to="/stats" className="hover:text-ink transition-colors">
            Stats
          </Link>
          <Link to="/terms" className="hover:text-ink transition-colors">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-ink transition-colors">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
