"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Copy, Download } from "lucide-react";
import { WorkflowBuilder } from "./WorkflowBuilder";
import { markBuilderDrafts } from "../lib/handoff";

// OPTION B · the external Workflow Builder, standing alone.
//
// When `?embed=1` it drops its own page chrome so it can be iframed by Option C
// — exactly how Prismatic's embedded designer hides host-app-irrelevant UI via
// `screenConfiguration`.

// Suspense boundary required for useSearchParams() during prerender.
export function StandaloneBuilder() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e1117]" />}>
      <StandaloneBuilderInner />
    </Suspense>
  );
}

function StandaloneBuilderInner() {
  const params = useSearchParams();
  const embedded = params.get("embed") === "1";
  const theme = (params.get("theme") === "light" ? "light" : "dark") as "light" | "dark";
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!embedded) document.body.style.background = theme === "dark" ? "#0e1117" : "";
    return () => { document.body.style.background = ""; };
  }, [embedded, theme]);

  const onSaved = (name: string) => {
    // The handoff moment. In the embedded frame this is a postMessage to the
    // host; standalone, it's a record the host polls for on return.
    markBuilderDrafts(name);
    if (embedded && typeof window !== "undefined") {
      window.parent?.postMessage({ type: "twynity:workflow-saved", name }, window.location.origin);
    }
    setSaved(name);
  };

  if (embedded) {
    return (
      <div className="h-screen w-screen">
        <WorkflowBuilder theme={theme} frame="embedded" onSaved={onSaved} />
        {saved && (
          <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-mint px-4 py-2 text-[12.5px] font-bold text-mint-text shadow-lg">
            <Check size={13} className="mr-1 inline" /> Saved — synced to Twynity instantly
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0e1117] px-4 py-4">
      {/* A different product's chrome — no Twynity nav anywhere. */}
      <div className="mx-auto mb-3 flex max-w-[1200px] items-center gap-2">
        <span className="font-heading text-[15px] font-bold text-[#e6e9ef]">Workflow Builder</span>
        <span className="rounded-full border border-[#2b3446] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#8b94a7]">
          workflow-builder.app
        </span>
        <span className="ml-auto text-[11.5px] text-[#5f6878]">
          You left Twynity. Close this tab to go back.
        </span>
      </div>

      <div className="mx-auto h-[calc(100vh-120px)] max-w-[1200px]">
        <WorkflowBuilder theme="dark" frame="external" onSaved={onSaved} />
      </div>

      {saved && <ReturnBar name={saved} />}
    </div>
  );
}

// What has to exist if the builder lives in another tab: an explicit way home,
// and an explicit way to get the work across. Both are pure overhead that the
// native and embedded frames simply don't have.
function ReturnBar({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="fixed inset-x-0 bottom-0 border-t border-[#2b3446] bg-[#131822] px-5 py-3.5">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint text-mint-text">
          <Check size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-[#e6e9ef]">
            &ldquo;{name}&rdquo; saved in Workflow Builder
          </span>
          <span className="block text-[11.5px] text-[#8b94a7]">
            It isn&apos;t in Twynity yet — that&apos;s the hand-off problem.
          </span>
        </span>

        <button
          type="button"
          onClick={() => { setCopied(true); }}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#2b3446] px-3.5 text-[12.5px] font-semibold text-[#8b94a7] transition-colors hover:text-[#e6e9ef]"
        >
          {copied ? <Check size={13} /> : <Download size={13} />}
          {copied ? "workflow.json downloaded" : "Download JSON"}
        </button>
        <a
          href="/assets?sync=1"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#2f6fd0] px-4 text-[12.5px] font-bold text-white transition-opacity hover:opacity-90"
        >
          <ArrowLeft size={13} /> Back to Twynity
        </a>
      </div>
    </div>
  );
}

export { Copy };
