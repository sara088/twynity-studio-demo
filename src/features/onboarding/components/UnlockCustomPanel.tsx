"use client";

import { useEffect, useState } from "react";
import { Sparkles, Lock, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PillButton } from "@/features/shared/components/PillButton";
import { tierForPromo, type TierId } from "@/features/shared/lib/tier";

// Teaser opened from the "Want your avatar to move?" card in onboarding. We do
// NOT sell here — onboarding never charges. It shows what "move" looks like and
// where to get it (a one-tap, in-studio purchase after sign-up). The only thing
// that unlocks custom right now is a promo code, which comps instantly (no
// Stripe), so a comped user can record and have their avatar process on entry.
export function UnlockCustomPanel({
  open,
  onOpenChange,
  hasVideo = false,
  onPromo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A video has been captured/uploaded — that clip is what we make move. */
  hasVideo?: boolean;
  /** Valid promo entered — grant this tier immediately (comped). */
  onPromo: (tier: TierId) => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setCode("");
      setError(false);
    }
  }, [open]);

  const applyPromo = () => {
    if (!hasVideo) return;
    const tier = tierForPromo(code);
    if (!tier) {
      setError(true);
      return;
    }
    onPromo(tier);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-card p-6">
        {/* Title kept for screen readers; the copy carries it visually. */}
        <DialogTitle className="sr-only">Make your avatar move later</DialogTitle>

        {/* A properly-framed avatar preview (square) so the face is actually
            visible — a wide strip crops the head. */}
        <div className="mx-auto w-[146px] overflow-hidden rounded-[18px] bg-dark shadow-sm">
          <video
            src="/assets/sara_studio.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="aspect-square w-full object-cover object-center"
          />
        </div>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-4">
          <Sparkles size={11} strokeWidth={2.2} className="text-violet" /> Example — a moving avatar
        </p>

        {/* The one thing to take away: build free now, upgrade whenever. */}
        <DialogDescription className="mt-4 text-[14px] leading-[1.55] text-gray-2">
          <span className="font-semibold text-dark">Build free now — you can make your avatar move anytime.</span>{" "}
          It&apos;s a one-tap upgrade to <span className="font-semibold text-dark">Basic</span> from your studio, with
          no payment now. Your recording and voice stay exactly as they are.
        </DialogDescription>

        <ul className="mt-3.5 space-y-1.5">
          {["Avatar that moves & talks on screen", "Keeps your voice", "Everything in Free Trial"].map((f) => (
            <li key={f} className="flex items-center gap-2 text-[12.5px] text-gray-2">
              <Check size={14} strokeWidth={2.5} className="shrink-0 text-violet" /> {f}
            </li>
          ))}
        </ul>

        {/* Early access code — for chosen users; comps instantly (needs a clip). */}
        <div className="mt-4 border-t border-border pt-3.5">
          <label className="block text-[11.5px] font-bold uppercase tracking-[0.06em] text-gray-5">
            Have an early access code?
          </label>
          {!hasVideo && (
            <p className="mt-1 text-[12px] leading-[1.5] text-gray-4">
              Capture a short video first — that clip is what we make move.
            </p>
          )}
          <div className="mt-1.5 flex gap-2">
            <input
              value={code}
              disabled={!hasVideo}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && applyPromo()}
              placeholder="Enter access code"
              className={`h-11 min-w-0 flex-1 rounded-input border-[1.5px] bg-white px-3.5 text-[14px] uppercase tracking-[0.04em] text-dark outline-none transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-5 disabled:cursor-not-allowed disabled:bg-bg-input disabled:text-gray-5 ${
                error ? "border-error focus:border-error" : "border-border focus:border-violet"
              }`}
            />
            <PillButton
              type="button"
              variant="outline"
              size="sm"
              onClick={applyPromo}
              disabled={!hasVideo}
              className="shrink-0"
            >
              <Lock size={13} /> Apply
            </PillButton>
          </div>
          {error && <p className="mt-1.5 text-[12px] text-error">That access code isn&apos;t valid.</p>}
        </div>

        {/* Primary free path — no charge here; upgrade is one tap in the studio. */}
        <PillButton type="button" className="mt-5 w-full" onClick={() => onOpenChange(false)}>
          Keep building — free
        </PillButton>
      </DialogContent>
    </Dialog>
  );
}
