"use client";

import { useState } from "react";
import { X, ArrowLeft, ArrowRight, Calendar, Link as LinkIcon, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { BrandIcon, TeamsIcon } from "@/features/marketplace/components/BrandIcon";
import type { Twyn } from "../types";

// The live-call destinations. Zoom/Meet are still "Soon"; Microsoft Teams opens a
// preview of its deploy flow (paste a link, or pick a meeting from your calendar).
const PLATFORMS = [
  { id: "teams", name: "Microsoft Teams", desc: "Have your twyn join a live Teams call." },
  { id: "zoom", name: "Zoom", desc: "Bring your twyn into a Zoom meeting." },
  { id: "meet", name: "Google Meet", desc: "Add your twyn to a Google Meet call." },
] as const;

// Mock upcoming meetings for the calendar option.
const MEETINGS = [
  { title: "Weekly Team Sync", when: "Today · 2:00 PM" },
  { title: "Design Review", when: "Tomorrow · 10:30 AM" },
  { title: "Client Onboarding", when: "Thu · 3:00 PM" },
];

export function DeployTwynModal({
  open,
  onOpenChange,
  twyn,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  twyn: Twyn;
}) {
  const first = twyn.name.replace(/^Virtual\s+/i, "").split(" ")[0];
  const [step, setStep] = useState<"platforms" | "teams">("platforms");
  // Microsoft account connection (mock OAuth) — gates the calendar option, since
  // reading the calendar needs Calendars.Read consent via Microsoft Graph.
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 900);
  };

  // Reset to the platform list whenever the dialog closes, so it always reopens there.
  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setStep("platforms");
      setConnected(false);
      setConnecting(false);
    }
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[480px] gap-0 overflow-hidden rounded-card p-0 shadow-[0_24px_64px_rgba(15,15,30,0.24)]"
      >
        {step === "platforms" ? (
          <div className="px-[26px] pb-6 pt-[22px]">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="mb-1 font-heading text-[19px] font-semibold leading-[1.15] tracking-[-0.4px] text-dark">
                  Deploy {first}
                </DialogTitle>
                <DialogDescription className="text-[13px] leading-[1.45] text-gray-3">
                  Invite your twyn to join a live video call as a speaking participant.
                </DialogDescription>
              </div>
              <DialogClose
                aria-label="Close"
                className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[8px] bg-bg-input text-gray-3 outline-none transition-colors hover:bg-border hover:text-dark focus-visible:ring-2 focus-visible:ring-violet/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <X size={14} strokeWidth={2.2} />
              </DialogClose>
            </div>

            <div className="space-y-2">
              {PLATFORMS.map((p) =>
                p.id === "teams" ? (
                  // Teams is live (preview flow).
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setStep("teams")}
                    className="flex w-full items-center gap-3.5 rounded-input border border-border bg-white px-3.5 py-3 text-left transition-colors hover:border-violet"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] border border-border bg-white">
                      <TeamsIcon className="h-[22px] w-[22px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold text-dark">{p.name}</span>
                      <span className="block text-[12px] leading-[1.4] text-gray-4">{p.desc}</span>
                    </span>
                    <ArrowRight size={16} className="shrink-0 text-gray-4" />
                  </button>
                ) : (
                  <div
                    key={p.id}
                    aria-disabled
                    title="Coming soon"
                    className="flex cursor-not-allowed items-center gap-3.5 rounded-input border border-border bg-bg-input/40 px-3.5 py-3"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] border border-border bg-white opacity-55 grayscale">
                      <BrandIcon logo={p.id} className="h-[22px] w-[22px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold text-gray-2">{p.name}</span>
                      <span className="block text-[12px] leading-[1.4] text-gray-4">{p.desc}</span>
                    </span>
                    <span className="shrink-0 rounded-chip border border-border bg-white px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.05em] text-gray-5">
                      Soon
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : (
          /* ---- Microsoft Teams flow (preview) ---- */
          <div className="max-h-[85vh] overflow-y-auto px-[26px] pb-6 pt-[22px]">
            <div className="mb-5 flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => setStep("platforms")}
                aria-label="Back"
                className="mt-0.5 grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[8px] bg-bg-input text-gray-3 transition-colors hover:bg-border hover:text-dark"
              >
                <ArrowLeft size={15} />
              </button>
              <div className="min-w-0 flex-1">
                <DialogTitle className="flex items-center gap-2 font-heading text-[18px] font-semibold leading-tight tracking-[-0.4px] text-dark">
                  <TeamsIcon className="h-[18px] w-[18px]" /> Add {first} to a Teams call
                </DialogTitle>
                <DialogDescription className="mt-1 text-[13px] leading-[1.45] text-gray-3">
                  Two ways to bring {first} in as a speaking participant.
                </DialogDescription>
              </div>
              <DialogClose
                aria-label="Close"
                className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[8px] bg-bg-input text-gray-3 transition-colors hover:bg-border hover:text-dark"
              >
                <X size={14} strokeWidth={2.2} />
              </DialogClose>
            </div>

            {/* Option 1 — paste a meeting link */}
            <div className="rounded-input border border-border p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-violet-light text-violet">
                  <LinkIcon size={15} />
                </span>
                <span className="text-[13.5px] font-semibold text-dark">Paste a meeting link</span>
              </div>
              <p className="mb-3 text-[12px] leading-[1.5] text-gray-4">Drop a Teams meeting link and {first} joins that call.</p>
              <div className="flex gap-2">
                <input
                  disabled
                  placeholder="https://teams.microsoft.com/l/meetup-join/…"
                  className="h-10 min-w-0 flex-1 cursor-not-allowed rounded-input border border-border bg-bg-input px-3 text-[12.5px] text-gray-4 outline-none placeholder:text-gray-5"
                />
                <button
                  type="button"
                  disabled
                  className="shrink-0 cursor-not-allowed rounded-input bg-bg-input px-4 text-[12.5px] font-semibold text-gray-4"
                >
                  Join
                </button>
              </div>
            </div>

            {/* or */}
            <div className="my-3 flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-[0.08em] text-gray-5">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>

            {/* Option 2 — pick from calendar (needs a connected Microsoft account) */}
            <div className="rounded-input border border-border p-4">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-violet-light text-violet">
                  <Calendar size={15} />
                </span>
                <span className="text-[13.5px] font-semibold text-dark">Pick from your calendar</span>
                {connected && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-chip bg-mint px-2 py-0.5 text-[10.5px] font-bold text-mint-text">
                    <Check size={11} strokeWidth={2.8} /> Connected
                  </span>
                )}
              </div>

              {connected ? (
                <>
                  <p className="mb-3 text-[12px] leading-[1.5] text-gray-4">Choose an upcoming meeting for {first} to join.</p>
                  <ul className="space-y-1.5">
                    {MEETINGS.map((mtg) => (
                      <li key={mtg.title} className="flex items-center gap-3 rounded-[11px] border border-border bg-bg-input/40 px-3 py-2">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-border bg-white text-gray-4">
                          <Calendar size={14} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12.5px] font-semibold text-gray-2">{mtg.title}</span>
                          <span className="block text-[11px] text-gray-4">{mtg.when}</span>
                        </span>
                        <button
                          type="button"
                          disabled
                          className="shrink-0 cursor-not-allowed rounded-full border border-border bg-white px-3 py-1 text-[11.5px] font-semibold text-gray-4"
                        >
                          Join
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p className="mb-3 text-[12px] leading-[1.5] text-gray-4">
                    Connect your Microsoft account so {first} can read your calendar and join a meeting.
                  </p>
                  <button
                    type="button"
                    onClick={connect}
                    disabled={connecting}
                    className="inline-flex h-10 items-center gap-2 rounded-input border border-border bg-white px-4 text-[12.5px] font-semibold text-dark transition-colors hover:border-violet disabled:cursor-wait disabled:text-gray-4"
                  >
                    {connecting ? <Loader2 size={15} className="animate-spin" /> : <TeamsIcon className="h-[16px] w-[16px]" />}
                    {connecting ? "Connecting…" : "Connect Microsoft account"}
                  </button>
                </>
              )}
            </div>

            <p className="mt-4 text-center text-[12px] leading-[1.5] text-gray-4">
              Preview only — live Teams deployment is coming soon.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
