"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Info, Shield } from "lucide-react";
import { toast } from "sonner";

// OPTION C · the external Workflow Builder, embedded.
//
// Same application as Option B — literally the same route — but rendered in an
// iframe inside our shell, themed light, with its own page chrome suppressed
// (`?embed=1`). The save event comes back over postMessage, so there is no
// export, no upload, and no second copy of the workflow.
//
// This is the shape Prismatic / Workato / Cyclr / n8n Embedded all ship.

export function EmbeddedBuilder() {
  const [saved, setSaved] = useState<string | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "twynity:workflow-saved") {
        setSaved(e.data.name);
        toast.success(`"${e.data.name}" saved — already in Twynity, nothing to import.`);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col px-4 py-4">
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <Link href="/workflows" className="grid h-8 w-8 place-items-center rounded-[9px] text-gray-4 transition-colors hover:bg-bg-input hover:text-dark">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-heading text-[16px] font-bold tracking-[-0.3px] text-dark">Workflow Builder</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-light px-2.5 py-1 text-[11px] font-bold text-violet">
          <Shield size={11} /> Embedded · runs inside Twynity
        </span>
        {saved && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-mint-text">
            <Check size={11} /> {saved} — synced, no import needed
          </span>
        )}
      </div>

      <div className="mb-3 flex items-start gap-2 rounded-[10px] bg-bg-content/60 px-3 py-2 text-[11.5px] leading-snug text-gray-3">
        <Info size={13} className="mt-0.5 shrink-0 text-violet" />
        <span>
          The <span className="font-semibold text-dark">same</span> Workflow Builder as the
          standalone app — iframed, themed to Twynity, its own header hidden. You never
          leave the page, so there is nothing to download or re-upload.
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-card border border-border bg-white">
        <iframe
          ref={frameRef}
          src="/workflow-builder?embed=1&theme=light"
          title="Workflow Builder"
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}
