import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────
// DataTable — tabular data, themed with Studio tokens.
// The first column reads as the row's label (bold/dark); numeric columns use
// font-sans + tabular-nums per the house rule. Pass `highlight` to tint a row
// (e.g. "you" in a comparison).
// ─────────────────────────────────────────────────────────────────────────

type Column<T> = {
  key: keyof T & string;
  header: string;
  align?: "left" | "right";
  numeric?: boolean;
  render?: (row: T) => React.ReactNode;
};

function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  highlight,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  highlight?: (row: T, index: number) => boolean;
  className?: string;
}) {
  const firstKey = columns[0]?.key;
  return (
    <table
      data-slot="mcp-table"
      className={cn("w-full border-collapse text-[13px]", className)}
    >
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-[0.06em] text-gray-5">
          {columns.map((c) => (
            <th
              key={c.key}
              className={cn(
                "border-b border-border py-2 font-semibold",
                c.align === "right" && "text-right"
              )}
            >
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={cn(highlight?.(row, i) && "bg-violet-light/60")}>
            {columns.map((c) => {
              const isLabel = c.key === firstKey;
              return (
                <td
                  key={c.key}
                  className={cn(
                    "border-b border-border py-2.5",
                    c.align === "right" && "text-right",
                    isLabel
                      ? "font-semibold text-dark"
                      : c.numeric
                        ? "font-sans tabular-nums text-gray-2"
                        : "text-gray-3"
                  )}
                >
                  {c.render ? c.render(row) : String(row[c.key] ?? "")}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export { DataTable };
export type { Column };
