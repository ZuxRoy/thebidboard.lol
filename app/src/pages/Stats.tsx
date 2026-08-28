import SiteHeader from "../components/SiteHeader";
import Footer from "../components/Footer";
import { useBoardStats } from "../lib/api";
import { formatAmount, formatTimeAgo } from "../lib/validators";
import { getCategoryMeta } from "../lib/categories";

export default function Stats() {
  const { data, isLoading } = useBoardStats();

  const categories = data?.categories ?? [];
  const maxVolume = Math.max(1, ...categories.map((c) => c.volumeCents));

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-6 py-10 sm:py-14 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="display text-3xl sm:text-[2.25rem] font-semibold text-ink">Live board stats</h1>
          <p className="text-ink-soft mt-2 max-w-xl">
            Real numbers pulled straight from the board. No mockups, no estimates.
          </p>
        </div>

        {isLoading ? (
          <p className="text-ink-faint text-sm py-10 text-center">Loading stats...</p>
        ) : (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
            <div className="surface-card holo-glow p-5 sm:p-6">
              <h2 className="display text-lg font-semibold text-ink mb-4">Bid volume by category</h2>
              {categories.length === 0 ? (
                <p className="text-sm text-ink-faint">No active listings yet.</p>
              ) : (
                <div className="flex flex-col gap-3.5">
                  {categories.map((row) => {
                    const meta = getCategoryMeta(row.category);
                    const widthPct = Math.max(4, (row.volumeCents / maxVolume) * 100);
                    return (
                      <div key={row.category} className="flex items-center gap-3">
                        <div className="w-32 sm:w-40 shrink-0 flex items-center gap-1.5 text-xs sm:text-sm text-ink-soft truncate">
                          {meta ? <meta.icon size={14} weight="regular" /> : null}
                          <span className="truncate">{meta?.label ?? row.category}</span>
                        </div>
                        <div className="flex-1 h-6 rounded-full bg-surface-soft overflow-hidden">
                          <div
                            className="h-full rounded-full holo-ring"
                            style={{ width: `${widthPct}%`, opacity: 0.85 }}
                          />
                        </div>
                        <div className="w-16 sm:w-20 shrink-0 text-right amount text-sm font-semibold text-ink">
                          {formatAmount(row.volumeCents)}
                        </div>
                        <div className="hidden sm:block w-14 shrink-0 text-right text-xs text-ink-faint">
                          {row.count} listed
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <StatTile label="Total bid volume" value={formatAmount(data?.totalVolumeCents ?? 0)} large />
              <div className="grid grid-cols-2 gap-4">
                <StatTile label="Listings" value={String(data?.totalListings ?? 0)} />
                <StatTile label="Online now" value={String(data?.onlineNow ?? 0)} live />
              </div>
              <StatTile label="Visitors all-time" value={String(data?.totalVisitors ?? 0)} />
              {data?.topDomain ? (
                <div className="surface-card p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint mb-1">
                    Current #1
                  </p>
                  <p className="font-semibold text-ink">{data.topDomain}</p>
                  <p className="amount text-sm text-accent-dark mt-0.5">{formatAmount(data.topAmountCents)}</p>
                </div>
              ) : null}
              {data?.newestDomain && data?.newestAt ? (
                <div className="surface-card p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint mb-1">
                    Newest listing
                  </p>
                  <p className="font-semibold text-ink">{data.newestDomain}</p>
                  <p className="text-sm text-ink-faint mt-0.5">{formatTimeAgo(data.newestAt)}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function StatTile({
  label,
  value,
  large,
  live,
}: {
  label: string;
  value: string;
  large?: boolean;
  live?: boolean;
}) {
  return (
    <div className={`surface-card p-5 ${large ? "holo-glow holo-glow-fixed" : ""}`}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint mb-1.5 flex items-center gap-1.5">
        {live ? (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
        ) : null}
        {label}
      </p>
      <p className={`amount font-bold text-ink ${large ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{value}</p>
    </div>
  );
}
