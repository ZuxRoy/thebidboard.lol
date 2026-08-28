import { useRef, useState } from "react";
import Ticker from "../components/Ticker";
import SiteHeader from "../components/SiteHeader";
import EntrySection from "../components/EntrySection";
import CategoryFilterBar from "../components/CategoryFilterBar";
import LeaderboardSection from "../components/LeaderboardSection";
import Footer from "../components/Footer";
import type { FilterId } from "../lib/categories";

export default function Home() {
  const [filter, setFilter] = useState<FilterId>("all");
  const leaderboardRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <Ticker />
      <SiteHeader />

      <EntrySection />

      <section
        id="leaderboard"
        ref={leaderboardRef}
        className="px-4 sm:px-6 pb-14 flex flex-col gap-4 max-w-6xl mx-auto w-full scroll-mt-16"
      >
        <CategoryFilterBar value={filter} onChange={setFilter} />
        <LeaderboardSection key={filter} category={filter} />
      </section>

      <Footer />
    </div>
  );
}
