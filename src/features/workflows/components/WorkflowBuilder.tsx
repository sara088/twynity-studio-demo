"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Check, ChevronDown, ExternalLink, FileText, FlaskConical,
  Play, Plus, Save, ShieldCheck, Trash2, Users, Workflow, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { saveBuiltWorkflow, builtId } from "../lib/built";
import type { WorkflowStep } from "@/features/talk/data/workshop";

// ─────────────────────────────────────────────────────────────────────────────
// The Workflow Builder, as a placeholder for the real (existing) builder.
//
// ONE component rendered in three frames, because the whole point of the
// comparison is that the builder is identical and only the FRAME differs:
//   A · native   — light, inside the Twynity shell
//   B · external — dark, standalone tab, no Twynity chrome  (today's builder)
//   C · embedded — light, inside an iframe in the Twynity shell
// If each option had its own mock, the comparison would be about the mocks.
// ─────────────────────────────────────────────────────────────────────────────

export type BuilderTheme = "light" | "dark";

type Skin = {
  shell: string; bar: string; rail: string; canvas: string; text: string;
  sub: string; faint: string; card: string; cardOn: string; input: string;
  divide: string; hover: string; accent: string; accentBg: string;
};

const SKIN: Record<BuilderTheme, Skin> = {
  light: {
    shell: "bg-white border-border", bar: "border-border",
    rail: "bg-bg-content/40 border-border",
    canvas: "bg-[radial-gradient(circle,rgba(15,15,30,0.05)_1px,transparent_1px)]",
    text: "text-dark", sub: "text-gray-4", faint: "text-gray-5",
    card: "bg-white border-border hover:border-violet-mid",
    cardOn: "border-violet shadow-[0_4px_16px_rgba(108,92,231,0.16)]",
    input: "bg-white border-border", divide: "bg-border", hover: "hover:bg-white",
    accent: "text-violet", accentBg: "bg-violet",
  },
  dark: {
    shell: "bg-[#0e1117] border-[#232936]", bar: "border-[#232936]",
    rail: "bg-[#131822] border-[#232936]",
    canvas: "bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)]",
    text: "text-[#e6e9ef]", sub: "text-[#8b94a7]", faint: "text-[#5f6878]",
    card: "bg-[#1a2130] border-[#2b3446] hover:border-[#3d84f7]",
    cardOn: "border-[#3d84f7] shadow-[0_4px_16px_rgba(61,132,247,0.28)]",
    input: "bg-[#1a2130] border-[#2b3446]", divide: "bg-[#2b3446]",
    hover: "hover:bg-[#1a2130]", accent: "text-[#3d84f7]", accentBg: "bg-[#2f6fd0]",
  },
};

type Persona = { id: string; name: string; tools: number; initials: string };

const PERSONAS: Persona[] = [
  { id: "sara", name: "Sara Gordic", tools: 2, initials: "SG" },
  { id: "edward", name: "Edward Kuagbenu", tools: 2, initials: "EK" },
  { id: "samuel", name: "Samuel Sackey", tools: 1, initials: "SS" },
  { id: "ato", name: "Ato Toffah", tools: 1, initials: "AT" },
];

type BuilderStep = { id: string; actor: string; task: string; kind: WorkflowStep["kind"] };

const SEED: BuilderStep[] = [
  { id: "s1", actor: "Edward Kuagbenu", task: "get railway projects", kind: "handoff" },
  { id: "s2", actor: "Samuel Sackey", task: "create a github repo for this project", kind: "handoff" },
];

const KIND: Record<WorkflowStep["kind"], { label: string; icon: typeof Zap; tone: string }> = {
  tool: { label: "tool", icon: Zap, tone: "bg-amber text-amber-text" },
  handoff: { label: "twyn", icon: Users, tone: "bg-violet-light text-violet" },
  approval: { label: "your OK", icon: ShieldCheck, tone: "bg-mint text-mint-text" },
  artifact: { label: "result", icon: FileText, tone: "bg-bg-input text-gray-3" },
};

export function WorkflowBuilder({
  theme = "light",
  /** external = standalone tab (its own product); embedded/native = inside Twynity. */
  frame = "native",
  backHref,
  onSaved,
}: {
  theme?: BuilderTheme;
  frame?: "native" | "external" | "embedded";
  backHref?: string;
  onSaved?: (name: string) => void;
}) {
  const router = useRouter();
  const k = SKIN[theme];
  const [name, setName] = useState("Railway");
  const [steps, setSteps] = useState<BuilderStep[]>(SEED);
  const [selected, setSelected] = useState<string | null>("s1");
  const [tab, setTab] = useState<"steps" | "workflows">("steps");
  const nextId = useRef(SEED.length + 1);
  const makeId = () => `s${nextId.current++}`;

  const step = steps.find((s) => s.id === selected) ?? null;

  const addStep = (actor: string, task: string, kind: WorkflowStep["kind"]) => {
    const id = makeId();
    setSteps((p) => [...p, { id, actor, task, kind }]);
    setSelected(id);
  };

  const save = () => {
    const t = name.trim() || "Untitled workflow";
    saveBuiltWorkflow({
      id: builtId(t),
      name: t,
      description: `${steps.length} steps · built in the Workflow Builder.`,
      trigger: t.toLowerCase(),
      steps: [
        ...steps.map<WorkflowStep>((s) => ({
          kind: s.kind, label: s.task, meta: s.actor,
          actor: s.kind === "handoff" ? s.actor : undefined,
        })),
        { kind: "artifact", label: `${t} — result`, meta: "ready" },
      ],
      requires: [],
      fidelity: "live",
      createdAt: new Date().getTime(),
    });
    if (onSaved) return onSaved(t);
    toast.success(`"${t}" saved — equipped and ready to run.`);
    if (backHref) router.push(backHref);
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden border", k.shell, frame !== "external" && "rounded-card")}>
      {/* top bar */}
      <header className={cn("flex shrink-0 flex-wrap items-center gap-2.5 border-b px-4 py-2.5", k.bar)}>
        {backHref && frame !== "external" && (
          <button type="button" onClick={() => router.push(backHref)} aria-label="Back"
            className={cn("grid h-8 w-8 place-items-center rounded-[9px] transition-colors", k.sub, k.hover)}>
            <ArrowLeft size={16} />
          </button>
        )}
        <span className={cn("flex items-center gap-2 font-heading text-[14px] font-bold tracking-[-0.2px]", k.text)}>
          <Workflow size={16} className={k.accent} />
          Workflow Builder
          {frame === "external" && (
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]", k.input, k.sub, "border")}>
              separate app
            </span>
          )}
        </span>
        <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Workflow name"
          className={cn("w-[150px] rounded-[9px] border px-2.5 py-1.5 font-heading text-[13.5px] font-bold outline-none", k.input, k.text)} />
        <span className="rounded-full bg-amber px-2 py-0.5 text-[10.5px] font-bold text-amber-text">Unsaved</span>

        <div className="ml-auto flex items-center gap-2">
          {(["Test", "Run"] as const).map((b) => (
            <button key={b} type="button"
              className={cn("inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors", k.input, k.text)}>
              {b === "Test" ? <FlaskConical size={13} /> : <Play size={13} />} {b}
            </button>
          ))}
          <button type="button" onClick={save}
            className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-bold text-white transition-opacity hover:opacity-90", k.accentBg)}>
            <Save size={13} /> Save
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* left rail */}
        <aside className={cn("hidden w-[220px] shrink-0 flex-col border-r md:flex", k.rail)}>
          <div className={cn("flex shrink-0 gap-4 border-b px-4", k.bar)}>
            {(["steps", "workflows"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={cn("-mb-px border-b-2 py-2.5 text-[12.5px] font-semibold capitalize transition-colors",
                  tab === t ? cn("border-current", k.accent) : cn("border-transparent", k.sub))}>
                {t}
              </button>
            ))}
          </div>
          <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
            {tab === "steps" ? (
              <>
                <RailLabel k={k}>Your twyns</RailLabel>
                {PERSONAS.map((p) => (
                  <button key={p.id} type="button" onClick={() => addStep(p.name, "describe what they do", "handoff")}
                    className={cn("group flex w-full items-center gap-2.5 rounded-[10px] px-2 py-2 text-left transition-colors", k.hover)}>
                    <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white", k.accentBg)}>{p.initials}</span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-[12.5px] font-semibold", k.text)}>{p.name}</span>
                      <span className={cn("block text-[11px]", k.sub)}>{p.tools} connected tools</span>
                    </span>
                    <Plus size={14} className={cn("shrink-0 opacity-0 transition-opacity group-hover:opacity-100", k.faint)} />
                  </button>
                ))}
                <RailLabel k={k} className="mt-4">Other steps</RailLabel>
                <button type="button" onClick={() => addStep("You", "approve before it acts", "approval")}
                  className={cn("group flex w-full items-center gap-2.5 rounded-[10px] px-2 py-2 text-left transition-colors", k.hover)}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-mint text-mint-text"><ShieldCheck size={15} /></span>
                  <span className={cn("min-w-0 flex-1 text-[12.5px] font-semibold", k.text)}>Wait for my OK</span>
                  <Plus size={14} className={cn("shrink-0 opacity-0 transition-opacity group-hover:opacity-100", k.faint)} />
                </button>
                <button type="button" onClick={() => addStep("Connected tool", "call a tool", "tool")}
                  className={cn("group flex w-full items-center gap-2.5 rounded-[10px] px-2 py-2 text-left transition-colors", k.hover)}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-amber text-amber-text"><Zap size={15} /></span>
                  <span className={cn("min-w-0 flex-1 text-[12.5px] font-semibold", k.text)}>Use a tool</span>
                  <Plus size={14} className={cn("shrink-0 opacity-0 transition-opacity group-hover:opacity-100", k.faint)} />
                </button>
              </>
            ) : (
              <>
                <RailLabel k={k}>Saved</RailLabel>
                {["Railway · 2 steps", "Railway projects · 1 step"].map((w) => (
                  <div key={w} className={cn("rounded-[10px] px-2 py-2 text-[12.5px] font-semibold", k.sub, k.hover)}>{w}</div>
                ))}
              </>
            )}
          </div>
        </aside>

        {/* canvas */}
        <div className={cn("scrollbar-thin min-w-0 flex-1 overflow-auto [background-size:18px_18px]", k.canvas)}>
          <div className="flex items-center gap-2 px-5 py-3">
            {[`${steps.length} steps`, `${Math.max(steps.length, 1)} connections`].map((t) => (
              <span key={t} className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", k.input, k.sub)}>{t}</span>
            ))}
          </div>
          <div className="flex flex-col items-center p-8 pt-2">
            <div className="flex items-center gap-2 rounded-[12px] border-[1.5px] border-mint-text/40 bg-mint px-4 py-2.5">
              <Play size={14} className="text-mint-text" />
              <span className="text-[12.5px] font-bold text-mint-text">START</span>
              <span className="text-[11px] text-mint-text/70">entry point</span>
            </div>
            {steps.map((s) => {
              const m = KIND[s.kind];
              const Icon = m.icon;
              return (
                <div key={s.id} className="flex flex-col items-center">
                  <span className={cn("h-6 w-px", k.divide)} />
                  <button type="button" onClick={() => setSelected(s.id)}
                    className={cn("flex w-[280px] items-center gap-3 rounded-[12px] border-[1.5px] px-3.5 py-3 text-left transition-all",
                      k.card, s.id === selected && k.cardOn)}>
                    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-[10px]", m.tone)}><Icon size={16} /></span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-[13px] font-bold", k.text)}>{s.actor}</span>
                      <span className={cn("block truncate text-[11.5px]", k.sub)}>{s.task}</span>
                    </span>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold", m.tone)}>{m.label}</span>
                  </button>
                </div>
              );
            })}
            <span className={cn("h-6 w-px", k.divide)} />
            <div className={cn("flex items-center gap-2 rounded-[12px] border border-dashed px-4 py-2.5 text-[12px] font-semibold", k.input, k.sub)}>
              <Check size={13} className="text-mint-text" /> Result
            </div>
          </div>
        </div>

        {/* configure */}
        <aside className={cn("hidden w-[270px] shrink-0 flex-col border-l lg:flex", k.bar)}>
          <div className={cn("flex shrink-0 gap-4 border-b px-4", k.bar)}>
            {["Configure", "Resources", "Run"].map((t, i) => (
              <span key={t} className={cn("-mb-px border-b-2 py-2.5 text-[12.5px] font-semibold",
                i === 0 ? cn("border-current", k.accent) : cn("border-transparent", k.sub))}>{t}</span>
            ))}
          </div>
          <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
            {!step ? (
              <p className={cn("pt-10 text-center text-[12.5px]", k.sub)}>Select a step to configure it.</p>
            ) : (
              <div className="space-y-4">
                <Field k={k} label="Who does this">
                  <div className={cn("flex items-center gap-2 rounded-[10px] border px-3 py-2", k.input)}>
                    <span className={cn("grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-white", k.accentBg)}>
                      {step.actor.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                    <span className={cn("text-[12.5px] font-semibold", k.text)}>{step.actor}</span>
                    <ChevronDown size={14} className={cn("ml-auto", k.sub)} />
                  </div>
                </Field>
                <Field k={k} label="What they do">
                  <textarea rows={3} value={step.task}
                    onChange={(e) => setSteps((p) => p.map((s) => (s.id === step.id ? { ...s, task: e.target.value } : s)))}
                    className={cn("w-full resize-none rounded-[10px] border px-3 py-2 text-[12.5px] leading-[1.5] outline-none", k.input, k.text)} />
                </Field>
                <Field k={k} label="What it returns">
                  <div className={cn("rounded-[10px] border px-3 py-2 text-[12.5px]", k.input, k.sub)}>
                    Written response <ChevronDown size={14} className="float-right mt-0.5" />
                  </div>
                </Field>
                <Field k={k} label="If it fails">
                  <div className={cn("rounded-[10px] border px-3 py-2 text-[12.5px]", k.input, k.sub)}>
                    Try again once, then stop <ChevronDown size={14} className="float-right mt-0.5" />
                  </div>
                </Field>
                <button type="button" onClick={() => { setSteps((p) => p.filter((s) => s.id !== step.id)); setSelected(null); }}
                  className={cn("inline-flex items-center gap-1.5 text-[12px] font-semibold transition-colors hover:text-error", k.sub)}>
                  <Trash2 size={13} /> Remove step
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function RailLabel({ children, k, className }: { children: React.ReactNode; k: Skin; className?: string }) {
  return <div className={cn("mb-1.5 px-1 text-[10px] font-bold uppercase tracking-[0.1em]", k.faint, className)}>{children}</div>;
}

function Field({ label, children, k }: { label: string; children: React.ReactNode; k: Skin }) {
  return (
    <div>
      <div className={cn("mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.09em]", k.faint)}>{label}</div>
      {children}
    </div>
  );
}

export { ExternalLink };
