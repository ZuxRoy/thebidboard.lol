import { useRef } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { CATEGORIES, type FilterId } from "../lib/categories";

interface CategoryFilterBarProps {
  value: FilterId;
  onChange: (value: FilterId) => void;
}

const SCROLL_AMOUNT = 260;

export default function CategoryFilterBar({ value, onChange }: CategoryFilterBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByAmount(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * SCROLL_AMOUNT, behavior: "smooth" });
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        aria-label="Scroll categories left"
        className="flex shrink-0 w-8 h-8 items-center justify-center rounded-full border border-border bg-surface text-ink-soft hover:border-accent hover:text-accent transition-colors"
      >
        <CaretLeft size={14} weight="bold" />
      </button>

      <div className="relative flex-1 min-w-0">
        <div
          ref={trackRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-1 py-1"
        >
          {CATEGORIES.map((category) => {
            const active = category.id === value;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onChange(category.id)}
                className={`snap-start flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full border text-xs font-medium transition-colors shrink-0 ${
                  active
                    ? "bg-ink text-surface border-ink"
                    : "bg-surface text-ink-soft border-border hover:border-ink-faint hover:text-ink"
                }`}
              >
                <category.icon size={14} weight={active ? "bold" : "regular"} />
                {category.label}
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-bg to-transparent" />
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        aria-label="Scroll categories right"
        className="flex shrink-0 w-8 h-8 items-center justify-center rounded-full border border-border bg-surface text-ink-soft hover:border-accent hover:text-accent transition-colors"
      >
        <CaretRight size={14} weight="bold" />
      </button>
    </div>
  );
}
