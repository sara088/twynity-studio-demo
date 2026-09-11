"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Prototype state switcher (dev/PO only) ──────────────────────────────────
// A prototype can't naturally reach every state — an out-of-credits account, an
// avatar mid-training, a failed capture, an expired trial. Those states are
// driven by URL params (?tier= / ?avatar= / ?limit= / ?tour=), which is fiddly to
// demo by hand. This floating panel exposes them as toggles: pick the states you
// want and Apply, and the studio reloads into them. It is NOT product UI — it's a
// demo aid, styled deliberately apart so no one mistakes it for a feature.

type TierOpt = "free" | "basic";
// Basic avatar training states.
type AvatarOpt = "ready" | "processing" | "failed";
// Free-tier avatar source: an uploaded video (static → "Make it move") vs a
// picked stock replica (moving → "Make it your own").
type FaceOpt = "own" | "stock";
// The account can be blocked two ways — spent credits, or an expired free trial.
type AccessOpt = "ok" | "credits" | "subscription";
type TourOpt = "on" | "off";

const OPEN_KEY = "twynity_dev_open";

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  stack = false,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; disabled?: boolean }[];
  onChange: (v: T) => void;
  /** Put the control on its own full-width row below the label (for 3+ longer
      options that won't fit inline). */
  stack?: boolean;
}) {
  const buttons = (
    <div className={cn("flex rounded-[8px] bg-white/[0.06] p-0.5", stack ? "w-full" : "inline-flex")}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={o.disabled}
          onClick={() => !o.disabled && onChange(o.value)}
          title={o.disabled ? "Not available on this tier" : undefined}
          className={cn(
            "rounded-[6px] px-2.5 py-1 text-[11.5px] font-semibold transition-colors",
            stack && "flex-1",
            o.disabled
              ? "cursor-not-allowed text-white/20"
              : value === o.value
                ? "bg-violet text-white"
                : "text-white/55 hover:text-white"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  if (stack) {
    return (
      <div className="space-y-1.5">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45">
          {label}
        </span>
        {buttons}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45">
        {label}
      </span>
      {buttons}
    </div>
  );
}

export function DevStatePanel() {
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState<TierOpt>("free");
  const [avatar, setAvatar] = useState<AvatarOpt>("ready");
  const [face, setFace] = useState<FaceOpt>("stock");
  const [access, setAccess] = useState<AccessOpt>("ok");
  const [tour, setTour] = useState<TourOpt>("on");

  // Reflect the live URL state on mount, and restore the panel's open/closed
  // preference so it stays put across the reloads that Apply triggers.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("tier");
    const isBasic = t === "basic" || t === "paid";
    setTier(isBasic ? "basic" : "free");
    const a = sp.get("avatar");
    setAvatar(
      a === "processing"
        ? "processing"
        : a === "failed"
          ? "failed"
          : a === "ready"
            ? "ready"
            : isBasic
              ? "processing" // Basic with no explicit avatar defaults to building
              : "ready"
    );
    setFace(sp.get("face") === "own" ? "own" : "stock");
    const lim = sp.get("limit");
    setAccess(
      lim === "subscription" || lim === "trial"
        ? "subscription"
        : lim === "credits" || sp.get("credits") === "out"
          ? "credits"
          : "ok"
    );
    setTour(sp.get("tour") === "off" ? "off" : "on");
    setOpen(localStorage.getItem(OPEN_KEY) === "1");
  }, []);

  // Switching tier resets the avatar to that tier's natural default — Basic
  // starts on a just-built avatar that's still training; Free has a ready static
  // one. Subscription-over is valid on any tier (trial ends, or a paid plan
  // lapses), so it's left as-is.
  const onTierChange = (v: TierOpt) => {
    setTier(v);
    setAvatar(v === "basic" ? "processing" : "ready");
  };

  const toggleOpen = () => {
    setOpen((o) => {
      const next = !o;
      try {
        localStorage.setItem(OPEN_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // Build the target URL from the selected states and reload into it. tier and
  // avatar are set explicitly (they win over stored/derived state), so the view
  // is deterministic.
  const apply = () => {
    const url = new URL(window.location.href);
    const p = url.searchParams;
    p.set("tier", tier); // "free" | "basic"
    // Basic uses training states (?avatar=); Free uses the avatar source (?face=).
    if (tier === "basic") {
      p.set("avatar", avatar); // "ready" | "processing" | "failed"
      p.delete("face");
    } else {
      p.set("face", face); // "own" | "stock"
      p.delete("avatar");
    }
    p.delete("credits"); // drop the legacy alias — `limit` is canonical now
    if (access === "ok") p.delete("limit");
    else p.set("limit", access); // "credits" | "subscription"
    if (tour === "off") p.set("tour", "off");
    else p.delete("tour");
    window.location.assign(`${url.pathname}?${p.toString()}`);
  };

  // Clean slate — default free trial, ready avatar, no blocks, tour on.
  const reset = () => window.location.assign(`${window.location.pathname}?tier=free`);

  return (
    <div className="fixed bottom-4 left-4 z-[120] print:hidden">
      {open ? (
        <div className="w-[264px] overflow-hidden rounded-[14px] border border-white/10 bg-dark text-white shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5">
            <span className="inline-flex items-center gap-1.5">
              <SlidersHorizontal size={13} className="text-violet" />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/80">
                Prototype states
              </span>
            </span>
            <button
              type="button"
              onClick={toggleOpen}
              aria-label="Collapse dev panel"
              className="grid h-6 w-6 place-items-center rounded-[6px] text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X size={13} />
            </button>
          </div>

          <div className="space-y-3 px-3.5 py-3.5">
            <Segmented
              label="Tier"
              value={tier}
              onChange={onTierChange}
              options={[
                { value: "free", label: "Free" },
                { value: "basic", label: "Basic" },
              ]}
            />
            {tier === "basic" ? (
              <Segmented
                label="Avatar"
                value={avatar}
                onChange={setAvatar}
                options={[
                  { value: "processing", label: "Building" },
                  { value: "ready", label: "Ready" },
                  { value: "failed", label: "Failed" },
                ]}
              />
            ) : (
              // Free tier has no training — just the source, which flips the pill
              // ("Make it move" for an upload vs "Make it your own" for stock).
              <Segmented
                label="Avatar"
                value={face}
                onChange={setFace}
                options={[
                  { value: "own", label: "Uploaded" },
                  { value: "stock", label: "Stock" },
                ]}
              />
            )}
            <Segmented
              label="Access"
              value={access}
              stack
              onChange={setAccess}
              options={[
                { value: "ok", label: "OK" },
                { value: "credits", label: "No credits" },
                // Subscription over — backend models a trial as a subscription.
                // On the free tier this reads as the trial ending; on a paid tier
                // as the plan lapsing (the notice adapts).
                { value: "subscription", label: "Subscription over" },
              ]}
            />
            <Segmented
              label="Tour"
              value={tour}
              onChange={setTour}
              options={[
                { value: "on", label: "On" },
                { value: "off", label: "Off" },
              ]}
            />
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 px-3.5 py-3">
            <button
              type="button"
              onClick={apply}
              className="flex-1 rounded-[8px] bg-violet px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-violet-h"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={reset}
              title="Reset to default (free trial)"
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/15 px-3 py-2 text-[12px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={toggleOpen}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-dark px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/80 shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-colors hover:text-white"
        >
          <SlidersHorizontal size={13} className="text-violet" /> States
        </button>
      )}
    </div>
  );
}
