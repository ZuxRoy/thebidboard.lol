import SiteHeader from "../components/SiteHeader";
import Footer from "../components/Footer";
import { useBoardStats, type ClickPoint } from "../lib/api";
import { StatsSkeleton } from "../components/Skeleton";
import { formatAmount, formatTimeAgo } from "../lib/validators";
import { getCategoryMeta } from "../lib/categories";

export default function Stats() {
  const { data, isLoading } = useBoardStats();

  const categories = data?.categories ?? [];
  const maxVolume = Math.max(1, ...categories.map((c) => c.volumeCents));
  const series = data?.clicksSeries ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="px-4 sm:px-6 py-10 sm:py-14 max-w-6xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="display text-3xl sm:text-[2.25rem] font-semibold text-ink">Live board stats</h1>
            <p className="text-ink-soft mt-2 max-w-xl">
              Board numbers from listings, clicks from Cloudflare.
            </p>
          </div>

          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <div className="holo-glow holo-glow-fixed holo-glow-stage">
            <div className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile label="Total bid volume" value={formatAmount(data?.totalVolumeCents ?? 0)} />
                <StatTile label="Listings" value={String(data?.totalListings ?? 0)} />
                <StatTile label="Online now" value={String(data?.onlineNow ?? 0)} live />
                <StatTile label="Clicks" value={(data?.totalClicks ?? 0).toLocaleString()} />
              </div>

              <div className="grid lg:grid-cols-2 gap-4 items-stretch">
                <div className="surface-card p-5 sm:p-6 min-h-[11rem]">
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

                <div className="surface-card p-5 sm:p-6 min-h-[11rem] grid sm:grid-cols-2 gap-5 sm:gap-0 sm:divide-x sm:divide-border">
                  <Highlight
                    label="Current #1"
                    title={data?.topDomain ?? "No listings yet"}
                    detail={data?.topDomain ? formatAmount(data.topAmountCents) : "—"}
                    detailClass="amount text-accent-dark"
                  />
                  <Highlight
                    label="Newest listing"
                    title={data?.newestDomain ?? "No listings yet"}
                    detail={data?.newestAt ? formatTimeAgo(data.newestAt) : "—"}
                    className="sm:pl-6"
                  />
                </div>
              </div>

              {series.length > 1 ? (
                <div className="surface-card p-5 sm:p-6">
                  <h2 className="display text-lg font-semibold text-ink mb-1">Clicks</h2>
                  <p className="text-xs text-ink-faint mb-4">Daily requests from Cloudflare</p>
                  <ClicksChart series={series} />
                </div>
              ) : null}
            </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatTile({
  label,
  value,
  live,
}: {
  label: string;
  value: string;
  live?: boolean;
}) {
  return (
    <div className="surface-card p-5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint mb-1.5 flex items-center gap-1.5">
        {live ? (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
        ) : null}
        {label}
      </p>
      <p className="amount text-2xl sm:text-[1.75rem] font-bold text-ink">{value}</p>
    </div>
  );
}

function Highlight({
  label,
  title,
  detail,
  detailClass = "text-ink-faint",
  className = "",
}: {
  label: string;
  title: string;
  detail: string;
  detailClass?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col justify-center ${className}`}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint mb-1">{label}</p>
      <p className="font-semibold text-ink truncate">{title}</p>
      <p className={`text-sm mt-0.5 ${detailClass}`}>{detail}</p>
    </div>
  );
}

function ClicksChart({ series }: { series: ClickPoint[] }) {
  const width = 640;
  const height = 180;
  const padX = 8;
  const padY = 10;
  const max = Math.max(1, ...series.map((point) => point.clicks));
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const coords = series.map((point, index) => {
    const x = padX + (index / Math.max(1, series.length - 1)) * innerW;
    const y = padY + innerH - (point.clicks / max) * innerH;
    return `${x},${y}`;
  });

  const line = coords.join(" ");
  const area = `${padX},${padY + innerH} ${line} ${padX + innerW},${padY + innerH}`;
  const first = series[0]?.date;
  const last = series[series.length - 1]?.date;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40" role="img" aria-label="Clicks over time">
        <defs>
          <linearGradient id="clicksFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-holo-2)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#clicksFill)" />
        <polyline points={line} fill="none" stroke="var(--color-accent-dark)" strokeWidth="2" />
      </svg>
      {first && last ? (
        <div className="flex justify-between text-[11px] text-ink-faint mt-1">
          <span>{first}</span>
          <span>{last}</span>
        </div>
      ) : null}
    </div>
  );
}
