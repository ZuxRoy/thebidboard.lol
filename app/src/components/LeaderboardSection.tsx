import { useEffect, useState, type ReactNode } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useListings } from "../lib/api";
import type { FilterId } from "../lib/categories";
import ListingRow from "./ListingRow";
import { LeaderboardSkeleton } from "./Skeleton";

const PAGE_SIZE = 20;

interface LeaderboardSectionProps {
  category: FilterId;
}

export default function LeaderboardSection({ category }: LeaderboardSectionProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useListings(category, page, PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [category]);

  if (isError) {
    return (
      <p className="text-center text-ink-faint py-14 text-sm">
        Couldn&apos;t load the board. Refresh and try again.
      </p>
    );
  }

  if (isLoading || !data) {
    return <LeaderboardSkeleton />;
  }

  const items = data.items;
  const total = data.total;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (items.length === 0) {
    return (
      <p className="text-center text-ink-faint py-14 text-sm">
        No spots claimed in this category yet. Be the first.
      </p>
    );
  }

  function goToPage(next: number) {
    const clamped = Math.min(pageCount, Math.max(1, next));
    if (clamped === page) return;
    setPage(clamped);
    document.getElementById("leaderboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5 sm:gap-3">
        {items.map((item) => {
          const highlight = item.rank <= 3 ? (item.rank as 1 | 2 | 3) : undefined;
          return (
            <ListingRow
              key={item.id}
              item={item}
              size={item.rank <= 2 ? "featured" : "default"}
              highlight={highlight}
            />
          );
        })}
      </div>

      {pageCount > 1 ? (
        <Pagination
          page={page}
          pageCount={pageCount}
          total={total}
          pageSize={PAGE_SIZE}
          onPage={goToPage}
        />
      ) : null}
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
}) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = pageWindow(page, pageCount);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
      <p className="text-xs text-ink-faint amount text-center sm:text-left">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center justify-center gap-1">
        <PageButton
          label="Previous page"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          <CaretLeft size={14} weight="bold" />
        </PageButton>
        {pages.map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="px-1.5 text-ink-faint text-sm">
              …
            </span>
          ) : (
            <PageButton
              key={item}
              label={`Page ${item}`}
              active={item === page}
              onClick={() => onPage(item)}
            >
              {item}
            </PageButton>
          )
        )}
        <PageButton
          label="Next page"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          <CaretRight size={14} weight="bold" />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  children,
  label,
  onClick,
  disabled,
  active,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`min-w-8 h-8 px-2 rounded-full text-sm font-medium transition-colors disabled:opacity-30 disabled:pointer-events-none ${
        active
          ? "bg-ink text-surface"
          : "text-ink-soft hover:text-ink hover:bg-surface-soft"
      }`}
    >
      {children}
    </button>
  );
}

function pageWindow(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const set = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) {
    set.add(2);
    set.add(3);
    set.add(4);
  }
  if (current >= total - 2) {
    set.add(total - 1);
    set.add(total - 2);
    set.add(total - 3);
  }

  const sorted = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const items: Array<number | "gap"> = [];
  for (const n of sorted) {
    const prev = items[items.length - 1];
    if (typeof prev === "number" && n - prev > 1) items.push("gap");
    items.push(n);
  }
  return items;
}
