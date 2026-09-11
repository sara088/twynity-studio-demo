import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────
// List — a stack of rows: optional leading icon, a title + meta line, and an
// optional trailing slot (value, badge, or action). The everyday "show me a
// few results" component.
// ─────────────────────────────────────────────────────────────────────────

type ListItem = {
  icon?: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
};

function List({
  items,
  className,
}: {
  items: ListItem[];
  className?: string;
}) {
  return (
    <ul
      data-slot="mcp-list"
      className={cn("divide-y divide-border", className)}
    >
      {items.map((it, i) => (
        <li key={i} className="flex items-center gap-3 py-2.5">
          {it.icon != null && (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-violet-light text-violet">
              {it.icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-dark">
              {it.title}
            </div>
            {it.meta != null && (
              <div className="truncate text-[12px] text-gray-4">{it.meta}</div>
            )}
          </div>
          {it.trailing != null && (
            <span className="shrink-0 text-[12.5px] text-gray-3">
              {it.trailing}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export { List };
export type { ListItem };
