"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronRight, Lock, Plus, Store, Workflow } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { WorkflowSourceIcon } from "@/features/shared/components/WorkflowSourceIcon";
import type { WorkshopItem, WorkflowStep, RunFidelity } from "../data/workshop";

// "Getting a workflow in" — the real add flow on the Equip panel. A workflow is
// built elsewhere; here you just connect the platform it lives on and pick the
// flow. It arrives equipped, ready to run in the studio. (No builder in our UI.)

type Platform = {
  id: string;
  name: string;
  hint: string;
  color: string;
  letter: string;
  flows: string[];
  // What the platform lets us see of a run — sets the run panel we render.
  fidelity: RunFidelity;
  soon?: boolean;
};

const PLATFORMS: Platform[] = [
  { id: "n8n", name: "n8n", hint: "Open-source · MCP", color: "#EA4B71", letter: "n", fidelity: "polled", flows: ["Competitor Pricing Report", "Churn Alert Digest", "PR Triage Bot"] },
  { id: "power-automate", name: "Power Automate", hint: "Microsoft flows", color: "#0B63CE", letter: "P", fidelity: "polled", flows: ["Invoice Approval", "Onboarding Checklist"] },
  { id: "uipath", name: "UiPath", hint: "RPA robots", color: "#FA4616", letter: "U", fidelity: "status", flows: ["Data Entry Bot", "Monthly Report Generator"] },
  { id: "langflow", name: "LangFlow", hint: "Agentic graphs", color: "#16B364", letter: "L", fidelity: "live", flows: ["RAG Support Agent", "Lead Scorer"] },
  { id: "custom", name: "Custom builder", hint: "Coming soon", color: "#9aa0ad", letter: "Z", fidelity: "live", flows: [], soon: true },
];

// A plausible generic run for an imported flow (the studio run board reads this).
const GENERIC_STEPS: WorkflowStep[] = [
  { kind: "tool", label: "Fetch inputs", meta: "trigger data" },
  { kind: "tool", label: "Run the steps", meta: "on the source platform" },
  { kind: "approval", label: "Approve before it acts?", meta: "you stay in control" },
  { kind: "artifact", label: "Result", meta: "back in the studio" },
];

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Tile({ p }: { p: Platform }) {
  // Custom builder (Zeeshan's engine) has no brand — keep a neutral monogram tile.
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

export function ImportWorkflowDialog({
  open,
  onClose,
  onImport,
  equippedIds,
}: {
  open: boolean;
  onClose: () => void;
  onImport: (item: WorkshopItem) => void;
  equippedIds: Set<string>;
}) {
  const [platformId, setPlatformId] = useState<string | null>(null);
  const platform = PLATFORMS.find((p) => p.id === platformId) ?? null;

  const close = () => {
    setPlatformId(null);
    onClose();
  };

  const add = (flowName: string, p: Platform) => {
    onImport({
      id: `wf-imported-${p.id}-${slug(flowName)}`,
      name: flowName,
      description: `Imported from ${p.name}. Runs in the background.`,
      tab: "workflows",
      icon: Workflow,
      provenance: "imported",
      workflow: { source: "imported", platform: p.name, fidelity: p.fidelity, demo: true, steps: GENERIC_STEPS },
    });
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-[460px] gap-0 p-0">
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
                : "Import one you built elsewhere. No rebuild, no canvas."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="max-h-[52vh] overflow-y-auto p-4">
          {!platform ? (
            <div className="space-y-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={p.soon}
                  onClick={() => setPlatformId(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[12px] border px-3 py-2.5 text-left transition-colors",
                    p.soon
                      ? "cursor-not-allowed border-border opacity-55"
                      : "border-border hover:border-violet-mid hover:bg-violet-light/40"
                  )}
                >
                  <Tile p={p} />
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
                  {!p.soon && <ChevronRight size={16} className="text-gray-4" />}
                </button>
              ))}
            </div>
          ) : (
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
                {platform.flows.map((f) => {
                  const id = `wf-imported-${platform.id}-${slug(f)}`;
                  const owned = equippedIds.has(id);
                  return (
                    <div
                      key={f}
                      className="flex items-center gap-3 rounded-[12px] border border-border px-3 py-2.5"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-violet-light text-violet">
                        <Workflow size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-heading text-[13.5px] font-bold text-dark">{f}</span>
                        <span className="text-[12px] text-gray-4">via {platform.name}</span>
                      </span>
                      <button
                        type="button"
                        disabled={owned}
                        onClick={() => add(f, platform)}
                        className={cn(
                          "inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3.5 text-[12px] font-bold transition-colors",
                          owned
                            ? "border border-violet-mid bg-white text-violet"
                            : "bg-violet text-white hover:bg-violet-h"
                        )}
                      >
                        {owned ? (
                          <>
                            <Check size={12} /> Added
                          </>
                        ) : (
                          <>
                            <Plus size={12} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Link
          href="/marketplace"
          className="flex items-center justify-center gap-1.5 border-t border-border px-5 py-3 text-[12.5px] font-semibold text-gray-3 transition-colors hover:text-violet"
        >
          <Store size={14} /> Or buy a ready-made workflow in the marketplace
        </Link>
      </DialogContent>
    </Dialog>
  );
}
