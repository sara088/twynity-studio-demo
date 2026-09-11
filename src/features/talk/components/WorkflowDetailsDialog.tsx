"use client";

import { useState } from "react";
import {
  Play,
  Trash2,
  Workflow,
  Zap,
  Users,
  ShieldCheck,
  FileText,
  Radio,
  Clock,
  Terminal,
  Plug,
  Check,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { WorkflowSourceIcon } from "@/features/shared/components/WorkflowSourceIcon";
import type { WorkshopItem, WorkflowStep } from "../data/workshop";

export type Schedule = { enabled: boolean; time: string; freq: "daily" | "weekdays" };

const STEP_ICON = {
  tool: Zap,
  handoff: Users,
  approval: ShieldCheck,
  artifact: FileText,
} as const;

// Brand-ish tile per imported platform (matches the import dialog).
const PLATFORM_TILE: Record<string, { color: string; letter: string }> = {
  n8n: { color: "#EA4B71", letter: "n" },
  "Power Automate": { color: "#0B63CE", letter: "P" },
  UiPath: { color: "#FA4616", letter: "U" },
  LangFlow: { color: "#16B364", letter: "L" },
  Zapier: { color: "#FF4A00", letter: "Z" },
};

const FIDELITY_LABEL = {
  live: "Full live view",
  polled: "Step status, polled",
  status: "Status only",
} as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border px-5 py-4">
      <div className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-gray-4">
        {title}
      </div>
      {children}
    </div>
  );
}

export function WorkflowDetailsDialog({
  open,
  onClose,
  item,
  slash,
  phrase,
  onSetPhrase,
  schedule,
  onSetSchedule,
  onRun,
  onRemove,
  connections,
  onConnect,
  equipped = true,
}: {
  open: boolean;
  onClose: () => void;
  item: WorkshopItem | null;
  slash: string;
  phrase: string;
  onSetPhrase: (phrase: string) => void;
  schedule: Schedule;
  onSetSchedule: (s: Schedule) => void;
  onRun?: () => void;
  onRemove: () => void;
  /** Per-twyn connections this workflow needs (edit page). Omit to hide. */
  connections?: { name: string; connected: boolean }[];
  onConnect?: (name: string) => void;
  /** Whether it's equipped on this twyn — drives the footer (Remove vs Add). */
  equipped?: boolean;
}) {
  // Keyed on the item in the parent, so this initial value resets per workflow.
  const [draft, setDraft] = useState(phrase);

  const def = item?.workflow;
  if (!item || !def) return null;

  const source =
    def.source === "captured"
      ? "Your twyn's own tools"
      : def.source === "marketplace"
        ? "From the marketplace"
        : `Imported from ${def.platform}`;
  const tile = def.platform ? PLATFORM_TILE[def.platform] : undefined;
  const fidelityNote =
    def.fidelity === "live"
      ? "Every step, tool call and twyn hand-off streams here as it runs."
      : def.fidelity === "polled"
        ? `${def.platform} reports status on a poll — a step behind real time, and no live hand-offs.`
        : `${def.platform} only reports whether the run succeeded — no step-by-step detail.`;

  const commitPhrase = () => onSetPhrase(draft.trim() || phrase);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        overlayClassName="z-[600] bg-dark/55"
        className="z-[601] max-w-[480px] gap-0 p-0"
      >
        <DialogHeader className="flex-row items-center gap-3 space-y-0 border-b border-border p-5">
          <WorkflowSourceIcon platform={def.platform} className="h-11 w-11 text-[18px]" />
          <div className="min-w-0">
            <DialogTitle className="truncate font-heading text-[16px] font-bold tracking-[-0.2px] text-dark">
              {item.name}
            </DialogTitle>
            <DialogDescription className="truncate text-[12.5px] text-gray-4">
              {item.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="max-h-[62vh] overflow-y-auto">
          {/* Source + fidelity */}
          <Section title="Where it's from">
            <div className="flex items-start gap-3">
              {tile ? (
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] font-heading text-[16px] font-bold text-white"
                  style={{ backgroundColor: tile.color }}
                >
                  {tile.letter}
                </span>
              ) : (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-violet-light text-violet">
                  <Workflow size={16} />
                </span>
              )}
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold text-dark">{source}</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]",
                      def.fidelity === "status"
                        ? "bg-bg-input text-gray-4"
                        : "bg-violet-light text-violet"
                    )}
                  >
                    <Radio size={9} /> {FIDELITY_LABEL[def.fidelity]}
                  </span>
                </div>
                <p className="mt-1.5 text-[12px] leading-[1.5] text-gray-4">{fidelityNote}</p>
              </div>
            </div>
          </Section>

          {/* Connections — bound per twyn (edit page only) */}
          {connections && connections.length > 0 && (
            <Section title="Connections · on this twyn">
              <div className="space-y-2">
                {connections.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-2.5 rounded-[10px] border border-border px-3 py-2"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-bg-input text-gray-4">
                      <Plug size={13} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-dark">
                      {c.name}
                    </span>
                    {c.connected ? (
                      <span className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-mint-text">
                        <Check size={13} strokeWidth={2.4} /> Connected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onConnect?.(c.name)}
                        className="shrink-0 rounded-full bg-violet px-3 py-1 text-[12px] font-bold text-white transition-colors hover:bg-violet-h"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11.5px] text-gray-4">
                Each twyn connects its own accounts — this affects only this twyn.
              </p>
            </Section>
          )}

          {/* Trigger / commands */}
          <Section title="Trigger & commands">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="shrink-0 text-violet" />
              <span className="rounded-md bg-bg-input px-2 py-1 font-sans text-[12.5px] font-semibold text-violet">
                {slash}
              </span>
              <span className="text-[12px] text-gray-4">or type / in the chat</span>
            </div>
            <label className="mt-3 block text-[12px] font-semibold text-gray-3">
              Say this to run it
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitPhrase}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitPhrase();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="e.g. catch me up"
                className="h-9 min-w-0 flex-1 rounded-[10px] border border-border bg-white px-3 text-[13px] text-dark outline-none focus:border-violet"
              />
            </div>
            <p className="mt-1.5 text-[11.5px] text-gray-4">
              Teach your twyn any phrase — say it on a call or type it, and it runs.
            </p>
          </Section>

          {/* Schedule */}
          <Section title="Schedule">
            <button
              type="button"
              onClick={() => onSetSchedule({ ...schedule, enabled: !schedule.enabled })}
              className="flex w-full items-center justify-between gap-3"
            >
              <span className="flex items-center gap-2 text-[13.5px] font-semibold text-dark">
                <Clock size={15} className="text-violet" /> Run automatically
              </span>
              <span
                className={cn(
                  "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                  schedule.enabled ? "bg-violet" : "bg-gray-6"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                    schedule.enabled ? "translate-x-[18px]" : "translate-x-0.5"
                  )}
                />
              </span>
            </button>

            {schedule.enabled && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="time"
                  value={schedule.time}
                  onChange={(e) => onSetSchedule({ ...schedule, time: e.target.value })}
                  className="h-9 rounded-[10px] border border-border bg-white px-3 text-[13px] text-dark outline-none focus:border-violet"
                />
                <select
                  value={schedule.freq}
                  onChange={(e) =>
                    onSetSchedule({ ...schedule, freq: e.target.value as Schedule["freq"] })
                  }
                  className="h-9 rounded-[10px] border border-border bg-white px-2 text-[13px] text-dark outline-none focus:border-violet"
                >
                  <option value="daily">Every day</option>
                  <option value="weekdays">Weekdays</option>
                </select>
              </div>
            )}
            <p className="mt-2 text-[11.5px] text-gray-4">
              {schedule.enabled
                ? `${item.name} will run ${schedule.freq === "weekdays" ? "every weekday" : "every day"} at ${schedule.time}, and drop the result in your chat.`
                : "Off — the workflow only runs when you ask."}
            </p>
          </Section>

          {/* Steps */}
          <Section title={`What it does · ${def.steps.length} steps`}>
            <ol className="space-y-1.5">
              {def.steps.map((s: WorkflowStep, i: number) => {
                const Icon = STEP_ICON[s.kind];
                return (
                  <li key={i} className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-[7px]",
                        s.kind === "approval" || s.kind === "handoff"
                          ? "bg-amber text-amber-text"
                          : "bg-violet-light text-violet"
                      )}
                    >
                      <Icon size={12} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-dark">{s.label}</span>
                    {s.actor && (
                      <span className="shrink-0 rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold text-amber-text">
                        {s.actor}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </Section>
        </div>

        <div className="flex items-center gap-2 border-t border-border p-4">
          {!equipped ? (
            // Browsing an unequipped workflow — the action is Add to twyn.
            <button
              type="button"
              onClick={() => {
                onRemove();
                onClose();
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-violet px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-violet-h"
            >
              <Plus size={14} /> Add to twyn
            </button>
          ) : (
            <>
              {onRun ? (
                <button
                  type="button"
                  onClick={() => {
                    onRun();
                    onClose();
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-violet px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-violet-h"
                >
                  <Play size={13} /> Run now
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-violet px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-violet-h"
                >
                  Done
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onRemove();
                  onClose();
                }}
                aria-label="Remove workflow"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-gray-4 transition-colors hover:border-error hover:text-error"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
