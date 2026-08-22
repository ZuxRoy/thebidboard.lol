import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        className="flex shrink-0 w-7 h-7 sm:w-8 sm:h-8 items-center justify-center border-2 border-ink bg-paper hover:bg-ink hover:text-paper transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
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
                className={`snap-start flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 border-2 text-xs uppercase tracking-wide font-semibold transition-colors shrink-0 ${
                  active
                    ? "bg-ink text-paper border-ink"
                    : "bg-paper text-ink border-ink/40 hover:border-ink"
                }`}
              >
                <category.icon className="w-3.5 h-3.5" strokeWidth={2} />
                {category.label}
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-paper to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-paper to-transparent" />
      </div>

      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        aria-label="Scroll categories right"
        className="flex shrink-0 w-7 h-7 sm:w-8 sm:h-8 items-center justify-center border-2 border-ink bg-paper hover:bg-ink hover:text-paper transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
