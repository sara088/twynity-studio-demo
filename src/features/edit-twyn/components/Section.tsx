"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// A big collapsible section — title + one-line summary + chevron, click to
// expand/collapse. Default open; collapsing is for focus on a long page.
export function Section({
  title,
  summary,
  defaultOpen = true,
  right,
  children,
}: {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  /** Optional element shown at the right of the header (e.g. a count). */
  right?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-card border border-border bg-white shadow-[0_1px_2px_rgba(15,15,30,0.04)]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-bg-input/40"
      >
        <h2 className="shrink-0 font-heading text-[15.5px] font-semibold tracking-[-0.3px] text-dark">
          {title}
        </h2>
        <span className="mx-0.5 hidden h-3.5 w-px shrink-0 bg-border sm:block" />
        {summary && (
          <p className="hidden min-w-0 flex-1 truncate text-[12.5px] text-gray-4 sm:block">
            {summary}
          </p>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-3 sm:ml-0">
          {right}
          <ChevronDown
            size={18}
            className={cn("text-gray-4 transition-transform", open && "rotate-180")}
          />
        </span>
      </button>
      {open && <div className="border-t border-border p-5">{children}</div>}
    </section>
  );
}
