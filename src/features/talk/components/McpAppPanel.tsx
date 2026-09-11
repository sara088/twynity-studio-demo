"use client";

// ─────────────────────────────────────────────────────────────────────────
// McpAppPanel — the Canvas shell for an MCP app.
//
// Studio owns the frame (icon, title, navigation, system actions); the
// descriptor owns the body. The panel subscribes to the demo CRM and recomputes
// data on every change, so advancing a deal in the gate immediately moves its
// card on the board behind it.
//
// Navigation is a stack, not history: opening a deal's gate *from* the board is
// a drill-down, so Back returns to the board you came from — with your grouping
// and scroll intact, because the board was never unmounted from the stack.
// ─────────────────────────────────────────────────────────────────────────

import { ChevronLeft, ChevronRight, CheckSquare, Kanban, RotateCcw, UserPlus, X } from "lucide-react";

import { AppCanvas } from "@/components/mcp-kit/AppRenderer";
import { cn } from "@/lib/utils";
import { getApp, type Intent } from "../data/mcp-apps";
import { useCrm } from "../lib/crm-store";

const ICONS = { board: Kanban, person: UserPlus, check: CheckSquare } as const;

/** One entry in the Canvas navigation stack. */
export interface AppFrame {
  appId: string;
  params?: Record<string, string>;
}

function interpolate(text: string, data: Record<string, unknown>) {
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k: string) => {
    const v = k
      .split(".")
      .reduce<unknown>(
        (acc, key) =>
          acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
        data
      );
    return v == null ? "" : String(v);
  });
}

export function McpAppPanel({
  stack,
  onIntent,
  onBack,
  onCrumb,
  onClose,
}: {
  stack: AppFrame[];
  onIntent: (intent: Intent) => void;
  onBack: () => void;
  onCrumb: (index: number) => void;
  onClose: () => void;
}) {
  const crm = useCrm();

  const frame = stack[stack.length - 1];
  const app = getApp(frame?.appId);
  if (!frame || !app) return null;

  const data = app.data(crm, frame.params);
  const Icon = ICONS[app.icon];
  const canGoBack = stack.length > 1;

  // Labels come from each frame's own live data, so a crumb reading
  // "Qualified → Discovery" updates the moment that deal advances.
  const crumbs = stack.map((f, i) => {
    const a = getApp(f.appId);
    return {
      key: `${f.appId}-${f.params?.deal ?? i}`,
      label: a ? interpolate(a.title, a.data(crm, f.params)) : f.appId,
    };
  });

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-[18px] border border-border bg-white">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        {canGoBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={`Back to ${crumbs[crumbs.length - 2].label}`}
            className="-ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-gray-3 transition-colors hover:bg-bg-input hover:text-dark"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-violet text-white">
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-heading text-[14px] font-bold tracking-[-0.2px] text-dark">
            {interpolate(app.title, data)}
          </div>
          <div className="truncate text-[11.5px] text-gray-4">
            {interpolate(app.subtitle ?? "", data)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onIntent({ kind: "tool", op: "reset" })}
          title="Reset the demo pipeline"
          aria-label="Reset the demo pipeline"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-gray-4 transition-colors hover:bg-bg-input hover:text-dark"
        >
          <RotateCcw size={15} />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close canvas"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-gray-4 transition-colors hover:bg-bg-input hover:text-dark"
        >
          <X size={16} />
        </button>
      </header>

      {canGoBack && (
        <nav
          aria-label="Canvas trail"
          className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-4 py-2"
        >
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <span key={c.key} className="flex shrink-0 items-center gap-1">
                {i > 0 && <ChevronRight size={13} className="text-gray-5" aria-hidden />}
                <button
                  type="button"
                  onClick={() => !last && onCrumb(i)}
                  aria-current={last ? "page" : undefined}
                  disabled={last}
                  className={cn(
                    "rounded-[7px] px-2 py-1 text-[12px] font-semibold transition-colors",
                    last
                      ? "cursor-default text-dark"
                      : "text-gray-4 hover:bg-bg-input hover:text-violet"
                  )}
                >
                  {c.label}
                </button>
              </span>
            );
          })}
        </nav>
      )}

      {/* Every frame stays mounted and all but the top is hidden, so going Back
          restores the board exactly as you left it — same grouping, same scroll
          position — instead of rebuilding it from scratch. */}
      <div className="relative min-h-0 flex-1">
        {stack.map((f, i) => {
          const a = getApp(f.appId);
          if (!a) return null;
          return (
            <div
              key={`${f.appId}-${f.params?.deal ?? i}`}
              hidden={i !== stack.length - 1}
              className="h-full"
            >
              <AppCanvas app={a} data={a.data(crm, f.params)} onIntent={onIntent} />
            </div>
          );
        })}
      </div>
    </aside>
  );
}
