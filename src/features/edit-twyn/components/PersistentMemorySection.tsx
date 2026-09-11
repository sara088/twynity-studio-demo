"use client";

import { useState } from "react";
import { Brain, Check, RefreshCw, ArrowLeftRight, Shield, Loader2 } from "lucide-react";
import { Section } from "./Section";
import { BrandIcon, hasBrandIcon } from "@/features/marketplace/components/BrandIcon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Persistent Memory — connect a twyn to an external second-brain so it remembers
// across sessions (reads AND writes), distinct from static Knowledge packs. Per
// twyn, like interconnectors. Experimental concept. Real logos where Simple Icons
// has them (Obsidian, Notion, Logseq); the rest fall back to a monogram tile.
type Platform = { id: string; name: string; hint: string; color: string; letter: string; logo?: string };

const PLATFORMS: Platform[] = [
  { id: "obsidian", name: "Obsidian", hint: "Markdown vault", color: "#7C3AED", letter: "O", logo: "obsidian" },
  { id: "notion", name: "Notion", hint: "Workspace & docs", color: "#111111", letter: "N", logo: "notion" },
  { id: "logseq", name: "Logseq", hint: "Outliner + graph", color: "#059669", letter: "L", logo: "logseq" },
];

function PlatformLogo({ p, big }: { p: Platform; big?: boolean }) {
  const dim = big ? "h-11 w-11" : "h-9 w-9";
  if (p.logo && hasBrandIcon(p.logo)) {
    return (
      <span className={cn("grid shrink-0 place-items-center rounded-[10px] border border-border bg-white", dim)}>
        <BrandIcon logo={p.logo} className={big ? "h-[22px] w-[22px]" : "h-[18px] w-[18px]"} />
      </span>
    );
  }
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-[10px] font-heading font-bold text-white", dim, big ? "text-[19px]" : "text-[16px]")} style={{ background: p.color }}>
      {p.letter}
    </span>
  );
}

export function PersistentMemorySection({ twynName }: { twynName: string }) {
  const [connected, setConnected] = useState<string | null>(null);
  const [pending, setPending] = useState<Platform | null>(null);
  const [access, setAccess] = useState<"read" | "readwrite">("readwrite");
  const platform = PLATFORMS.find((p) => p.id === connected) ?? null;

  return (
    <>
    <Section
      title="Persistent memory"
      summary={`A memory that lasts — ${twynName} remembers across every session.`}
      defaultOpen={false}
    >
      <div className="rounded-card border border-border bg-bg-input p-4">
        {/* What it is */}
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-violet-light text-violet">
            <Brain size={20} />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading text-[14px] font-semibold tracking-[-0.2px] text-dark">
              Connect a second brain
            </h3>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-gray-4">
              {twynName} reads and writes to your external memory — remembering context, decisions,
              and how you like things long after a chat ends. Unlike a Knowledge pack (static docs),
              this is a living memory it keeps up to date.
            </p>
          </div>
        </div>

        {platform ? (
          /* Connected state */
          <div className="mt-4 rounded-[14px] border border-violet-mid bg-white p-4">
            <div className="flex items-center gap-3">
              <PlatformLogo p={platform} big />
              <div className="min-w-0 flex-1">
                <div className="font-heading text-[14px] font-bold text-dark">{platform.name}</div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-mint-text">
                  <RefreshCw size={11} /> Synced just now · {access === "readwrite" ? "read & write" : "read only"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConnected(null)}
                className="h-8 shrink-0 rounded-full border border-border bg-white px-3.5 text-[12px] font-semibold text-gray-4 transition-colors hover:border-error hover:text-error"
              >
                Disconnect
              </button>
            </div>

            {/* Access mode */}
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <ArrowLeftRight size={13} className="text-gray-4" />
              <span className="text-[12px] font-semibold text-gray-3">Access</span>
              <div className="ml-auto inline-flex rounded-full bg-bg-input p-0.5">
                {(["read", "readwrite"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setAccess(m)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11.5px] font-semibold transition-colors",
                      access === m ? "bg-white text-dark shadow-[0_1px_2px_rgba(15,15,30,0.08)]" : "text-gray-4 hover:text-dark"
                    )}
                  >
                    {m === "read" ? "Read only" : "Read & write"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Pick a platform */
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {PLATFORMS.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-[12px] border border-border bg-white px-3 py-2.5">
                <PlatformLogo p={p} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-heading text-[13.5px] font-bold text-dark">{p.name}</div>
                  <div className="truncate text-[11.5px] text-gray-4">{p.hint}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPending(p)}
                  className="h-8 shrink-0 rounded-full bg-violet px-3.5 text-[12px] font-bold text-white transition-colors hover:bg-violet-h"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        )}

        {platform && (
          <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-gray-4">
            <Check size={12} className="text-mint-text" /> Connected on this twyn only — each twyn has its own memory.
          </p>
        )}
      </div>
    </Section>

    <MemoryConnectDialog
      key={pending?.id ?? "none"}
      platform={pending}
      twynName={twynName}
      onCancel={() => setPending(null)}
      onConnected={() => {
        if (pending) setConnected(pending.id);
        setAccess("readwrite");
        setPending(null);
      }}
    />
    </>
  );
}

// The secure connect flow, mirroring our interconnector ConnectDialog: explain the
// access, then "Continue with …" authorises (simulated here) and connects.
function MemoryConnectDialog({
  platform,
  twynName,
  onCancel,
  onConnected,
}: {
  platform: Platform | null;
  twynName: string;
  onCancel: () => void;
  onConnected: () => void;
}) {
  const [waiting, setWaiting] = useState(false);
  if (!platform) return null;

  const go = () => {
    setWaiting(true);
    setTimeout(onConnected, 1300);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-[440px] gap-0 p-0">
        <DialogHeader className="flex-row items-center gap-3 space-y-0 border-b border-border p-5">
          <PlatformLogo p={platform} big />
          <div className="min-w-0">
            <DialogTitle className="font-heading text-[16px] font-bold tracking-[-0.2px] text-dark">
              Connect {platform.name}
            </DialogTitle>
            <DialogDescription className="text-[12.5px] text-gray-4">
              Give {twynName} a lasting memory.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-5">
          <p className="text-[13px] leading-[1.55] text-gray-3">
            {twynName} will connect to your {platform.name} to:
          </p>
          <ul className="mt-3 space-y-2">
            {["Read your notes, links, and structure", "Write new memories back as you work", "Keep everything in sync across sessions"].map((s) => (
              <li key={s} className="flex items-start gap-2 text-[13px] text-dark">
                <Check size={15} strokeWidth={2.4} className="mt-0.5 shrink-0 text-violet" />
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-start gap-2 rounded-[10px] bg-bg-input px-3 py-2.5 text-[12px] leading-[1.5] text-gray-4">
            <Shield size={14} className="mt-0.5 shrink-0 text-gray-4" />
            Encrypted connection. Set it to read-only anytime, and disconnect whenever you like.
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-3 transition-colors hover:border-violet hover:text-violet"
          >
            Cancel
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={go}
            disabled={waiting}
            className="inline-flex items-center gap-1.5 rounded-full bg-violet px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-violet-h disabled:opacity-70"
          >
            {waiting ? <><Loader2 size={14} className="animate-spin" /> Connecting…</> : <>Continue with {platform.name}</>}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
