import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────
// AppCard — the frame every MCP app renders into.
// One component, two layouts (see the MCP App Design Guide):
//   mode="inline"  → compact card inside the chat thread (≤2 actions, no scroll)
//   mode="canvas"  → roomy expanded view in the workspace beside chat
// Compose with AppHeader / AppBody / AppFooter.
// ─────────────────────────────────────────────────────────────────────────

type Mode = "inline" | "canvas";

function AppCard({
  className,
  mode = "inline",
  ...props
}: React.ComponentProps<"div"> & { mode?: Mode }) {
  return (
    <div
      data-slot="mcp-app-card"
      data-mode={mode}
      className={cn(
        "overflow-hidden border border-border bg-white",
        mode === "inline"
          ? "rounded-card shadow-[0_2px_10px_rgba(15,15,30,0.05)]"
          : "rounded-[18px] shadow-[0_8px_30px_rgba(15,15,30,0.08)]",
        className
      )}
      {...props}
    />
  );
}

function AppHeader({
  className,
  icon,
  title,
  actions,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  icon?: React.ReactNode;
  title: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      data-slot="mcp-app-header"
      className={cn(
        "flex items-center gap-2.5 border-b border-border px-4 py-3",
        className
      )}
      {...props}
    >
      {icon != null && (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-violet text-white">
          {icon}
        </span>
      )}
      <span className="text-[13px] font-bold text-dark">{title}</span>
      {actions != null && (
        <span className="ml-auto flex items-center gap-1 text-gray-4">
          {actions}
        </span>
      )}
    </div>
  );
}

// Small icon-only button for the canvas header (refresh / export / close).
function AppHeaderAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="mcp-app-header-action"
      className={cn(
        "grid h-7 w-7 place-items-center rounded-[7px] text-gray-4 transition-colors hover:bg-bg-input hover:text-gray-2",
        className
      )}
      {...props}
    />
  );
}

function AppBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="mcp-app-body"
      className={cn("px-4 py-3.5", className)}
      {...props}
    />
  );
}

function AppFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="mcp-app-footer"
      className={cn(
        "flex items-center justify-end gap-2 border-t border-border px-4 py-2.5",
        className
      )}
      {...props}
    />
  );
}

export { AppCard, AppHeader, AppHeaderAction, AppBody, AppFooter };
