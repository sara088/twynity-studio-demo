import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────
// BarChart — a lightweight, dependency-free comparison chart.
// Bars use violet-mid; pass `highlight: true` on the bar you want to stand out
// (rendered in solid violet). For richer charts an app can drop in its own
// renderer inside the content area — this covers the common "compare a few
// values" case shown in the guide.
// ─────────────────────────────────────────────────────────────────────────

type Bar = { label: string; value: number; highlight?: boolean };

function BarChart({
  data,
  height = 150,
  className,
}: {
  data: Bar[];
  height?: number;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div data-slot="mcp-chart" className={className}>
      <div
        className="flex items-end gap-4 border-b border-border"
        style={{ height }}
      >
        {data.map((d) => (
          // Bars are DIRECT children of the fixed-height row, so their
          // percentage height resolves against `height` (a nested wrapper
          // would be content-sized → 0, collapsing the bars).
          <div
            key={d.label}
            className={cn(
              "min-w-0 flex-1 rounded-t-[6px]",
              d.highlight ? "bg-violet" : "bg-violet-mid"
            )}
            style={{ height: `${Math.max((d.value / max) * 100, 3)}%` }}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-4">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 text-center text-[10.5px] text-gray-4"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export { BarChart };
export type { Bar };
