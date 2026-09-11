"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type TourStep = {
  title: string;
  body: string;
  cta: string;
  /** CSS selector to spotlight. Omit for a centered (welcome) step. */
  target?: string;
  placement: "left" | "top" | "bottom" | "center";
  /** Auto beat — no primary button; it advances on an external signal (e.g. a
   *  workflow run reaching its approval gate / finishing). Skip still shows. */
  auto?: boolean;
  /** Off the count — narration beats (the workflow run) that shouldn't read as
   *  numbered "Step X of Y" wizard steps. */
  hideCount?: boolean;
};

const TIP_W = 372;
const TIP_H = 180; // estimate for clamping

export function TalkTour({
  step,
  index,
  total,
  countLabel,
  onSkip,
  onPrimary,
  onDismiss,
}: {
  step: TourStep;
  index: number;
  total: number;
  /** Pre-formatted "Step 2 of 4", or "" to hide the counter (narration beats). */
  countLabel: string;
  onSkip: () => void;
  onPrimary: () => void;
  onDismiss: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => setMounted(true), []);

  // Keep the spotlight glued to the target through panel animations / resizes.
  useEffect(() => {
    if (!step.target) return;
    const measure = () => {
      const el = document.querySelector(step.target!);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect((prev) =>
        prev &&
        prev.top === r.top &&
        prev.left === r.left &&
        prev.width === r.width &&
        prev.height === r.height
          ? prev
          : r
      );
    };
    measure();
    const id = window.setInterval(measure, 100);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step.target]);

  // ESC dismisses the tour entirely.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  if (!mounted) return null;
  const centered = !step.target;
  if (!centered && !rect) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max);

  let tipStyle: CSSProperties = { width: TIP_W };
  if (!centered && rect) {
    let tipLeft: number;
    let tipTop: number;
    if (step.placement === "top") {
      tipLeft = clamp(rect.left, 16, vw - TIP_W - 16);
      tipTop = clamp(rect.top - TIP_H - 18, 16, vh - TIP_H - 16);
    } else if (step.placement === "bottom") {
      // below the target, right-aligned to it (the workshop icon sits top-right)
      tipLeft = clamp(rect.right - TIP_W, 16, vw - TIP_W - 16);
      tipTop = clamp(rect.bottom + 14, 16, vh - TIP_H - 16);
    } else {
      tipLeft = rect.left - TIP_W - 18;
      if (tipLeft < 16) {
        tipLeft = clamp(rect.left, 16, vw - TIP_W - 16);
        tipTop = clamp(rect.bottom + 16, 16, vh - TIP_H - 16);
      } else {
        tipTop = clamp(rect.top - 8, 16, vh - TIP_H - 16);
      }
    }
    tipStyle = { left: tipLeft, top: tipTop, width: TIP_W };
  }

  const skipLabel =
    index === 0 ? "Skip tour" : index + 1 === total ? "Skip" : "Skip step";

  const cardInner = (
    <>
      <h3 className="font-heading text-[16px] font-semibold tracking-[-0.3px] text-dark">
        {step.title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-[1.55] text-gray-2">{step.body}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="shrink-0 whitespace-nowrap font-heading text-[10px] font-bold uppercase tracking-[0.12em] text-gray-5">
          {countLabel}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onSkip}
            className="shrink-0 whitespace-nowrap rounded-btn px-3 py-2 text-[12.5px] font-semibold text-gray-4 transition-colors hover:text-dark"
          >
            {skipLabel}
          </button>
          {step.auto ? (
            // No primary — the run itself advances this beat. A soft "live" cue.
            <span className="flex shrink-0 items-center gap-1.5 rounded-btn px-3 py-2 text-[12px] font-bold text-violet">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-violet" />
              {step.cta}
            </span>
          ) : (
            <button
              type="button"
              onClick={onPrimary}
              className="shrink-0 whitespace-nowrap rounded-btn bg-violet px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-violet-h"
            >
              {step.cta}
            </button>
          )}
        </div>
      </div>
    </>
  );

  const cardClasses =
    "rounded-card border border-border bg-white p-5 shadow-[0_24px_60px_rgba(15,15,30,0.22)] animate-in fade-in-0 zoom-in-95 duration-200";

  return createPortal(
    <>
      {/* backdrop — dim in centered mode; the spotlight provides the dim otherwise */}
      <div
        className={cn(
          "fixed inset-0 z-[90]",
          centered && "bg-dark/55 animate-in fade-in-0 duration-300"
        )}
        onClick={onDismiss}
        aria-hidden
      />

      {!centered && rect && (
        <div
          className="tour-spot"
          style={{
            left: rect.left - 6,
            top: rect.top - 6,
            width: rect.width + 12,
            height: rect.height + 12,
          }}
          aria-hidden
        />
      )}

      {centered ? (
        <div className="fixed inset-0 z-[92] flex items-center justify-center p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={step.title}
            onClick={(e) => e.stopPropagation()}
            className={cn("w-[420px] max-w-full", cardClasses)}
          >
            {cardInner}
          </div>
        </div>
      ) : (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={step.title}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "fixed z-[92] transition-[left,top] duration-[220ms] ease-soft",
            cardClasses
          )}
          style={tipStyle}
        >
          {cardInner}
        </div>
      )}
    </>,
    document.body
  );
}
