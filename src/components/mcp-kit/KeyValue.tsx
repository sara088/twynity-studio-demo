import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────
// KeyValue — a summary of labelled facts (a "key-value summary" in the kit).
// Values use font-sans + tabular-nums so numbers line up. Defaults to two
// columns; pass `columns={1}` for a stacked list.
// ─────────────────────────────────────────────────────────────────────────

type Pair = { label: React.ReactNode; value: React.ReactNode };

function KeyValue({
  pairs,
  columns = 2,
  className,
}: {
  pairs: Pair[];
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <dl
      data-slot="mcp-keyvalue"
      className={cn(
        "grid gap-x-6 gap-y-3",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        className
      )}
    >
      {pairs.map((p, i) => (
        <div key={i}>
          <dt className="text-[11px] font-medium uppercase tracking-[0.05em] text-gray-5">
            {p.label}
          </dt>
          <dd className="mt-0.5 font-sans text-[14px] font-semibold tabular-nums text-dark">
            {p.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export { KeyValue };
export type { Pair };
