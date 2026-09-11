"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle, ArrowRight, Check, Download, ExternalLink, Link2,
  RefreshCw, Upload, Workflow, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBuilderDrafts, clearBuilderDrafts, onBuilderDraftsChanged, type BuilderDraft,
} from "../lib/handoff";
import { saveBuiltWorkflow, builtId } from "../lib/built";

// OPTION B · the Workshop's hand-off to the external Workflow Builder.
//
// Launching out is one click. Getting the work BACK is the hard part, and this
// card makes all three transports concrete so the cost of each is visible.

// useSearchParams() must sit under a Suspense boundary or `next build` fails at
// prerender — tsc and eslint both pass without it. This is the exact failure
// that broke the design deploy (see Twynity-design/NOTES.md).
export function BuilderHandoff() {
  return (
    <Suspense fallback={null}>
      <BuilderHandoffInner />
    </Suspense>
  );
}

function BuilderHandoffInner() {
  const params = useSearchParams();
  const [drafts, setDrafts] = useState<BuilderDraft[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const returning = params.get("sync") === "1";

  useEffect(() => {
    const sync = () => setDrafts(getBuilderDrafts());
    sync();
    return onBuilderDraftsChanged(sync);
  }, []);

  const importAll = (via: "file" | "sync") => {
    for (const d of drafts) {
      saveBuiltWorkflow({
        id: builtId(d.name),
        name: d.name,
        description:
          via === "file"
            ? "Uploaded from workflow.json — a copy, not a link."
            : "Synced from Workflow Builder — stays in step with the original.",
        trigger: d.name.toLowerCase(),
        steps: [
          { kind: "tool", label: "Run the flow", meta: "on Workflow Builder" },
          { kind: "artifact", label: `${d.name} — result`, meta: "ready" },
        ],
        requires: [],
        platform: "Workflow Builder",
        // A file gives you the step list and nothing else — execution still
        // happens upstream, so there's no run stream to read.
        fidelity: via === "file" ? "status" : "polled",
        createdAt: new Date().getTime(),
      });
    }
    clearBuilderDrafts();
    toast.success(
      via === "file"
        ? `Imported ${drafts.length} — Twynity now holds a separate copy.`
        : `Synced ${drafts.length} from Workflow Builder.`
    );
  };

  return (
    <div className="mb-6 space-y-3">
      {/* return state — you came back and the work didn't follow */}
      {returning && drafts.length > 0 && !dismissed && (
        <div className="rounded-card border-[1.5px] border-amber-text/35 bg-amber/50 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-amber-text/15 text-amber-text">
              <AlertTriangle size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-heading text-[14.5px] font-bold tracking-[-0.2px] text-dark">
                {drafts.length} workflow{drafts.length > 1 ? "s" : ""} built in Workflow Builder, not yet in Twynity
              </h3>
              <p className="mt-0.5 text-[12.5px] leading-[1.5] text-gray-3">
                {drafts.map((d) => `“${d.name}”`).join(", ")} — your twyns can&apos;t run
                {drafts.length > 1 ? " them" : " it"} until{drafts.length > 1 ? " they get" : " it gets"} across.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => importAll("file")}
                  className="flex items-start gap-2.5 rounded-[11px] border border-border bg-white p-3 text-left transition-colors hover:border-gray-4"
                >
                  <Upload size={15} className="mt-0.5 shrink-0 text-gray-4" />
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-bold text-dark">Upload workflow.json</span>
                    <span className="block text-[11.5px] leading-[1.45] text-gray-4">
                      Makes a copy. Edit it upstream later and Twynity won&apos;t know.
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => importAll("sync")}
                  className="flex items-start gap-2.5 rounded-[11px] border-[1.5px] border-violet bg-violet-light/40 p-3 text-left transition-colors hover:bg-violet-light/70"
                >
                  <RefreshCw size={15} className="mt-0.5 shrink-0 text-violet" />
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-bold text-dark">Sync from the builder</span>
                    <span className="block text-[11.5px] leading-[1.45] text-gray-3">
                      One source of truth. Edits upstream show up here.
                    </span>
                  </span>
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-gray-4 hover:bg-white hover:text-dark"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* the launch card */}
      <div className="rounded-card border border-border bg-white p-5">
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[13px] bg-[#0e1117] text-white">
            <Workflow size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-[16px] font-bold tracking-[-0.3px] text-dark">
              Build in Workflow Builder
            </h3>
            <p className="mt-1 max-w-[560px] text-[13px] leading-[1.55] text-gray-3">
              Chain your twyns and their tools into a job. Workflow Builder is a
              separate application — it opens in a new browser tab, and you come
              back here to put the result on a twyn.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href="/workflow-builder"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-violet px-4 text-[12.5px] font-bold text-white transition-colors hover:bg-violet-h"
              >
                Open Workflow Builder
                {/* Announcing the new tab is a WCAG 3.2.5 expectation, not a nicety. */}
                <ExternalLink size={13} aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-gray-4">
                <ExternalLink size={11} /> Opens in a new tab
              </span>
            </div>
          </div>

          <div className="w-full max-w-[260px] rounded-[12px] border border-border bg-bg-content/50 p-3">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-5">
              Round trip
            </div>
            <ol className="space-y-1 text-[11.5px] leading-[1.5] text-gray-3">
              {[
                "Leave Twynity for a new tab",
                "Build and save there",
                "Come back and import it",
                "Then equip it to a twyn",
              ].map((s, i) => (
                <li key={s} className="flex gap-1.5">
                  <span className="font-sans font-bold text-gray-5">{i + 1}</span> {s}
                </li>
              ))}
            </ol>
            <div className="mt-2 flex items-center gap-1.5 border-t border-border pt-2 text-[11px] font-semibold text-gray-4">
              <Link2 size={11} /> 4 steps · 2 apps
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ArrowRight, Check, Download };
