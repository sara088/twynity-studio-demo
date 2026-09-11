"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Mic } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PillButton } from "@/features/shared/components/PillButton";
import { RECORD_TIME_SCALE, VOICE_SCRIPT, VOICE_SECS } from "./twynVideoContent";

// Voice capture — the same popup pattern as the twyn-video recorder, but audio:
// a dark "listening" panel with a mic + level bars instead of a camera self-view,
// the read-aloud script, and one timed phase (~15s). Finish → onDone.
const TICK_MS = Math.max(30, Math.round(1000 / RECORD_TIME_SCALE));

export function VoiceRecordDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}) {
  const [recStarted, setRecStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (open) {
      setRecStarted(false);
      setElapsed(0);
      setError(null);
    }
  }, [open]);

  // Mic — held while the dialog is open (permission + a real "recording" feel).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = s;
      })
      .catch(() => setError("Microphone unavailable. Try “Upload” instead."));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  const finish = () => {
    onOpenChange(false);
    setTimeout(onDone, 0);
  };

  useEffect(() => {
    if (!open || !recStarted) return;
    if (elapsed >= VOICE_SECS) {
      finish();
      return;
    }
    const t = setTimeout(() => setElapsed((e) => e + 1), TICK_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recStarted, elapsed]);

  const remaining = VOICE_SECS - elapsed;
  const pct = (elapsed / VOICE_SECS) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto overflow-x-hidden rounded-card p-5 sm:max-w-[620px] sm:p-7">
        <DialogTitle className="font-heading text-[19px] font-semibold tracking-[-0.3px] text-dark sm:text-[21px]">
          Record your voice
        </DialogTitle>
        <DialogDescription className="mt-1 text-[13px] leading-[1.5] text-gray-3 sm:text-[13.5px]">
          Read the script below out loud, at a natural pace — about 15 seconds.
        </DialogDescription>

        {/* Listening panel (audio analog of the camera self-view). */}
        <div className="relative mt-5 grid h-[180px] w-full shrink-0 place-items-center overflow-hidden rounded-input bg-dark">
          {error ? (
            <div className="px-6 text-center text-[14px] text-white/70">{error}</div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4 text-white/80">
                <Mic size={26} className={recStarted ? "text-violet" : "text-white/60"} />
                <div className="flex h-8 items-end gap-1.5" aria-hidden>
                  {[14, 26, 20, 32, 18, 28, 16, 24, 12].map((h, i) => (
                    <span
                      key={i}
                      className={recStarted ? "w-[3px] rounded-full bg-violet animate-status-pulse" : "w-[3px] rounded-full bg-white/30"}
                      style={{ height: `${h}px`, animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              </div>
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-dark/70 px-3.5 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur">
                {recStarted ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-error animate-status-pulse" /> Recording
                  </>
                ) : (
                  <>
                    <Mic size={14} /> Read aloud
                  </>
                )}
              </div>
              {recStarted && (
                <div className="absolute inset-x-0 bottom-0 h-[5px] bg-white/15">
                  <div className="h-full bg-violet ease-linear" style={{ width: `${pct}%`, transition: `width ${TICK_MS}ms linear` }} />
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-4 rounded-input border border-border bg-bg-input/50 px-4 py-3.5">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-5">Read aloud</div>
          <p className="mt-1.5 text-[14px] italic leading-[1.6] text-gray-2">{VOICE_SCRIPT}</p>
        </div>

        {!recStarted ? (
          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <PillButton type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </PillButton>
            <PillButton
              type="button"
              variant="primary"
              size="sm"
              disabled={!!error}
              onClick={() => {
                setRecStarted(true);
                setElapsed(0);
              }}
            >
              <Mic size={16} /> Start recording
            </PillButton>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet">Voice</div>
              <div className="mt-1.5 font-heading text-[16px] font-semibold tracking-[-0.3px] text-dark sm:text-[17px]">
                Read the script naturally
              </div>
              <p className="mt-1 text-[13px] leading-[1.45] text-gray-4">Keep an even pace and volume — almost done.</p>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
              <div className="text-left sm:text-right">
                <div className="font-sans text-[28px] font-extrabold leading-none tabular-nums tracking-[-1px] text-dark sm:text-[30px]">
                  0:{String(remaining).padStart(2, "0")}
                </div>
                <div className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-5">Remaining</div>
              </div>
              <PillButton type="button" variant="primary" size="sm" onClick={finish}>
                <Check size={16} /> Finish
              </PillButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
