"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hammer, Play, Plus, Radio, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkflowSourceIcon } from "@/features/shared/components/WorkflowSourceIcon";
import { AddWorkflowDialog } from "./AddWorkflowDialog";
import {
  getBuiltWorkflows,
  onBuiltWorkflowsChanged,
  deleteBuiltWorkflow,
  type BuiltWorkflow,
} from "../lib/built";
import { WORKSHOP_CATALOG, slashFor } from "@/features/talk/data/workshop";

// PLACEMENT A — Workflows as its own top-level tab in the sidebar.
// Everything workflow-related in one place: what you have, and one button to get
// more. Compare with PLACEMENT B (inside Workshop → /assets).

const SEEDED = WORKSHOP_CATALOG.filter((i) => i.tab === "workflows" && i.workflow);

const FIDELITY = {
  live: { label: "Full live view", tone: "bg-mint text-mint-text" },
  polled: { label: "Polled", tone: "bg-amber text-amber-text" },
  status: { label: "Status only", tone: "bg-bg-input text-gray-4" },
} as const;

export function WorkflowsHome() {
  const [built, setBuilt] = useState<BuiltWorkflow[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const sync = () => setBuilt(getBuiltWorkflows());
    sync();
    return onBuiltWorkflowsChanged(sync);
  }, []);

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-8 sm:px-10">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-[28px] font-bold leading-[1.1] tracking-[-0.7px] text-dark">
            Workflows
          </h1>
          <p className="mt-1.5 max-w-[560px] text-[14px] leading-[1.55] text-gray-3">
            Multi-step jobs your twyns run end-to-end. Build one here, buy one, or
            bring in a flow you already have.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-violet px-5 text-[13.5px] font-bold text-white transition-colors hover:bg-violet-h"
        >
          <Plus size={16} /> New workflow
        </button>
      </header>

      {/* The primary path, given its own real estate rather than hidden in a menu. */}
      <Link
        href="/workflows/builder"
        className="group mb-7 flex items-center gap-4 rounded-card border-[1.5px] border-violet bg-violet-light/40 p-5 transition-colors hover:bg-violet-light/70"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[13px] bg-violet text-white">
          <Hammer size={21} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-[16px] font-bold tracking-[-0.3px] text-dark">
            Build one in the Twynity Workflow Builder
          </span>
          <span className="mt-0.5 block text-[13px] leading-[1.5] text-gray-3">
            Chain your twyns and their tools into a job you can run by name. Built
            here means we can show you every step as it happens.
          </span>
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-[11.5px] font-bold text-mint-text sm:inline-flex">
          <Radio size={12} /> Full live view
        </span>
      </Link>

      <SectionTitle
        title="Yours"
        count={built.length}
        empty="Nothing built yet — start with the builder above."
      />
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {built.map((w) => (
          <article
            key={w.id}
            className="hover-lift flex items-center gap-3 rounded-card border border-border bg-white p-4"
          >
            <WorkflowSourceIcon platform={w.platform} className="h-11 w-11 text-[16px]" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-heading text-[14.5px] font-bold tracking-[-0.2px] text-dark">
                {w.name}
              </h3>
              <p className="truncate text-[12px] text-gray-4">{w.description}</p>
              <span className="mt-1 inline-block rounded bg-bg-input px-1.5 py-0.5 font-sans text-[11px] font-semibold text-violet">
                {slashFor(w.name)}
              </span>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                FIDELITY[w.fidelity].tone
              )}
            >
              {FIDELITY[w.fidelity].label}
            </span>
            <button
              type="button"
              onClick={() => deleteBuiltWorkflow(w.id)}
              aria-label={`Delete ${w.name}`}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-gray-5 transition-colors hover:bg-bg-input hover:text-error"
            >
              <Trash2 size={14} />
            </button>
          </article>
        ))}
      </div>

      <SectionTitle title="Included with your plan" count={SEEDED.length} />
      <div className="grid gap-3 sm:grid-cols-2">
        {SEEDED.map((i) => (
          <article
            key={i.id}
            className="hover-lift flex items-center gap-3 rounded-card border border-border bg-white p-4"
          >
            <WorkflowSourceIcon platform={i.workflow?.platform} className="h-11 w-11 text-[16px]" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-heading text-[14.5px] font-bold tracking-[-0.2px] text-dark">
                {i.name}
              </h3>
              <p className="truncate text-[12px] text-gray-4">{i.description}</p>
              <span className="mt-1 inline-block rounded bg-bg-input px-1.5 py-0.5 font-sans text-[11px] font-semibold text-violet">
                {slashFor(i.name)}
              </span>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                FIDELITY[i.workflow!.fidelity].tone
              )}
            >
              {FIDELITY[i.workflow!.fidelity].label}
            </span>
          </article>
        ))}
      </div>

      <p className="mt-8 flex items-center gap-2 rounded-card border border-border bg-bg-content/50 px-4 py-3 text-[12.5px] text-gray-3">
        <Play size={14} className="shrink-0 text-violet" />
        Run any of these from a twyn&apos;s chat — type{" "}
        <span className="font-sans font-semibold text-gray-2">/</span> or just say the
        name. <Link href="/talk/sara" className="font-semibold text-violet">Open the studio →</Link>
      </p>

      <AddWorkflowDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function SectionTitle({ title, count, empty }: { title: string; count: number; empty?: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="font-heading text-[13px] font-bold uppercase tracking-[0.09em] text-gray-5">
        {title}
      </h2>
      <span className="rounded-full bg-bg-input px-2 py-0.5 text-[11px] font-bold text-gray-4">{count}</span>
      {count === 0 && empty && <span className="text-[12.5px] text-gray-4">— {empty}</span>}
    </div>
  );
}
