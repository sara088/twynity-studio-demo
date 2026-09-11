"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock,
  FileText,
  Globe,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowDef, WorkflowStep } from "../data/workshop";

// The studio "Canvas" — a live workspace showing what the twyn is producing,
// alongside the conversation (Claude-artifact style). Two modes:
//  • document / list — the produced artifact (a morning brief over your inbox for
//    the workflow run, or a competitor-pricing doc for the research path).
//  • run — when the twyn executes an equipped *workflow*, the run plays here as a
//    live board (tool calls + twyn handoffs + an approval gate), then produces the
//    document. This is where "run a workflow, watch it happen" lives — in our own
//    Canvas, beside the chat, not a separate screen.
type Tab = "run" | "document" | "sources";

// Supporting items behind the produced doc. Two sets: the morning brief surfaces
// the flagged inbox threads; the research doc surfaces its web sources.
const THREADS = [
  { host: "Priya Shah", title: "Re: Thursday launch — need your sign-off", note: "Waiting on your OK to ship Thursday morning." },
  { host: "Finance", title: "Invoice #4021 due today", note: "Auto-reminder — pay or snooze." },
  { host: "Marco · Acme", title: "Renewal — quick call this week?", note: "Wants 20 min before month-end." },
];

const SOURCES = [
  { host: "acme.com", title: "Acme — Pricing", note: "Starter $19 · Pro $49 · Business $99" },
  { host: "globex.com", title: "Globex plans & pricing", note: "Free · Team $29/user · Enterprise (custom)" },
  { host: "initech.com", title: "Initech pricing page", note: "Solo $15 · Growth $59 · Scale $129" },
];

/* ------------------------------------------------------------------ */
/*  The live run board (people-level + tool-level, with an approval).  */
/* ------------------------------------------------------------------ */

const STEP_ICON = {
  tool: Zap,
  handoff: Users,
  approval: ShieldCheck,
  artifact: FileText,
} as const;

function RunBoard({
  def,
  selfName,
  onComplete,
  onOpenDoc,
  onAwaitingApproval,
  onRegisterApprove,
}: {
  def: WorkflowDef;
  selfName: string;
  onComplete: () => void;
  onOpenDoc: () => void;
  /** Fires when the run parks at its approval gate (drives the guided tour). */
  onAwaitingApproval?: () => void;
  /** Hands the parent a way to clear the approval gate — so the guided tour's own
   *  "Approve" CTA can advance the run (the real button sits under the tour's
   *  backdrop and can't be clicked directly). */
  onRegisterApprove?: (approve: () => void) => void;
}) {
  const steps = def.steps;
  // Polled sources (n8n/Make/Power Automate) report status on a poll, not a push —
  // so the board ticks over on a slower "poll" cadence and says so, with no live
  // twyn hand-offs. Live sources stream smoothly.
  const polled = def.fidelity === "polled";
  const [active, setActive] = useState(0);
  const done = active >= steps.length;
  // An approval step parks the run until the user clears it — derived, so we never
  // setState inside the effect.
  const awaiting = active < steps.length && steps[active].kind === "approval";
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (active >= steps.length) {
      onComplete();
      return;
    }
    if (awaiting) {
      onAwaitingApproval?.();
      return;
    }
    const dur = polled ? 1800 : steps[active].kind === "handoff" ? 1400 : 1000;
    timer.current = setTimeout(() => setActive((a) => a + 1), dur);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, awaiting, steps, onComplete, onAwaitingApproval, polled]);

  const approve = useCallback(() => setActive((a) => a + 1), []);

  // Expose approve upward so the guided tour can clear the gate from its own CTA.
  useEffect(() => {
    onRegisterApprove?.(approve);
  }, [approve, onRegisterApprove]);

  const statusOf = (i: number): "done" | "running" | "waiting" | "queued" => {
    if (i < active) return "done";
    if (i === active) return awaiting ? "waiting" : "running";
    return "queued";
  };

  const actorOf = (s: WorkflowStep) => s.actor ?? selfName;
  const doneCount = Math.min(active, steps.length);
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <div className="mx-auto max-w-[640px]">
      {/* Run console header — deliberately distinct from a document / equip pane:
          a live progress track + the platform it's powered by. */}
      <div className="mb-4 rounded-[13px] border border-violet-mid/60 bg-dark/[0.03] p-3.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-heading text-[12.5px] font-bold text-violet">
            {polled ? (
              <RefreshCw size={13} className={done ? "" : "animate-spin"} />
            ) : (
              <Workflow size={14} />
            )}
            {done
              ? "Run complete"
              : polled
                ? `Polling ${def.platform}`
                : "Live run"}
            {def.demo && (
              <span className="rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-amber-text">
                Example · sample data
              </span>
            )}
            {def.platform && !polled && (
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-gray-4 ring-1 ring-border">
                via {def.platform}
              </span>
            )}
          </span>
          <span className="font-sans text-[11.5px] font-semibold tabular-nums text-gray-4">
            {doneCount}/{steps.length}
          </span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white">
          <div
            className={cn("h-full rounded-full transition-all duration-500", done ? "bg-mint-text" : "bg-violet")}
            style={{ width: `${pct}%` }}
          />
        </div>
        {polled ? (
          <p className="mt-2.5 text-[10.5px] font-semibold leading-snug text-gray-4">
            {def.platform} reports status on a poll — a step behind real time, and no
            live twyn hand-offs. Approvals still pause the run.
          </p>
        ) : (
          <div className="mt-2.5 flex items-center gap-3 text-[10.5px] font-semibold text-gray-4">
            <span className="flex items-center gap-1">
              <Zap size={11} className="text-violet" /> Tool step
            </span>
            <span className="flex items-center gap-1">
              <Users size={11} className="text-amber-text" /> Twyn handoff
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={11} className="text-amber-text" /> Your approval
            </span>
          </div>
        )}
      </div>

      <ol className="space-y-1.5">
        {steps.map((s, i) => {
          const st = statusOf(i);
          const Icon = STEP_ICON[s.kind];

          if (s.kind === "artifact") {
            const revealed = st === "done";
            return (
              <li
                key={i}
                className={cn(
                  "rounded-[12px] border p-3 transition-all",
                  revealed
                    ? "border-violet-mid bg-white shadow-[0_2px_12px_rgba(108,92,231,0.12)]"
                    : "border-dashed border-border opacity-45"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-[9px]",
                      revealed ? "bg-violet-light text-violet" : "bg-bg-input text-gray-4"
                    )}
                  >
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-heading text-[13.5px] font-bold text-dark">{s.label}</div>
                    <div className="truncate text-[11.5px] text-gray-4">{s.meta}</div>
                  </div>
                  {revealed && (
                    <button
                      type="button"
                      data-tour="wf-artifact"
                      onClick={onOpenDoc}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-violet px-3 py-1.5 text-[11.5px] font-bold text-white transition-colors hover:bg-violet-h"
                    >
                      Open <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </li>
            );
          }

          return (
            <li
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-[11px] px-2.5 py-2.5 transition-colors",
                st === "running" && "bg-white ring-1 ring-violet-mid",
                st === "waiting" && "bg-amber/40 ring-1 ring-amber-text/30",
                st === "queued" && "opacity-45"
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-[8px]",
                  st === "done"
                    ? "bg-mint text-mint-text"
                    : st === "waiting"
                      ? "bg-amber text-amber-text"
                      : st === "running"
                        ? "bg-violet-light text-violet"
                        : "bg-bg-input text-gray-4"
                )}
              >
                {st === "done" ? <Check size={14} /> : <Icon size={14} />}
              </span>

              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-semibold text-dark">{s.label}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-4">
                  {s.kind === "handoff" ? (
                    <Users size={10} className="text-amber-text" />
                  ) : (
                    <Zap size={10} className="text-violet/70" />
                  )}
                  {s.meta}
                </div>
              </div>

              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  s.actor ? "bg-amber text-amber-text" : "bg-violet text-white"
                )}
              >
                {actorOf(s)}
              </span>

              {s.kind === "approval" && st === "waiting" && (
                <button
                  type="button"
                  data-tour="wf-approve"
                  onClick={approve}
                  className="shrink-0 rounded-full bg-amber-text px-3 py-1 text-[11px] font-bold text-white"
                >
                  Approve
                </button>
              )}
              {st === "running" && s.kind !== "approval" && (
                <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-wide text-violet">
                  Running
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {done && (
        <p className="mt-4 flex items-center gap-1.5 text-[12.5px] font-semibold text-mint-text">
          <Check size={14} /> Run complete — brief ready in the Document tab.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status card — for opaque sources (Zapier / classic RPA) that expose */
/*  only job-level status, no readable steps. We don't fake a step board.*/
/* ------------------------------------------------------------------ */

function StatusCard({
  def,
  onComplete,
  onOpenDoc,
}: {
  def: WorkflowDef;
  onComplete: () => void;
  onOpenDoc: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const result = def.steps.find((s) => s.kind === "artifact");

  useEffect(() => {
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    const finish = setTimeout(() => {
      setDone(true);
      onComplete();
    }, 4200);
    return () => {
      clearInterval(tick);
      clearTimeout(finish);
    };
  }, [onComplete]);

  // Coarse log lines — all a status-only source really gives us.
  const log = [
    { t: "00:00", msg: `Run started on ${def.platform}` },
    { t: "00:02", msg: "Working…" },
    ...(done ? [{ t: `00:0${Math.min(elapsed, 9)}`, msg: `Completed — ${result?.meta ?? "done"}` }] : []),
  ];

  return (
    <div className="mx-auto max-w-[560px]">
      <div className="rounded-[14px] border border-violet-mid/60 bg-dark/[0.03] p-5 text-center">
        <span
          className={cn(
            "mx-auto grid h-12 w-12 place-items-center rounded-full",
            done ? "bg-mint text-mint-text" : "bg-violet-light text-violet"
          )}
        >
          {done ? <Check size={22} /> : <Loader2 size={20} className="animate-spin" />}
        </span>
        <div className="mt-3 font-heading text-[16px] font-bold text-dark">
          {done ? "Run complete" : "Running…"}
        </div>
        <div className="mt-1 flex items-center justify-center gap-2 text-[11.5px] font-semibold text-gray-4">
          <span className="inline-flex items-center gap-1">
            <Clock size={11} /> <span className="tabular-nums">{elapsed}s</span>
          </span>
          <span className="h-1 w-1 rounded-full bg-gray-6" />
          <span className="rounded-full bg-amber px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-amber-text">
            {def.platform} · status only
          </span>
        </div>
      </div>

      <p className="mt-3 text-center text-[11.5px] leading-snug text-gray-4">
        {def.platform} only reports whether the run succeeded — no step-by-step detail
        to show. Here&apos;s the status and the result.
      </p>

      <div className="mt-3 overflow-hidden rounded-[12px] border border-border bg-dark/[0.02] font-sans">
        {log.map((l) => (
          <div
            key={l.t + l.msg}
            className="flex items-center gap-3 border-b border-border/60 px-3.5 py-2 text-[11.5px] text-gray-3 last:border-b-0"
          >
            <span className="tabular-nums text-gray-5">{l.t}</span>
            <span>{l.msg}</span>
          </div>
        ))}
      </div>

      {done && (
        <button
          type="button"
          data-tour="wf-artifact"
          onClick={onOpenDoc}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-violet px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-violet-h"
        >
          Open the result <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  The Canvas.                                                        */
/* ------------------------------------------------------------------ */

export function CanvasPanel({
  twynName,
  onClose,
  workflow,
  onRunAwaitingApproval,
  onRunComplete,
  onRegisterApprove,
}: {
  twynName: string;
  onClose: () => void;
  /** When present, the Canvas opens to the live run board for this workflow. */
  workflow?: { name: string; def: WorkflowDef };
  /** Run lifecycle signals — used by the guided tour to advance in step. */
  onRunAwaitingApproval?: () => void;
  onRunComplete?: () => void;
  /** Hands the guided tour a handle to clear the run's approval gate. */
  onRegisterApprove?: (approve: () => void) => void;
}) {
  // Default tab follows the artifact. The Canvas is remounted (keyed on the
  // artifact) when it changes, so these initial values reset without an effect.
  const [tab, setTab] = useState<Tab>(workflow ? "run" : "document");
  const [runDone, setRunDone] = useState(false);
  const selfName = twynName.split(" ")[0];

  // The morning-brief workflow produces a brief over your inbox (with an Inbox
  // tab); the research path (no workflow) produces the competitor doc (Sources
  // tab); other workflows produce a generic result (no supporting list tab).
  const isBrief = workflow?.def.produces === "morning-brief";
  const listData = isBrief ? THREADS : SOURCES;
  const docLabel = isBrief ? "Brief" : workflow ? "Result" : "Document";
  const listLabel = isBrief ? "Inbox" : "Sources";

  const tabs: Tab[] = useMemo(
    () =>
      isBrief
        ? ["run", "document", "sources"]
        : workflow
          ? ["run", "document"]
          : ["document", "sources"],
    [isBrief, workflow]
  );

  // Stable identities so the run board's timer effect doesn't reset on re-render.
  const handleRunComplete = useCallback(() => {
    setRunDone(true);
    onRunComplete?.();
  }, [onRunComplete]);
  const handleOpenDoc = useCallback(() => setTab("document"), []);

  const running = !!workflow && !runDone;

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden rounded-[18px] border border-border bg-white">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-violet-light text-violet">
          {workflow ? <Workflow size={17} /> : <FileText size={17} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-heading text-[14px] font-bold tracking-[-0.2px] text-dark">
            {workflow ? workflow.name : "Competitor Pricing"}
          </div>
          <div className="text-[11.5px] text-gray-4">
            {workflow ? (workflow.def.demo ? "Workflow run · example" : "Workflow run") : "Research brief"}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.06em]",
            running ? "bg-violet-light text-violet" : "bg-mint text-mint-text"
          )}
        >
          {running ? (
            <>
              <Loader2 size={11} className="animate-spin" /> Running
            </>
          ) : (
            <>
              <Check size={11} /> Done
            </>
          )}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close canvas"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-gray-4 transition-colors hover:bg-bg-input hover:text-dark"
        >
          <X size={16} />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex shrink-0 items-center gap-5 border-b border-border px-4">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "relative -mb-px border-b-2 py-2.5 text-[12.5px] font-semibold transition-colors",
              tab === t ? "border-violet text-violet" : "border-transparent text-gray-4 hover:text-dark"
            )}
          >
            {t === "run" ? "Run" : t === "document" ? docLabel : listLabel}
            {t === "sources" && (
              <span className="ml-1.5 rounded-full bg-bg-input px-1.5 text-[10px] font-bold text-gray-4">
                {listData.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Body — the run console gets a tinted surface so it reads distinctly from
          the plain white document / equip panes. */}
      <div
        className={cn(
          "scrollbar-thin flex-1 overflow-y-auto px-5 py-5",
          tab === "run" && "bg-gradient-to-b from-violet-light/50 via-bg-page/40 to-white"
        )}
      >
        {tab === "run" && workflow ? (
          <div data-tour="wf-run">
            {workflow.def.fidelity === "status" ? (
              <StatusCard
                def={workflow.def}
                onComplete={handleRunComplete}
                onOpenDoc={handleOpenDoc}
              />
            ) : (
              <RunBoard
                def={workflow.def}
                selfName={selfName}
                onComplete={handleRunComplete}
                onOpenDoc={handleOpenDoc}
                onAwaitingApproval={onRunAwaitingApproval}
                onRegisterApprove={onRegisterApprove}
              />
            )}
          </div>
        ) : tab === "document" ? (
          isBrief ? (
            <article className="mx-auto max-w-[640px]">
              <h1 className="font-heading text-[20px] font-bold tracking-[-0.4px] text-dark">
                Your morning brief
              </h1>
              <p className="mt-1 text-[11.5px] text-gray-4">
                Compiled by {twynName} · just now · sample data
              </p>

              <h2 className="mt-5 font-heading text-[13px] font-bold uppercase tracking-[0.06em] text-gray-5">
                Needs you today
              </h2>
              <ul className="mt-2 space-y-2">
                {[
                  "Priya needs your sign-off to ship Thursday.",
                  "Invoice #4021 is due today.",
                  "Marco (Acme) wants a renewal call this week.",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13.5px] leading-[1.55] text-gray-2">
                    <Check size={15} strokeWidth={2.4} className="mt-0.5 shrink-0 text-violet" />
                    {f}
                  </li>
                ))}
              </ul>

              <h2 className="mt-5 font-heading text-[13px] font-bold uppercase tracking-[0.06em] text-gray-5">
                Today&apos;s calendar
              </h2>
              <div className="mt-2 overflow-hidden rounded-[12px] border border-border">
                <table className="w-full text-left text-[13px]">
                  <tbody className="text-gray-2">
                    {[
                      ["9:30", "Team standup"],
                      ["11:00", "1:1 with Priya"],
                      ["14:00", "Acme renewal call"],
                      ["16:30", "Design review"],
                    ].map((r) => (
                      <tr key={r[0]} className="border-t border-border first:border-t-0">
                        <td className="w-20 px-3.5 py-2 font-semibold tabular-nums text-dark">{r[0]}</td>
                        <td className="px-3.5 py-2">{r[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="mt-5 font-heading text-[13px] font-bold uppercase tracking-[0.06em] text-gray-5">
                Drafted &amp; ready
              </h2>
              <ul className="mt-2 space-y-2">
                {[
                  "Reply to Priya — “Approved — ship it.”",
                  "Reply to Marco — “Thursday 2pm works for the renewal call.”",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13.5px] leading-[1.55] text-gray-2">
                    <Mail size={14} className="mt-0.5 shrink-0 text-violet" />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ) : workflow ? (
            <article className="mx-auto max-w-[640px]">
              <h1 className="font-heading text-[20px] font-bold tracking-[-0.4px] text-dark">
                {workflow.name}
              </h1>
              <p className="mt-1 text-[11.5px] text-gray-4">
                Produced by {twynName} · just now · sample data
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-[12px] border border-border bg-white p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-violet-light text-violet">
                  <FileText size={18} />
                </span>
                <div className="min-w-0">
                  <div className="font-heading text-[14px] font-bold text-dark">
                    {workflow.def.steps.find((s) => s.kind === "artifact")?.label ?? "Result"}
                  </div>
                  <div className="text-[12px] text-gray-4">
                    {workflow.def.steps.find((s) => s.kind === "artifact")?.meta}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-[12.5px] leading-[1.55] text-gray-4">
                This is an example run on sample data — connect{" "}
                {workflow.def.platform ?? "your tools"} to run it for real.
              </p>
            </article>
          ) : (
            <article className="mx-auto max-w-[640px]">
              <h1 className="font-heading text-[20px] font-bold tracking-[-0.4px] text-dark">
                Competitor pricing — research brief
              </h1>
              <p className="mt-1 text-[11.5px] text-gray-4">
                Drafted by {twynName} · just now · 3 sources
              </p>

              <h2 className="mt-5 font-heading text-[13px] font-bold uppercase tracking-[0.06em] text-gray-5">
                Summary
              </h2>
              <p className="mt-2 text-[13.5px] leading-[1.65] text-gray-2">
                Across the three closest competitors, entry tiers cluster at $15–$19/mo and mid
                tiers at $49–$59/mo. Only Globex leads with a free tier; everyone else gates
                usage behind a paid plan. Enterprise pricing is custom in every case.
              </p>

              <h2 className="mt-5 font-heading text-[13px] font-bold uppercase tracking-[0.06em] text-gray-5">
                Key findings
              </h2>
              <ul className="mt-2 space-y-2">
                {[
                  "Free tier is a differentiator — only Globex offers one.",
                  "Mid-tier pricing is where we'd compete most directly ($49–$59).",
                  "Per-seat pricing (Globex) vs flat tiers (Acme, Initech) splits the market.",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13.5px] leading-[1.55] text-gray-2">
                    <Check size={15} strokeWidth={2.4} className="mt-0.5 shrink-0 text-violet" />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          )
        ) : (
          <div className="mx-auto flex max-w-[640px] flex-col gap-2.5">
            {listData.map((s) => (
              <div
                key={s.host}
                className="flex items-start gap-3 rounded-[12px] border border-border bg-white p-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-bg-input text-gray-4">
                  {isBrief ? <Mail size={16} /> : <Globe size={16} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-dark">{s.title}</span>
                  <span className="block truncate text-[11.5px] text-gray-4">{s.host}</span>
                  <span className="mt-1 block text-[12px] text-gray-3">{s.note}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-[11.5px] text-gray-4">
        <span className="inline-flex items-center gap-1.5">
          {isBrief ? (
            <>
              <Mail size={12} /> {listData.length} flagged in your inbox
            </>
          ) : workflow ? (
            <>
              <Workflow size={12} /> Example run
            </>
          ) : (
            <>
              <Globe size={12} /> {listData.length} sources
            </>
          )}
        </span>
        <span>{workflow ? "Sample data" : "Updated just now"}</span>
      </footer>
    </aside>
  );
}
