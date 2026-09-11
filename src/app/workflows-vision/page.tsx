"use client";

/**
 * EXPERIMENTAL concept preview — NOT for the design branch.
 * The full "workflows on Twynity" story for aligning Tom before the team meeting:
 *   reframe (3 layers) → bring workflows (import + marketplace) → equip to a twyn
 *   → RUN in the studio (the split-screen centrepiece, it actually plays)
 *   → capture ("Save as a workflow", the vision teaser).
 *
 * Reuses the design tokens + concept-page style of /workflows and /teams. Kept in
 * one file on purpose so the experiment is self-contained and easy to throw away.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Workflow,
  Boxes,
  Layers,
  Wand2,
  Store,
  Plus,
  Check,
  ChevronDown,
  ChevronRight,
  Play,
  RotateCcw,
  Search,
  FileText,
  Globe,
  Mail,
  Table2,
  ShieldCheck,
  ArrowRight,
  Users,
  Blocks,
  Lock,
  Zap,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkflowSourceIcon } from "@/features/shared/components/WorkflowSourceIcon";

/* ------------------------------------------------------------------ */
/*  Platform logos — real brand marks via WorkflowSourceIcon.          */
/* ------------------------------------------------------------------ */

type PlatformId = "power-automate" | "uipath" | "n8n" | "langflow" | "custom";

const PLATFORMS: {
  id: PlatformId;
  name: string;
  hint: string;
  color: string;
  letter: string;
  soon?: boolean;
}[] = [
  { id: "power-automate", name: "Power Automate", hint: "Microsoft flows", color: "#0B63CE", letter: "P" },
  { id: "uipath", name: "UiPath", hint: "RPA robots", color: "#FA4616", letter: "U" },
  { id: "n8n", name: "n8n", hint: "Open-source · MCP", color: "#EA4B71", letter: "n" },
  { id: "langflow", name: "LangFlow", hint: "Agentic graphs", color: "#16B364", letter: "L" },
  { id: "custom", name: "Custom builder", hint: "Coming soon", color: "#9aa0ad", letter: "Z", soon: true },
];

function PlatformTile({ p }: { p: { name: string; color: string; letter: string; soon?: boolean } }) {
  if (p.soon) {
    return (
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] font-heading text-[16px] font-bold text-white"
        style={{ backgroundColor: p.color }}
      >
        {p.letter}
      </span>
    );
  }
  return <WorkflowSourceIcon platform={p.name} className="h-9 w-9 rounded-[10px] text-[15px]" />;
}

/* ------------------------------------------------------------------ */
/*  Small shared bits.                                                 */
/* ------------------------------------------------------------------ */

function Section({
  n,
  eyebrow,
  title,
  lede,
  children,
}: {
  n: string;
  eyebrow: string;
  title: string;
  lede: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-12">
      <div className="flex items-baseline gap-3">
        <span className="font-sans text-[13px] font-bold tabular-nums text-violet">{n}</span>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-4">{eyebrow}</span>
      </div>
      <h2 className="mt-2 font-heading text-[26px] font-bold leading-[1.12] tracking-[-0.6px] text-dark">
        {title}
      </h2>
      <p className="mt-2 max-w-[680px] text-[15px] leading-[1.6] text-gray-3">{lede}</p>
      <div className="mt-7">{children}</div>
    </section>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-card border border-border bg-white", className)}>{children}</div>
  );
}

/* ================================================================== */
/*  1 · The reframe — three layers.                                   */
/* ================================================================== */

const LAYERS = [
  {
    icon: Boxes,
    tag: "Build",
    tint: "text-gray-4",
    ring: "border-border",
    title: "Invisible · external",
    body: "Power Automate, UiPath, n8n, LangFlow — or our own engine. Users never see a node canvas. We don't reinvent the builder.",
  },
  {
    icon: Layers,
    tag: "Orchestrate",
    tint: "text-violet",
    ring: "border-violet-mid",
    title: "Twynity's core",
    body: "The twyn decides which workflow, tool, or teammate to invoke — the decision layer above the models. A workflow is just a capability you equip.",
    accent: true,
  },
  {
    icon: Wand2,
    tag: "Experience",
    tint: "text-violet",
    ring: "border-border",
    title: "The differentiator",
    body: "You talk, it runs — live, on screen, with an approval gate and memory of how you like it done. This is the part only Twynity has.",
  },
];

function ReframeLayers() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {LAYERS.map((l) => {
        const Icon = l.icon;
        return (
          <div
            key={l.tag}
            className={cn(
              "rounded-card border bg-white p-5",
              l.ring,
              l.accent && "bg-violet-light/40 shadow-[0_1px_0_rgba(108,92,231,0.12)]"
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("grid h-8 w-8 place-items-center rounded-[9px] bg-bg-input", l.tint)}>
                <Icon size={16} />
              </span>
              <span className={cn("text-[11px] font-bold uppercase tracking-[0.1em]", l.tint)}>
                {l.tag}
              </span>
            </div>
            <h3 className="mt-3 font-heading text-[16px] font-bold tracking-[-0.2px] text-dark">
              {l.title}
            </h3>
            <p className="mt-1.5 text-[13px] leading-[1.55] text-gray-3">{l.body}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  2 · Bring your workflows — import dropdown + marketplace.          */
/* ================================================================== */

function ImportCard() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<PlatformId | null>(null);
  const pickedP = PLATFORMS.find((p) => p.id === picked);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-4">
        <Plus size={13} /> Import from a platform
      </div>
      <p className="mt-2 text-[13px] leading-[1.55] text-gray-3">
        Already built a flow elsewhere? Connect the platform and it becomes equippable — no rebuild.
      </p>

      <div className="relative mt-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-[12px] border border-border bg-white px-3.5 py-3 text-left transition-colors hover:border-violet-mid"
        >
          <span className="flex items-center gap-3">
            {pickedP ? (
              <>
                <PlatformTile p={pickedP} />
                <span className="font-heading text-[14px] font-bold text-dark">{pickedP.name}</span>
              </>
            ) : (
              <>
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-bg-input text-gray-4">
                  <Workflow size={16} />
                </span>
                <span className="text-[14px] font-semibold text-gray-4">Connect a platform…</span>
              </>
            )}
          </span>
          <ChevronDown size={16} className={cn("text-gray-4 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-[14px] border border-border bg-white shadow-[0_12px_40px_rgba(15,15,30,0.14)]">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={p.soon}
                onClick={() => {
                  setPicked(p.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                  p.soon ? "cursor-not-allowed opacity-55" : "hover:bg-violet-light/50"
                )}
              >
                <PlatformTile p={p} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-heading text-[14px] font-bold text-dark">{p.name}</span>
                    {p.soon && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-bg-input px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-gray-4">
                        <Lock size={9} /> Soon
                      </span>
                    )}
                  </span>
                  <span className="block text-[12px] text-gray-4">{p.hint}</span>
                </span>
                {!p.soon && <ChevronRight size={15} className="text-gray-4" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {pickedP && !pickedP.soon && (
        <div className="mt-3 flex items-center gap-2 rounded-[10px] bg-mint px-3 py-2 text-[12.5px] font-semibold text-mint-text">
          <Check size={14} /> {pickedP.name} connected — 3 flows found, ready to equip.
        </div>
      )}
    </Card>
  );
}

const MARKET_WORKFLOWS = [
  { name: "Competitor Pricing Report", by: "Growth Lab", steps: 6, price: "$12", tag: "Research" },
  { name: "Weekly Investor Update", by: "Founder OS", steps: 5, price: "$9", tag: "Comms" },
  { name: "Inbound Lead Triage", by: "RevOps Co.", steps: 7, price: "$15", tag: "Sales" },
];

function MarketplaceCard() {
  const [bought, setBought] = useState<string | null>(null);
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-4">
        <Store size={13} /> Or buy a ready-made package
      </div>
      <p className="mt-2 text-[13px] leading-[1.55] text-gray-3">
        Marketplace workflows install like a skill — equipped to a twyn, powered in the background.
      </p>
      <div className="mt-4 space-y-2.5">
        {MARKET_WORKFLOWS.map((w) => {
          const owned = bought === w.name;
          return (
            <div
              key={w.name}
              className="flex items-center gap-3 rounded-[12px] border border-border bg-white px-3 py-2.5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-violet-light text-violet">
                <Workflow size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-heading text-[13.5px] font-bold text-dark">
                  {w.name}
                </span>
                <span className="text-[12px] text-gray-4">
                  {w.by} · <span className="tabular-nums">{w.steps}</span> steps
                </span>
              </span>
              <button
                type="button"
                onClick={() => setBought(owned ? null : w.name)}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3.5 text-[12px] font-bold transition-colors",
                  owned
                    ? "border border-violet-mid bg-white text-violet"
                    : "bg-violet text-white hover:bg-violet-h"
                )}
              >
                {owned ? (
                  <span className="flex items-center gap-1">
                    <Check size={12} /> Owned
                  </span>
                ) : (
                  <span className="tabular-nums">{w.price}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ================================================================== */
/*  3 · Equip — a Workflows chip in the twyn loadout.                 */
/* ================================================================== */

const LOADOUT = [
  { label: "Skills", cls: "bg-skill-bg text-skill-text", items: ["SQL Querying", "Cold Outreach", "Sprint Planning"] },
  { label: "Interconnectors", cls: "bg-amber text-amber-text", items: ["Gmail", "Microsoft Azure", "Notion"] },
  { label: "Knowledge", cls: "bg-mint text-mint-text", items: ["Brand voice", "Q3 board pre-read"] },
];

function EquipMock() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-violet text-white font-heading text-[15px] font-bold">
          S
        </span>
        <div>
          <div className="font-heading text-[15px] font-bold text-dark">Virtual Bob</div>
          <div className="text-[12px] text-gray-4">Your twyn · loadout</div>
        </div>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-violet-light px-2.5 py-1 text-[11px] font-bold text-violet">
          <Blocks size={12} /> Equip
        </span>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-4">
        {LOADOUT.map((g) => (
          <div key={g.label}>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-gray-4">
              {g.label}
            </div>
            <div className="mt-2 space-y-1.5">
              {g.items.map((it) => (
                <div
                  key={it}
                  className={cn("truncate rounded-[9px] px-2.5 py-1.5 text-[12px] font-semibold", g.cls)}
                >
                  {it}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* The new category. */}
        <div className="rounded-[12px] border-2 border-dashed border-violet-mid bg-violet-light/30 p-2.5">
          <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-violet">
            <Workflow size={12} /> Workflows <span className="rounded bg-violet px-1 text-[9px] text-white">NEW</span>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="truncate rounded-[9px] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-violet shadow-[0_1px_2px_rgba(15,15,30,0.06)]">
              Competitor Pricing Report
            </div>
            <div className="flex items-center gap-1 truncate rounded-[9px] px-2.5 py-1.5 text-[12px] font-semibold text-gray-4">
              <Plus size={12} /> Add a workflow
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ================================================================== */
/*  4 · RUN in the studio — the split-screen centrepiece (plays).     */
/* ================================================================== */

type RunKind = "tool" | "person" | "approval" | "artifact";
type RunStep = {
  kind: RunKind;
  label: string;
  meta?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  actor?: "sara" | "nana";
};

const RUN_STEPS: RunStep[] = [
  { kind: "tool", label: "Read the brief from Notion", meta: "notion · pricing-research", icon: FileText, actor: "sara" },
  { kind: "tool", label: "Search the web", meta: "5 sources", icon: Globe, actor: "sara" },
  { kind: "tool", label: "Pull competitor pricing pages", meta: "3 pages parsed", icon: Search, actor: "sara" },
  { kind: "person", label: "Hand off to Nana — validate the table", meta: "analyst twyn", icon: Table2, actor: "nana" },
  { kind: "approval", label: "Post summary to #product?", meta: "you approve before it sends", icon: ShieldCheck, actor: "sara" },
  { kind: "tool", label: "Draft & send the summary", meta: "Slack · #product", icon: Mail, actor: "sara" },
  { kind: "artifact", label: "Competitor Pricing brief", meta: "1 page · 3 sources", icon: FileText, actor: "sara" },
];

const ACTOR = {
  sara: { name: "Sara", cls: "bg-violet text-white" },
  nana: { name: "Nana", cls: "bg-amber text-amber-text" },
} as const;

function StudioRun() {
  const [active, setActive] = useState(-1); // -1 = not started
  const done = active >= RUN_STEPS.length;
  // An approval step doesn't auto-advance — it waits for the user. Derived, so we
  // never call setState inside the effect (no cascading renders).
  const awaiting =
    active >= 0 && active < RUN_STEPS.length && RUN_STEPS[active].kind === "approval";
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Advance through steps; an approval gate simply parks here until "Approve".
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (active < 0 || active >= RUN_STEPS.length || awaiting) return;
    const dur = RUN_STEPS[active].kind === "person" ? 1400 : 1000;
    timer.current = setTimeout(() => setActive((a) => a + 1), dur);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, awaiting]);

  const start = useCallback(() => setActive(0), []);
  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setActive(-1);
  }, []);
  const approve = useCallback(() => setActive((a) => a + 1), []);

  const statusOf = (i: number): "done" | "running" | "waiting" | "queued" => {
    if (i < active) return "done";
    if (i === active) return awaiting ? "waiting" : "running";
    return "queued";
  };

  return (
    <Card className="overflow-hidden">
      {/* Studio topbar */}
      <div className="flex items-center gap-2 border-b border-border bg-bg-input/40 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[12px] font-semibold text-gray-4">Studio · Virtual Bob</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-violet ring-1 ring-border">
          <CircleDot size={11} /> Split view
        </span>
      </div>

      <div className="grid md:grid-cols-2">
        {/* LEFT — the conversation */}
        <div className="flex flex-col gap-3 border-b border-border p-4 md:border-b-0 md:border-r">
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-[14px] rounded-br-[4px] bg-violet px-3.5 py-2 text-[13px] leading-[1.45] text-white">
              Run the competitor pricing report.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet text-[12px] font-bold text-white">
              S
            </span>
            <div className="max-w-[85%] rounded-[14px] rounded-bl-[4px] bg-bg-input px-3.5 py-2 text-[13px] leading-[1.5] text-dark">
              On it. Here&apos;s the plan — 6 steps, and I&apos;ll check with you before posting to Slack.
              {active < 0 ? (
                <span className="mt-1 block text-[12px] font-semibold text-violet">Watch it run on the right →</span>
              ) : done ? (
                <span className="mt-1 block text-[12px] font-semibold text-mint-text">Done — brief is ready.</span>
              ) : (
                <span className="mt-1 block text-[12px] font-semibold text-gray-4">Running…</span>
              )}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-2 pt-2">
            {active < 0 ? (
              <button
                type="button"
                onClick={start}
                className="flex items-center gap-1.5 rounded-full bg-violet px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-violet-h"
              >
                <Play size={13} /> Run it
              </button>
            ) : (
              <button
                type="button"
                onClick={reset}
                className="flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold text-gray-3 transition-colors hover:border-violet hover:text-violet"
              >
                <RotateCcw size={13} /> Replay
              </button>
            )}
            <span className="text-[11.5px] text-gray-4">
              Powered by an imported flow — no canvas.
            </span>
          </div>
        </div>

        {/* RIGHT — the live run */}
        <div className="bg-bg-page/40 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Workflow size={14} className="text-violet" />
            <span className="font-heading text-[13.5px] font-bold text-dark">Workflow run</span>
            <span className="ml-auto flex items-center gap-3 text-[11px] font-semibold text-gray-4">
              <span className="flex items-center gap-1">
                <Zap size={11} className="text-violet" /> Tool
              </span>
              <span className="flex items-center gap-1">
                <Users size={11} className="text-amber-text" /> Person
              </span>
            </span>
          </div>

          <ol className="relative space-y-1">
            {RUN_STEPS.map((s, i) => {
              const st = statusOf(i);
              const Icon = s.icon;
              const actor = ACTOR[s.actor ?? "sara"];
              if (s.kind === "artifact") {
                if (st !== "done") {
                  return (
                    <li key={i} className="flex items-center gap-3 rounded-[10px] px-2 py-2 opacity-40">
                      <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-bg-input text-gray-4">
                        <Icon size={14} />
                      </span>
                      <span className="text-[12.5px] font-semibold text-gray-4">{s.label}</span>
                    </li>
                  );
                }
                return (
                  <li key={i} className="rounded-[12px] border border-violet-mid bg-white p-3 shadow-[0_2px_10px_rgba(108,92,231,0.12)]">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-violet-light text-violet">
                        <Icon size={15} />
                      </span>
                      <div>
                        <div className="font-heading text-[13.5px] font-bold text-dark">{s.label}</div>
                        <div className="text-[11.5px] text-gray-4">{s.meta}</div>
                      </div>
                      <button className="ml-auto flex items-center gap-1 rounded-full bg-violet px-3 py-1.5 text-[11.5px] font-bold text-white">
                        Open <ArrowRight size={11} />
                      </button>
                    </div>
                  </li>
                );
              }
              const isApproval = s.kind === "approval";
              return (
                <li
                  key={i}
                  className={cn(
                    "flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors",
                    st === "running" && "bg-white ring-1 ring-violet-mid",
                    st === "waiting" && "bg-amber/40 ring-1 ring-amber-text/30",
                    st === "queued" && "opacity-45"
                  )}
                >
                  {/* status dot / actor icon */}
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
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[12.5px] font-semibold text-dark">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-4">
                      {s.kind === "person" ? (
                        <Users size={10} className="text-amber-text" />
                      ) : (
                        <Zap size={10} className="text-violet/70" />
                      )}
                      {s.meta}
                    </div>
                  </div>

                  {/* actor chip */}
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                      actor.cls
                    )}
                  >
                    {actor.name}
                  </span>

                  {isApproval && st === "waiting" && (
                    <button
                      type="button"
                      onClick={approve}
                      className="shrink-0 rounded-full bg-amber-text px-3 py-1 text-[11px] font-bold text-white"
                    >
                      Approve
                    </button>
                  )}
                  {st === "running" && !isApproval && (
                    <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-wide text-violet">
                      Running
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </Card>
  );
}

/* ================================================================== */
/*  5 · Capture — "Save as a workflow" teaser.                        */
/* ================================================================== */

function CaptureTeaser() {
  const [saved, setSaved] = useState(false);
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[13px] bg-violet-light text-violet">
          <Wand2 size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-[17px] font-bold tracking-[-0.2px] text-dark">
            Just did it once? Save it as a workflow.
          </h3>
          <p className="mt-1.5 max-w-[560px] text-[13.5px] leading-[1.55] text-gray-3">
            The magic future: do a task in conversation, then Twynity turns the exact sequence into a
            repeatable workflow — powered in the background, never a canvas. Sara remembers how you like it.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSaved(true)}
              disabled={saved}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-colors",
                saved ? "bg-mint text-mint-text" : "bg-violet text-white hover:bg-violet-h"
              )}
            >
              {saved ? (
                <>
                  <Check size={14} /> Saved to Sara&apos;s Workflows
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Save as a workflow
                </>
              )}
            </button>
            <span className="rounded-full bg-bg-input px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-gray-4">
              Vision · P3
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ================================================================== */
/*  Page.                                                             */
/* ================================================================== */

export default function WorkflowsVisionPage() {
  return (
    <div className="min-h-screen bg-bg-page px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-[1080px]">
        <header className="mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-light px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-violet">
            <Sparkles size={12} /> Experimental · not for design
          </span>
          <h1 className="mt-3 font-heading text-[34px] font-bold leading-[1.08] tracking-[-0.9px] text-dark">
            Your twyn runs your workflows.
          </h1>
          <p className="mt-2 max-w-[720px] text-[15.5px] leading-[1.6] text-gray-3">
            Not a builder. Twynity is the layer <span className="font-semibold text-dark">above</span> the
            builder — you tell your twyn to run something and{" "}
            <span className="font-semibold text-dark">watch it happen</span>. The workflow can be built
            anywhere; the magic is running it, seeing it, and capturing it.
          </p>
        </header>

        <Section
          n="01"
          eyebrow="The reframe"
          title="Three layers — and we only own the top two"
          lede="Tom's constraint, made concrete: keep the builder invisible, own the orchestration and the experience. This is how we borrow the Tavus “you talk, it's done” feeling without reinventing n8n."
        >
          <ReframeLayers />
        </Section>

        <Section
          n="02"
          eyebrow="Get a workflow"
          title="Bring one in — or buy one"
          lede="Two ways in for launch. Import a flow you already built on an external platform, or install a ready-made package from the marketplace. Both end up equippable to a twyn."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ImportCard />
            <MarketplaceCard />
          </div>
        </Section>

        <Section
          n="03"
          eyebrow="Equip"
          title="A workflow is just another thing you equip"
          lede="It sits in the loadout next to skills, interconnectors, and knowledge — a new “Workflows” category. Nothing new to learn; it's the model users already know."
        >
          <EquipMock />
        </Section>

        <Section
          n="04"
          eyebrow="The centrepiece"
          title="Run it in the studio — and watch, live"
          lede="This is the thing Tom keeps asking for: a workflow executing on our platform, as a split screen in the studio — tool calls and twyn-to-twyn handoffs, with an approval gate and the artifact at the end. Hit “Run it”."
        >
          <StudioRun />
        </Section>

        <Section
          n="05"
          eyebrow="The vision"
          title="Then capture it, just by talking"
          lede="The furthest-out phase, and the clearest expression of “you talk, it's done”: do the task once in conversation, then save the exact sequence as a reusable workflow."
        >
          <CaptureTeaser />
        </Section>

        <footer className="border-t border-border py-8 text-[12.5px] leading-[1.6] text-gray-4">
          <p className="font-semibold text-gray-3">Twynity vs Tavus, in one line</p>
          <p className="mt-1 max-w-[720px]">
            Tavus conversationally <em>builds</em> a persona. Twynity&apos;s persona <em>acts</em> — it runs
            real workflows across your tools while you watch, with the handoffs and orchestration that
            matter. We borrow “you talk, it&apos;s done” and point it at doing the work.
          </p>
          <p className="mt-4 text-gray-4">
            Experimental concept preview · P1 (consume + run) is prototypable today · P2 (import) needs a
            per-platform integration layer · P3 (capture) is the LangGraph/engine bet.
          </p>
        </footer>
      </div>
    </div>
  );
}
