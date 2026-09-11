import * as React from "react";
import {
  Check,
  Inbox,
  Loader2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────
// States — every MCP app defines all of these (see the design guide).
//   StateRunning     → live tool-execution log, never a blank spinner
//   StateLoading     → skeleton of the final layout, not a bare spinner
//   StateEmpty       → friendly zero-state with a way forward
//   StateError       → recoverable, plain-language message + action
//   StatePermission  → consent before connecting a tool / accessing data
// Action-bearing states take an `action` slot (a <Action/> or link) rather
// than a callback, so they stay server-renderable.
// ─────────────────────────────────────────────────────────────────────────

// Running — spinner + a checklist of steps the tool is working through.
type LogStep = { text: React.ReactNode; done?: boolean };

function StateRunning({
  label = "Working…",
  log,
  className,
}: {
  label?: React.ReactNode;
  log?: LogStep[];
  className?: string;
}) {
  return (
    <div data-slot="mcp-state-running" className={cn("w-full", className)}>
      <div className="flex items-center gap-2 text-[13px] font-semibold text-dark">
        <Loader2 size={15} className="animate-spin text-violet" />
        {label}
      </div>
      {log != null && log.length > 0 && (
        <div className="mt-3 space-y-1 rounded-[8px] bg-bg-input px-3 py-2 font-sans text-[11px] text-gray-3">
          {log.map((step, i) =>
            step.done ? (
              <div key={i} className="flex items-center gap-1.5">
                <Check size={11} className="text-mint-text" /> {step.text}
              </div>
            ) : (
              <div key={i} className="text-gray-4">
                › {step.text}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

// Loading — a skeleton shaped like the final layout.
function StateLoading({
  lines = 4,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-2/3", "w-full", "w-5/6", "w-1/2", "w-3/4", "w-11/12"];
  return (
    <div
      data-slot="mcp-state-loading"
      className={cn("w-full space-y-2.5", className)}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn("h-3 animate-pulse rounded bg-bg-input", widths[i % widths.length])}
        />
      ))}
    </div>
  );
}

// Empty — clear, friendly zero-state.
function StateEmpty({
  icon,
  title = "Nothing here yet",
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="mcp-state-empty"
      className={cn("text-center text-gray-4", className)}
    >
      <span className="mx-auto mb-1.5 flex justify-center">
        {icon ?? <Inbox size={22} />}
      </span>
      <div className="text-[12.5px] text-gray-3">{title}</div>
      {description != null && (
        <div className="mt-0.5 text-[11.5px] text-gray-4">{description}</div>
      )}
      {action != null && <div className="mt-2.5">{action}</div>}
    </div>
  );
}

// Error — recoverable, with a plain-language message and a way forward.
function StateError({
  title = "Something went wrong",
  description,
  action,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-slot="mcp-state-error" className={cn("text-center", className)}>
      <TriangleAlert size={22} className="mx-auto mb-1.5 text-error" />
      <div className="text-[12.5px] font-medium text-dark">{title}</div>
      {description != null && (
        <div className="mt-0.5 text-[11.5px] text-gray-4">{description}</div>
      )}
      {action != null && <div className="mt-2.5">{action}</div>}
    </div>
  );
}

// Permission / consent — shown before connecting a tool or accessing data.
function StatePermission({
  title = "Connect to continue",
  description,
  action,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="mcp-state-permission"
      className={cn("text-center", className)}
    >
      <ShieldCheck size={22} className="mx-auto mb-1.5 text-violet" />
      <div className="text-[12.5px] font-medium text-dark">{title}</div>
      {description != null && (
        <div className="mt-0.5 text-[11.5px] text-gray-4">{description}</div>
      )}
      {action != null && <div className="mt-2.5">{action}</div>}
    </div>
  );
}

export {
  StateRunning,
  StateLoading,
  StateEmpty,
  StateError,
  StatePermission,
};
export type { LogStep };
