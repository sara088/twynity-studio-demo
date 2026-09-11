"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Hammer,
  Plus,
  Radio,
  Store,
  Workflow,
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
import type { WorkflowStep, RunFidelity } from "@/features/talk/data/workshop";
import { saveBuiltWorkflow, builtId, type BuiltWorkflow } from "../lib/built";

// "Add a workflow" — the single front door, in the order that matters:
//   1. Build it here (Twynity Workflow Builder) — the main flow.
//   2. Buy a ready-made one on the marketplace.
//   3. Import from another platform — secondary, collapsed by default.
//
// The hierarchy isn't arbitrary: only workflows that run on our own engine give
// a full live run board. Imported ones degrade to polled or status-only, and we
// say so on the tile rather than burying it.

type Platform = {
  id: string;
  name: string;
  hint: string;
  fidelity: RunFidelity;
  flows: string[];
};

const PLATFORMS: Platform[] = [
  { id: "n8n", name: "n8n", hint: "Open-source · MCP", fidelity: "polled", flows: ["Competitor Pricing Report", "Churn Alert Digest", "PR Triage Bot"] },
  { id: "power-automate", name: "Power Automate", hint: "Microsoft flows", fidelity: "polled", flows: ["Invoice Approval", "Onboarding Checklist"] },
  { id: "langflow", name: "LangFlow", hint: "Agentic graphs", fidelity: "live", flows: ["RAG Support Agent", "Lead Scorer"] },
  { id: "uipath", name: "UiPath", hint: "RPA robots", fidelity: "status", flows: ["Data Entry Bot", "Monthly Report Generator"] },
  { id: "zapier", name: "Zapier", hint: "Classic Zaps", fidelity: "status", flows: ["Expense Approvals", "Lead Router"] },
];

const FIDELITY_COPY: Record<RunFidelity, { label: string; tone: string }> = {
  live: { label: "Full live view", tone: "bg-mint text-mint-text" },
  polled: { label: "Step status, polled", tone: "bg-amber text-amber-text" },
  status: { label: "Status only", tone: "bg-bg-input text-gray-4" },
};

const GENERIC_STEPS: WorkflowStep[] = [
  { kind: "tool", label: "Fetch inputs", meta: "trigger data" },
  { kind: "tool", label: "Run the steps", meta: "on the source platform" },
  { kind: "approval", label: "Approve before it acts?", meta: "you stay in control" },
  { kind: "artifact", label: "Result", meta: "back in the studio" },
];

// The recommended route renders as a real <a target="_blank"> when the builder
// is a separate application — a button that opens a tab is a lie to anyone
// middle-clicking, and screen readers get no warning either (WCAG 3.2.5).
function BuilderTile({
  href,
  external,
  onNavigate,
  children,
}: {
  href: string;
  external: boolean;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  const className =
    "group relative block w-full overflow-hidden rounded-[16px] border-[1.5px] border-violet bg-violet-light/40 p-4 text-left transition-colors hover:bg-violet-light/70";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={className}
      >
        {children}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <button type="button" onClick={onNavigate} className={className}>
      {children}
    </button>
  );
}

export function AddWorkflowDialog({
  open,
  onClose,
  onAdded,
  /** Where the builder lives — differs between the two placements under test. */
  builderHref = "/workflows/builder",
  /** Option B: the builder is a separate application, so open it in a new tab
      exactly like the Workshop hand-off card does — same door, two entrances. */
  external = false,
}: {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
  builderHref?: string;
  external?: boolean;
}) {
  const router = useRouter();
  const [importOpen, setImportOpen] = useState(false);
  const [platformId, setPlatformId] = useState<string | null>(null);
  const platform = PLATFORMS.find((p) => p.id === platformId) ?? null;

  const close = () => {
    setPlatformId(null);
    setImportOpen(false);
    onClose();
  };

  const addImported = (flowName: string, p: Platform) => {
    const wf: BuiltWorkflow = {
      id: builtId(`${p.id}-${flowName}`),
      name: flowName,
      description: `Imported from ${p.name}.`,
      trigger: flowName.toLowerCase(),
      steps: GENERIC_STEPS,
      requires: [],
      platform: p.name,
      fidelity: p.fidelity,
      createdAt: new Date().getTime(),
    };
    saveBuiltWorkflow(wf);
    onAdded?.();
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-[520px] gap-0 p-0">
        <DialogHeader className="flex-row items-center gap-3 space-y-0 border-b border-border p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-violet-light text-violet">
            <Workflow size={20} />
          </span>
          <div className="min-w-0">
            <DialogTitle className="font-heading text-[16px] font-bold tracking-[-0.2px] text-dark">
              Add a workflow
            </DialogTitle>
            <DialogDescription className="text-[12.5px] text-gray-4">
              {platform
                ? `Pick a flow from ${platform.name} — it arrives equipped.`
                : "Build one here, buy one, or bring in a flow you already have."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="max-h-[62vh] overflow-y-auto p-4">
          {platform ? (
            /* ── Step 2 · pick a flow from the chosen platform ─────────── */
            <div>
              <button
                type="button"
                onClick={() => setPlatformId(null)}
                className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-4 transition-colors hover:text-violet"
              >
                <ArrowLeft size={14} /> All platforms
              </button>
              <div className="mb-2 flex items-center gap-2 rounded-[10px] bg-mint px-3 py-2 text-[12px] font-semibold text-mint-text">
                <Check size={14} /> Connected to {platform.name} · {platform.flows.length} flows found
              </div>
              <div className="space-y-2">
                {platform.flows.map((f) => (
                  <div key={f} className="flex items-center gap-3 rounded-[12px] border border-border px-3 py-2.5">
                    <WorkflowSourceIcon platform={platform.name} className="h-9 w-9 rounded-[10px] text-[14px]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-heading text-[13.5px] font-bold text-dark">{f}</span>
                      <span className="text-[12px] text-gray-4">
                        via {platform.name} · {FIDELITY_COPY[platform.fidelity].label.toLowerCase()}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => addImported(f, platform)}
                      className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-violet px-3.5 text-[12px] font-bold text-white transition-colors hover:bg-violet-h"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Step 1 · the three routes, in priority order ──────────── */
            <div className="space-y-3">
              {/* 1 · PRIMARY — build it in the Twynity Workflow Builder.
                  Same builder either way; only the door changes. */}
              <BuilderTile
                href={builderHref}
                external={external}
                onNavigate={() => {
                  close();
                  if (!external) router.push(builderHref);
                }}
              >
                <span className="absolute right-3 top-3 rounded-full bg-violet px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                  Recommended
                </span>
                <span className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-violet text-white">
                    <Hammer size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[15.5px] font-bold tracking-[-0.2px] text-dark">
                      Twynity Workflow Builder
                    </span>
                    <span className="mt-1 block text-[12.5px] leading-[1.5] text-gray-3">
                      {external
                        ? "A separate application — it opens in a new browser tab, and you come back here to put the result on a twyn."
                        : "Describe what you want, or add the steps yourself. No canvas, no node graph — just a list you can read."}
                    </span>
                    <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-mint-text">
                      <Radio size={11} /> Runs on our engine — full live view
                    </span>
                    {external && (
                      <span className="mt-2 flex items-center gap-1.5 text-[11.5px] font-medium text-gray-4">
                        <ExternalLink size={11} aria-hidden /> Opens in a new tab
                      </span>
                    )}
                  </span>
                  {/* External already says "Opens in a new tab" below the copy;
                      a second glyph here only collides with the badge. */}
                  {!external && (
                    <ArrowRight size={17} className="mt-1 shrink-0 text-violet transition-transform group-hover:translate-x-0.5" />
                  )}
                </span>
              </BuilderTile>

              {/* 2 · buy one */}
              <button
                type="button"
                onClick={() => {
                  close();
                  router.push("/marketplace");
                }}
                className="group flex w-full items-center gap-3 rounded-[14px] border border-border bg-white p-4 text-left transition-colors hover:border-violet-mid hover:bg-violet-light/30"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-amber text-amber-text">
                  <Store size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-[14px] font-bold text-dark">
                    Buy a ready-made one
                  </span>
                  <span className="block text-[12px] text-gray-4">
                    Built and verified by the community — works the moment you add it.
                  </span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-gray-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* 3 · SECONDARY — import from elsewhere, collapsed */}
              <div className="rounded-[14px] border border-border bg-bg-content/40">
                <button
                  type="button"
                  onClick={() => setImportOpen((v) => !v)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] border border-border bg-white text-gray-3">
                    <Workflow size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[14px] font-bold text-dark">
                      Already have one somewhere else?
                    </span>
                    <span className="block text-[12px] text-gray-4">
                      Import from n8n, Power Automate, LangFlow, UiPath or Zapier.
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "shrink-0 text-gray-4 transition-transform",
                      importOpen && "rotate-180"
                    )}
                  />
                </button>

                {importOpen && (
                  <div className="space-y-1.5 border-t border-border p-3">
                    <p className="px-1 pb-1 text-[11.5px] leading-[1.5] text-gray-4">
                      Imported flows run on their own platform, so how much of the run
                      you can watch depends on what that platform exposes.
                    </p>
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlatformId(p.id)}
                        className="flex w-full items-center gap-3 rounded-[11px] border border-transparent px-2.5 py-2 text-left transition-colors hover:border-border hover:bg-white"
                      >
                        <WorkflowSourceIcon platform={p.name} className="h-8 w-8 rounded-[9px] text-[13px]" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-heading text-[13px] font-bold text-dark">{p.name}</span>
                          <span className="block text-[11.5px] text-gray-4">{p.hint}</span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                            FIDELITY_COPY[p.fidelity].tone
                          )}
                        >
                          {FIDELITY_COPY[p.fidelity].label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
