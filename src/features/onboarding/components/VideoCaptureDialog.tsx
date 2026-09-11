"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { Video, Check, User, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Good / poor framing examples. `src` is null until real reference photos are
// dropped in (e.g. /assets/framing-good.jpg) — the slot is left ready for them.
const EXAMPLES = [
  { label: "Good", good: true, src: null as string | null },
  { label: "Too far", good: false, src: null as string | null },
  { label: "Too close", good: false, src: null as string | null },
];

// Guided 1-minute video capture for the avatar (Tavus-style, condensed to one
// step): a big, clear self-view with a head-&-shoulders framing guide + good/bad
// examples so people frame themselves well, then 30s talking + 30s silent.
const TALK_SECONDS = 30;
const SILENCE_SECONDS = 30;

type Phase = "intro" | "talk" | "silence";

export function VideoCaptureDialog({
  open,
  onOpenChange,
  onCapture,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (posterDataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    setPhase("intro");
    setElapsed(0);

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user", width: 1280 }, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => setError("Camera unavailable. Try “upload a video” instead."));

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  const finish = useCallback(() => {
    // Grab a small poster frame while the video is still mounted. Downscale to
    // keep it light (a full-res PNG data URL is multiple MB).
    const v = videoRef.current;
    let poster = "";
    if (v && v.videoWidth) {
      const scale = Math.min(1, 480 / v.videoWidth);
      const w = Math.round(v.videoWidth * scale);
      const h = Math.round(v.videoHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(v, 0, 0, w, h);
        poster = canvas.toDataURL("image/jpeg", 0.85);
      }
    }
    // Close first, then apply on the next tick — applying a heavy parent update
    // in the same tick the dialog tears down can leave the page unclickable.
    onOpenChange(false);
    setTimeout(() => onCapture(poster), 0);
  }, [onCapture, onOpenChange]);

  // Phase countdown: talk (30s) → silence (30s) → finish.
  useEffect(() => {
    if (phase === "intro") return;
    const limit = phase === "talk" ? TALK_SECONDS : SILENCE_SECONDS;
    if (elapsed >= limit) {
      if (phase === "talk") {
        setPhase("silence");
        setElapsed(0);
      } else {
        finish();
      }
      return;
    }
    const t = setTimeout(() => setElapsed((e) => e + 1), 1000);
    return () => clearTimeout(t);
  }, [phase, elapsed, finish]);

  const recording = phase !== "intro";
  const limit = phase === "talk" ? TALK_SECONDS : SILENCE_SECONDS;
  const remaining = limit - elapsed;
  const pct = recording ? (elapsed / limit) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto overflow-x-hidden rounded-card p-5 sm:max-w-[900px] sm:p-7">
        <DialogTitle className="font-heading text-[19px] tracking-[-0.3px] text-dark sm:text-[21px] font-semibold">
          Record your video
        </DialogTitle>
        <DialogDescription className="mt-2 max-w-[600px] text-[13px] leading-[1.5] text-gray-3 sm:text-[13.5px] sm:leading-[1.55]">
          Sit so your head and shoulders fill the frame, look straight at the camera in good light.
          <span className="mt-1 block">
            One minute total — 30 seconds talking, then 30 seconds still and silent.
          </span>
        </DialogDescription>

        {/* Big self-view — the point is to see yourself clearly. */}
        <div className="relative mt-6 overflow-hidden rounded-input bg-dark" style={{ aspectRatio: "16 / 9" }}>
          {error ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-[14px] text-white/70">
              {error}
            </div>
          ) : (
            <>
              <video ref={videoRef} muted playsInline className="h-full w-full -scale-x-100 object-cover" />
              {/* Status / phase pill */}
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-dark/70 px-3.5 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur">
                {recording ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-error animate-status-pulse" />
                    {phase === "talk" ? "Talking" : "Stay still & silent"}
                  </>
                ) : (
                  <>
                    <User size={14} /> Center your head &amp; shoulders
                  </>
                )}
              </div>
              {/* Recording progress along the bottom edge */}
              {recording && (
                <div className="absolute inset-x-0 bottom-0 h-[5px] bg-white/15">
                  <div
                    className="h-full bg-violet transition-[width] duration-1000 ease-linear"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {!recording ? (
          <>
            {/* Example framing — teach good vs poor without a wall of checks.
                (Only shown before recording; it's hidden once you start.) */}
            <div className="mt-6 rounded-input border border-border bg-bg-input/40 px-4 py-3.5">
              <div className="mb-2.5 text-center text-[12px] text-gray-4">
                <span className="font-bold uppercase tracking-[0.12em] text-gray-5">Example framing</span>
                <span className="mx-1.5 text-gray-5" aria-hidden>·</span>
                Aim for <span className="font-semibold text-dark">Good</span> — centered, not too far
                or too close.
              </div>
              <div className="mx-auto grid grid-cols-3 gap-2 sm:max-w-[470px] sm:gap-2.5">
                {EXAMPLES.map((e) => (
                  <ExampleFrame key={e.label} label={e.label} good={e.good} src={e.src} />
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-11 items-center justify-center rounded-btn border border-border bg-white px-5 text-[13.5px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhase("talk");
                  setElapsed(0);
                }}
                disabled={!!error}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-violet px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-violet-h disabled:opacity-40"
              >
                <Video size={16} /> Start recording
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet">
                Step {phase === "talk" ? "1" : "2"} of 2
              </div>
              <div className="mt-1.5 font-heading text-[16px] font-semibold tracking-[-0.3px] text-dark sm:text-[17px]">
                {phase === "talk" ? "Talk naturally — introduce yourself" : "Hold still and stay silent"}
              </div>
              <p className="mt-1 text-[13px] leading-[1.45] text-gray-4">
                {phase === "talk"
                  ? "Your name, what you do, anything — just keep talking."
                  : "Look at the camera. Almost done."}
              </p>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
              <div className="text-left sm:text-right">
                <div className="font-sans text-[28px] font-extrabold leading-none tabular-nums tracking-[-1px] text-dark sm:text-[30px]">
                  0:{String(remaining).padStart(2, "0")}
                </div>
                <div className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-5">
                  Remaining
                </div>
              </div>
              {phase === "silence" ? (
                <button
                  type="button"
                  onClick={finish}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-btn bg-violet px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-violet-h"
                >
                  <Check size={16} /> Finish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex h-11 items-center justify-center rounded-btn border border-border bg-white px-5 text-[13.5px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// A framing example slot. Shows the reference photo once one is supplied; until
// then it's a clean labelled placeholder (room left for the real images).
function ExampleFrame({ label, good, src }: { label: string; good: boolean; src: string | null }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[10px] border border-border bg-bg-input">
      {src ? (
        <NextImage src={src} alt={`${label} framing example`} fill className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-gray-5">
          <ImageIcon size={20} strokeWidth={1.5} />
        </div>
      )}
      <span
        className={cn(
          // Flush into the top-left corner (matching the card radius) so it reads
          // as a corner label, not a floating chip over the empty preview.
          "absolute left-0 top-0 rounded-br-[8px] rounded-tl-[10px] px-2 py-[3px] text-[9.5px] font-bold uppercase tracking-[0.04em]",
          good ? "bg-mint text-mint-text" : "bg-error/15 text-error",
        )}
      >
        {label}
      </span>
    </div>
  );
}
