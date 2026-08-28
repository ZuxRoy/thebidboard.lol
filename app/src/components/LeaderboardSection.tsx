import { useEffect, useState } from "react";
import { useListings, type ListingRow as ListingRowData } from "../lib/api";
import type { FilterId } from "../lib/categories";
import ListingRow from "./ListingRow";

const PAGE_SIZE = 100;

interface LeaderboardSectionProps {
  category: FilterId;
}

export default function LeaderboardSection({ category }: LeaderboardSectionProps) {
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<ListingRowData[]>([]);
  const { data, isLoading, isFetching } = useListings(category, page, PAGE_SIZE);

  useEffect(() => {
    setPage(1);
    setAccumulated([]);
  }, [category]);

  useEffect(() => {
    if (!data) return;
    setAccumulated((prev) => {
      if (data.page === 1) return data.items;
      const seen = new Set(prev.map((item) => item.id));
      return [...prev, ...data.items.filter((item) => !seen.has(item.id))];
    });
  }, [data]);

  if (isLoading && accumulated.length === 0) {
    return <p className="text-center text-ink-faint py-14 text-sm">Loading the board...</p>;
  }

  if (accumulated.length === 0) {
    return (
      <p className="text-center text-ink-faint py-14 text-sm">
        No spots claimed in this category yet. Be the first.
      </p>
    );
  }

  const top3 = accumulated.filter((item) => item.rank <= 3);
  const top10 = accumulated.filter((item) => item.rank > 3 && item.rank <= 10);
  const top100 = accumulated.filter((item) => item.rank > 10 && item.rank <= 100);
  const rest = accumulated.filter((item) => item.rank > 100);

  const total = data?.total ?? accumulated.length;
  const hasMore = accumulated.length < total;

  return (
    <div className="flex flex-col gap-10">
      {top3.length > 0 ? (
        <section>
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {top3.map((item) => {
              const highlight = item.rank <= 3 ? (item.rank as 1 | 2 | 3) : undefined;
              return (
                <ListingRow
                  key={item.id}
                  item={item}
                  size={item.rank === 1 ? "featured" : item.rank === 2 ? "featured" : "default"}
                  highlight={highlight}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      {top10.length > 0 ? (
        <section>
          <SectionDivider label="Top 10" />
          <div className="flex flex-col gap-2.5">
            {top10.map((item) => (
              <ListingRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {top100.length > 0 ? (
        <section>
          <SectionDivider label="Top 100" />
          <div className="flex flex-col gap-2.5">
            {top100.map((item) => (
              <ListingRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section>
          <SectionDivider label="Rest of the board" />
          <div className="flex flex-col gap-2.5">
            {rest.map((item) => (
              <ListingRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {hasMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={isFetching}
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-ink-soft hover:border-ink-faint hover:text-ink transition-colors disabled:opacity-60"
          >
            {isFetching ? "Loading..." : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3.5">
      <span className="display text-sm font-semibold uppercase tracking-wide text-ink-soft shrink-0">
        {label}
      </span>
      <span className="flex-1 holo-divider" />
    </div>
  );
}
