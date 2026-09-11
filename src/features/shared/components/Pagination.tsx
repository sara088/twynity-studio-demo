"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Numbered pagination with prev/next and ellipsis collapsing. Hidden when there's
// only one page. Reusable across catalog/list views.
export function Pagination({
  page,
  pageCount,
  onChange,
  className,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  const items = pageItems(page, pageCount);
  const base =
    "grid h-9 min-w-9 place-items-center rounded-[9px] border px-2 text-[13px] font-semibold transition-colors";
  const ghost =
    "border-border bg-white text-gray-3 hover:border-violet hover:text-violet disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1.5", className)}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={cn(base, ghost)}
      >
        <ChevronLeft size={15} />
      </button>

      {items.map((it, i) =>
        it === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-[13px] text-gray-5">
            …
          </span>
        ) : (
          <button
            key={it}
            type="button"
            aria-current={it === page ? "page" : undefined}
            onClick={() => onChange(it)}
            className={cn(
              base,
              it === page
                ? "border-violet bg-violet text-white"
                : "border-border bg-white text-gray-2 hover:border-violet hover:text-violet",
            )}
          >
            {it}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={page === pageCount}
        onClick={() => onChange(page + 1)}
        className={cn(base, ghost)}
      >
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}

// 1 … p-1 p p+1 … N, de-duped and gap-collapsed.
function pageItems(page: number, total: number): (number | "…")[] {
  const wanted = new Set<number>([1, total, page, page - 1, page + 1]);
  const nums = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of nums) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}
