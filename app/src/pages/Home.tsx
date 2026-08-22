import { useRef, useState } from "react";
import Ticker from "../components/Ticker";
import BulletinBoard from "../components/BulletinBoard";
import HeroClaimForm, { type HeroClaimFormHandle } from "../components/HeroClaimForm";
import CategoryFilterBar from "../components/CategoryFilterBar";
import LeaderboardSection from "../components/LeaderboardSection";
import Footer from "../components/Footer";
import type { FilterId } from "../lib/categories";

export default function Home() {
  const [filter, setFilter] = useState<FilterId>("all");
  const formRef = useRef<HeroClaimFormHandle>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Ticker />

      <header className="border-b-2 border-ink py-4">
        <p className="headline text-center text-2xl font-black tracking-tight">
          The<span className="text-accent">Bid</span>Board
        </p>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-10 flex flex-col gap-14">
        <section className="text-center flex flex-col gap-10">
          <h1 className="headline text-4xl sm:text-6xl font-black leading-tight">
            Fight for the <span className="text-accent">Top Spot</span>
          </h1>

          <BulletinBoard onPickAmount={(amountCents) => formRef.current?.prefillAmount(amountCents)} />

          <HeroClaimForm ref={formRef} />
        </section>

        <section className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
          <CategoryFilterBar value={filter} onChange={setFilter} />
          <LeaderboardSection category={filter} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
