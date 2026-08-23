import type { ListingRow as ListingRowData } from "../lib/api";
import ProductCardContent, { type CardContentSize } from "./ProductCardContent";

interface TopThreeHeroProps {
  items: ListingRowData[];
}

interface RankStyle {
  size: CardContentSize;
  card: string;
  wrapper: string;
  badgePosition: string;
  badgeSize: string;
  badgeColor: string;
}

const RANK_STYLES: RankStyle[] = [
  {
    size: "lg",
    card: "p-5 sm:p-7 border-accent",
    wrapper: "-rotate-2 z-30",
    badgePosition: "-top-5 -left-5 sm:-top-6 sm:-left-6",
    badgeSize: "w-14 h-14 sm:w-16 sm:h-16 text-xl sm:text-2xl",
    badgeColor: "bg-accent text-paper",
  },
  {
    size: "md",
    card: "p-4 sm:p-5 border-ink",
    wrapper: "rotate-2 translate-x-3 sm:translate-x-6 z-20",
    badgePosition: "-top-4 -right-4 sm:-top-5 sm:-right-5",
    badgeSize: "w-11 h-11 sm:w-14 sm:h-14 text-base sm:text-lg",
    badgeColor: "bg-ink text-paper",
  },
  {
    size: "sm",
    card: "p-3.5 sm:p-4 border-ink",
    wrapper: "-rotate-1 translate-x-1 sm:-translate-x-2 z-10",
    badgePosition: "-top-3.5 -left-3.5 sm:-top-4 sm:-left-4",
    badgeSize: "w-9 h-9 sm:w-11 sm:h-11 text-sm sm:text-base",
    badgeColor: "bg-ink text-paper",
  },
];

export default function TopThreeHero({ items }: TopThreeHeroProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {items.slice(0, 3).map((item, index) => {
        const style = RANK_STYLES[index];
        return (
          <div key={item.id} className={`relative ${style.wrapper}`}>
            <div
              className={`absolute ${style.badgePosition} ${style.badgeSize} ${style.badgeColor} flex items-center justify-center rounded-full font-black headline border-[3px] border-paper shadow-md`}
            >
              #{item.rank}
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block newsprint-card ${style.card} hover:scale-[1.03] hover:rotate-0 hover:z-40 transition-transform duration-300`}
            >
              <ProductCardContent item={item} size={style.size} />
            </a>
          </div>
        );
      })}
    </div>
  );
}
