import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Padded, chevron'd "View all" — a comfortable tap target on touch, and a
// negative right margin so it still optically aligns to the row's edge.
const VIEW_ALL_CLS =
  "-mr-1.5 inline-flex shrink-0 items-center gap-0.5 rounded-lg px-2.5 py-2 text-[12.5px] font-bold text-violet transition-colors hover:bg-violet-light active:bg-violet-light";

export function RowHeader({
  title,
  caption,
  viewAllLabel = "View All",
  viewAllHref,
  soon = false,
  onScroll,
}: {
  title: string;
  caption?: string;
  viewAllLabel?: string;
  viewAllHref?: string;
  soon?: boolean;
  onScroll?: (dir: -1 | 1) => void;
}) {
  return (
    // Mobile: View-all aligns to the title row so the caption flows full-width
    // beneath it (no crowding). Desktop: bottom-aligned next to the caption.
    <div className="mb-4 flex items-start justify-between gap-3 sm:items-end">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h2 className="font-heading text-[22px] font-semibold tracking-[-0.5px] text-dark">
            {title}
          </h2>
          {soon && (
            <span className="rounded-full border-[1.5px] border-violet/40 bg-white px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-violet">
              Soon
            </span>
          )}
        </div>
        {caption && <p className="mt-1 text-[12.5px] text-gray-3">{caption}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {!soon &&
          (viewAllHref ? (
            <Link href={viewAllHref} className={VIEW_ALL_CLS}>
              {viewAllLabel}
              <ChevronRight size={14} />
            </Link>
          ) : (
            <button type="button" className={VIEW_ALL_CLS}>
              {viewAllLabel}
              <ChevronRight size={14} />
            </button>
          ))}
        {/* Scroll arrows are redundant on touch (swipe) — desktop only. */}
        <button
          type="button"
          onClick={() => onScroll?.(-1)}
          aria-label="Scroll left"
          className="hidden h-8 w-8 place-items-center rounded-[8px] border border-border bg-white text-gray-3 hover:border-violet hover:text-violet sm:grid"
        >
          <ChevronLeft size={13} />
        </button>
        <button
          type="button"
          onClick={() => onScroll?.(1)}
          aria-label="Scroll right"
          className="hidden h-8 w-8 place-items-center rounded-[8px] border border-border bg-white text-gray-3 hover:border-violet hover:text-violet sm:grid"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
