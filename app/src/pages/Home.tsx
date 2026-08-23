import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Ticker from "../components/Ticker";
import BulletinBoard from "../components/BulletinBoard";
import HeroClaimForm, { type HeroClaimFormHandle } from "../components/HeroClaimForm";
import TopThreeHero from "../components/TopThreeHero";
import CategoryFilterBar from "../components/CategoryFilterBar";
import LeaderboardSection from "../components/LeaderboardSection";
import Footer from "../components/Footer";
import { useListings } from "../lib/api";
import type { FilterId } from "../lib/categories";

export default function Home() {
  const [filter, setFilter] = useState<FilterId>("all");
  const formRef = useRef<HeroClaimFormHandle>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const { data: topThreeData } = useListings("all", 1, 3);

  function scrollToLeaderboard() {
    leaderboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col">
      <div className="min-h-screen flex flex-col">
        <Ticker />

        <header className="px-4 sm:px-6 py-4 sm:py-5">
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:border-b-2 sm:border-ink sm:pb-5">
            <p className="headline shrink-0 text-[clamp(2rem,7vw,3.75rem)] font-black tracking-tight leading-none">
              The<span className="text-accent">Bid</span>Board
            </p>

            <BulletinBoard onPickAmount={(amountCents) => formRef.current?.prefillAmount(amountCents)} />
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-8 flex flex-col">
          <div className="flex-1 flex flex-col justify-center">
            <section className="max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-8 items-start">
              <div className="order-2 sm:order-1 w-full">
                <HeroClaimForm ref={formRef} />
              </div>

              <div className="order-1 sm:order-2 w-full flex flex-col gap-6">
                <h2 className="headline text-center text-2xl sm:text-4xl font-black leading-tight">
                  Top of the <span className="text-accent">Board</span>
                </h2>
                <TopThreeHero items={topThreeData?.items ?? []} />
              </div>
            </section>
          </div>

          <div className="flex justify-center pt-8 pb-2">
            <button
              type="button"
              onClick={scrollToLeaderboard}
              aria-label="Scroll to leaderboard"
              className="inline-flex items-center gap-2 bg-accent text-paper uppercase tracking-wide text-sm font-semibold px-6 py-2.5 border-2 border-ink hover:bg-accent-dark transition-colors"
            >
              Leaderboard
              <ChevronDown className="w-4 h-4 animate-bounce" strokeWidth={2.5} />
            </button>
          </div>
        </main>
      </div>

      <section
        ref={leaderboardRef}
        className="px-4 sm:px-6 py-10 flex flex-col gap-8 max-w-5xl mx-auto w-full"
      >
        <CategoryFilterBar value={filter} onChange={setFilter} />
        <LeaderboardSection category={filter} />
      </section>

      <Footer />
    </div>
  );
}
