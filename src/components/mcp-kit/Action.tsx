import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────
// Action — the only button an MCP app should use.
// Design-guide rule: at most TWO primary actions per card, and the brand
// accent (filled violet) goes on the primary only. Everything else is
// `secondary` (outlined neutral). This keeps every app's call-to-action
// consistent with Studio.
// ─────────────────────────────────────────────────────────────────────────

function Action({
  className,
  variant = "secondary",
  size = "md",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
}) {
  return (
    <button
      data-slot="mcp-action"
      data-variant={variant}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-btn font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "px-3 py-1.5 text-[12.5px]" : "px-4 py-2 text-[13px]",
        variant === "primary"
          ? "bg-violet font-bold text-white hover:bg-violet-h"
          : "border border-border bg-white text-gray-2 hover:border-violet hover:text-violet",
        className
      )}
      {...props}
    />
  );
}

export { Action };
