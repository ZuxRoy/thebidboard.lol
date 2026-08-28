import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { CATEGORIES, type FilterId } from "../lib/categories";

interface CategoryFilterBarProps {
  value: FilterId;
  onChange: (value: FilterId) => void;
}

const SCROLL_AMOUNT = 260;
const EDGE = 4;

const arrowClass =
  "flex shrink-0 w-8 h-8 items-center justify-center rounded-full border border-border bg-surface text-ink-soft hover:border-accent hover:text-accent transition-colors";

export default function CategoryFilterBar({ value, onChange }: CategoryFilterBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > EDGE);
    setCanScrollRight(maxScroll > EDGE && el.scrollLeft < maxScroll - EDGE);
  }, []);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState]);

  function scrollByAmount(direction: 1 | -1) {
    trackRef.current?.scrollBy({ left: direction * SCROLL_AMOUNT, behavior: "smooth" });
  }

  const overflow = canScrollLeft || canScrollRight;

  return (
    <div className="relative flex items-center gap-2">
      {overflow ? (
        <button
          type="button"
          onClick={() => scrollByAmount(-1)}
          aria-label="Scroll categories left"
          disabled={!canScrollLeft}
          className={`${arrowClass} ${canScrollLeft ? "" : "invisible pointer-events-none"}`}
        >
          <CaretLeft size={14} weight="bold" />
        </button>
      ) : null}

      <div className="relative flex-1 min-w-0">
        <div
          ref={trackRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-1 py-1"
        >
          <div className="flex gap-2 w-max">
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
        </div>
        {canScrollLeft ? (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-bg to-transparent" />
        ) : null}
        {canScrollRight ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-bg to-transparent" />
        ) : null}
      </div>

      {overflow ? (
        <button
          type="button"
          onClick={() => scrollByAmount(1)}
          aria-label="Scroll categories right"
          disabled={!canScrollRight}
          className={`${arrowClass} ${canScrollRight ? "" : "invisible pointer-events-none"}`}
        >
          <CaretRight size={14} weight="bold" />
        </button>
      ) : null}
    </div>
  );
}
