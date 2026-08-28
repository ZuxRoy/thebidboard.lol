export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-black/[0.06] ${className}`} />;
}

export function ListingRowSkeleton({
  featured = false,
  compact = false,
}: {
  featured?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`surface-card ${compact ? "p-3" : featured ? "p-4 sm:p-5" : "p-3.5 sm:p-4"}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <Skeleton className={`${compact ? "w-6 h-6" : "w-8 h-8"} rounded-full shrink-0`} />
        <Skeleton
          className={`${compact ? "w-8 h-8" : featured ? "w-14 h-14" : "w-10 h-10"} rounded-xl shrink-0`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className={`h-4 ${featured ? "w-44" : "w-36"}`} />
            <Skeleton className="h-4 w-12 shrink-0" />
          </div>
          <Skeleton className={`h-3 mt-2 ${compact ? "w-3/4" : "w-5/6"}`} />
          {!compact ? <Skeleton className="h-3 mt-1.5 w-2/5" /> : null}
          <div className="flex items-center justify-between gap-3 mt-3">
            <Skeleton className="h-5 w-24 rounded-full" />
            <div className="flex gap-1.5">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="w-5 h-5 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 sm:gap-3" aria-hidden>
      <ListingRowSkeleton featured />
      <ListingRowSkeleton featured />
      <ListingRowSkeleton />
      <ListingRowSkeleton />
      <ListingRowSkeleton />
      <ListingRowSkeleton />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="surface-card p-5">
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="surface-card p-5 sm:p-6 min-h-[11rem]">
          <Skeleton className="h-5 w-48 mb-5" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-full rounded-full" />
            <Skeleton className="h-6 w-4/5 rounded-full" />
            <Skeleton className="h-6 w-3/5 rounded-full" />
          </div>
        </div>
        <div className="surface-card p-5 sm:p-6 min-h-[11rem] grid sm:grid-cols-2 gap-5">
          <div>
            <Skeleton className="h-3 w-20 mb-3" />
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
