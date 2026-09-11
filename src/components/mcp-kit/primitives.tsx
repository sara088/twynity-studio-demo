import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────
// Small shared primitives used across the kit.
// ─────────────────────────────────────────────────────────────────────────

// Uppercase micro-label that titles a block of content inside a card.
function SectionLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="mcp-section-label"
      className={cn(
        "text-[11px] font-bold uppercase tracking-[0.08em] text-gray-5",
        className
      )}
      {...props}
    />
  );
}

// Compact status/stat pill. `mint` for positive, `violet` for accent.
function Chip({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & { tone?: "neutral" | "mint" | "violet" }) {
  return (
    <span
      data-slot="mcp-chip"
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[12px]",
        tone === "neutral" && "bg-bg-input text-gray-3",
        tone === "mint" && "bg-mint font-semibold text-mint-text",
        tone === "violet" && "bg-violet-light font-semibold text-violet",
        className
      )}
      {...props}
    />
  );
}

export { SectionLabel, Chip };
