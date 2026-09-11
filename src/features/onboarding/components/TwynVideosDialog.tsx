"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, Copy, Upload, User, Video } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PillButton } from "@/features/shared/components/PillButton";
import { cn } from "@/lib/utils";
import { CONSENT_SCRIPT, RECORDING_RULES, RECORD_TIME_SCALE, SAMPLE_TRAINING_SRC, TRAINING_SCRIPT } from "./twynVideoContent";

// Demo: advance the countdown faster than real time (still shows real seconds).
const TICK_MS = Math.max(30, Math.round(1000 / RECORD_TIME_SCALE));

// The onboarding "Twyn videos" popup: everything for the two clips lives here.
//   Overview  — rules · consent script · sample, plus a slot per clip (upload or record)
//   Recording — a guided, back-to-back capture:
//       consent  — read the consent script (~20s)
//       training — 2 min: read the training script (1 min), then still & silent (1 min)
//   Same self-view + timer for every phase; finish drops back to the overview.

export type VideoKind = "consent" | "training";

// Each phase can carry its own on-camera script.
type PhaseSpec = { label: string; hint: string; secs: number; script?: string };
const SPECS: Record<VideoKind, { title: string; phases: PhaseSpec[] }> = {
  consent: {
    title: "Consent clip",
    phases: [{ label: "Read the consent script aloud", hint: "Speak clearly and look at the camera.", secs: 20, script: CONSENT_SCRIPT }],
  },
  training: {
    title: "Training video",
    phases: [
      { label: "Read the training script aloud", hint: "Read at a natural pace — vary your tone and expressions.", secs: 60, script: TRAINING_SCRIPT },
      { label: "Hold still and stay silent", hint: "Lips gently closed, look at the camera — like listening on a call.", secs: 60 },
    ],
  },
};
const LABEL: Record<VideoKind, string> = { consent: "Consent clip", training: "Training video" };

export function TwynVideosDialog({
  open,
  onOpenChange,
  consentDone,
  trainingDone,
  trainingPoster,
  onCaptured,
  onUpload,
  onRemove,
  onContinue,
  continueLabel = "Continue",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consentDone: boolean;
  trainingDone: boolean;
  trainingPoster?: string | null;
  onCaptured: (kind: VideoKind, poster?: string) => void;
  onUpload: (kind: VideoKind, file: File) => void;
  onRemove: (kind: VideoKind) => void;
  /** When set (e.g. the in-studio upgrade), the overview's primary button
      advances the flow once both clips are ready instead of just closing. */
  onContinue?: () => void;
  continueLabel?: string;
}) {
  const [mode, setMode] = useState<"overview" | "rec">("overview");
  const [queue, setQueue] = useState<VideoKind[]>([]);
  const [qi, setQi] = useState(0);
  const [pi, setPi] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [recStarted, setRecStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Always open onto the overview.
  useEffect(() => {
    if (open) setMode("overview");
  }, [open]);

  // Camera: live only while recording.
  useEffect(() => {
    if (!open || mode !== "rec") return;
    let cancelled = false;
    setError(null);
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
      .catch(() => setError("Camera unavailable. Try “Upload video” instead."));
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open, mode]);

  const startRecording = (clicked: VideoKind) => {
    // Each slot records only its own clip — you're recording one video here,
    // not a back-to-back queue.
    setQueue([clicked]);
    setQi(0);
    setPi(0);
    setElapsed(0);
    setRecStarted(false);
    setMode("rec");
  };

  const kind: VideoKind = queue[qi] ?? "consent";
  const spec = SPECS[kind];
  const phase = spec.phases[pi];

  const grabPoster = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return "";
    const scale = Math.min(1, 480 / v.videoWidth);
    const w = Math.round(v.videoWidth * scale);
    const h = Math.round(v.videoHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(v, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.85);
  }, []);

  const endKind = useCallback(() => {
    onCaptured(kind, kind === "training" ? grabPoster() : undefined);
    if (qi < queue.length - 1) {
      setQi(qi + 1);
      setPi(0);
      setElapsed(0);
      setRecStarted(false); // hand-off screen for the next clip
    } else {
      setMode("overview");
    }
  }, [kind, grabPoster, onCaptured, qi, queue.length]);

  // Phase countdown.
  useEffect(() => {
    if (!open || mode !== "rec" || !recStarted) return;
    if (elapsed >= phase.secs) {
      if (pi < spec.phases.length - 1) {
        setPi((p) => p + 1);
        setElapsed(0);
      } else {
        endKind();
      }
      return;
    }
    const t = setTimeout(() => setElapsed((e) => e + 1), TICK_MS);
    return () => clearTimeout(t);
  }, [open, mode, recStarted, elapsed, pi, phase.secs, spec.phases.length, endKind]);

  const remaining = phase.secs - elapsed;
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = (elapsed / phase.secs) * 100;
  const isLastPhase = pi === spec.phases.length - 1;
  const stepNo = qi + 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto overflow-x-hidden rounded-card p-5 sm:max-w-[900px] sm:p-7">
        {mode === "overview" ? (
          <>
            <DialogTitle className="font-heading text-[19px] font-semibold tracking-[-0.3px] text-dark sm:text-[21px]">
              Twyn videos
            </DialogTitle>
            <DialogDescription className="mt-1 text-[13px] leading-[1.5] text-gray-3 sm:text-[13.5px]">
              Record a short consent clip and a guided training video — or upload each one.
            </DialogDescription>

            {/* General recording & upload info — always visible. */}
            <div className="mt-5 rounded-input border border-border bg-bg-input/40 px-4 py-3.5">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-5">Recording &amp; upload tips</div>
              <ul className="mt-2 space-y-2">
                {RECORDING_RULES.map((r) => (
                  <li key={r} className="flex gap-2.5 text-[13px] leading-[1.5] text-gray-3">
                    <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-violet" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Each clip's info sits with its slot and stays visible (the upload
                path needs it); the script also shows in the recording pop-up. */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch">
              <VideoSlot
                label="Consent video"
                done={consentDone}
                onRecord={() => startRecording("consent")}
                onUpload={(f) => onUpload("consent", f)}
                onRemove={() => onRemove("consent")}
                intro={
                  <div className="flex h-full min-h-[150px] flex-col rounded-input border border-border bg-bg-input/50 px-4 py-3.5">
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-5">Read on camera</div>
                    <p className="mt-1.5 text-[13px] italic leading-[1.55] text-gray-2">{CONSENT_SCRIPT}</p>
                    <CopyScript />
                  </div>
                }
              />
              <VideoSlot
                label="Training video (~2 min)"
                done={trainingDone}
                poster={trainingPoster}
                onRecord={() => startRecording("training")}
                onUpload={(f) => onUpload("training", f)}
                onRemove={() => onRemove("training")}
                intro={
                  <div className="flex h-full min-h-[150px] flex-col rounded-input border border-border bg-bg-input/50 px-4 py-3.5">
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-5">What to record</div>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-gray-3">
                      Two parts, about a minute each: first read the training script aloud (vary your tone and
                      expression), then hold still and stay silent, like listening on a call. The full script and a
                      sample video appear when you record.
                    </p>
                  </div>
                }
              />
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
              <span className="text-[13px] font-medium text-gray-4">
                {consentDone && trainingDone
                  ? "Both videos ready."
                  : `${(consentDone ? 1 : 0) + (trainingDone ? 1 : 0)} of 2 added`}
              </span>
              {onContinue ? (
                <PillButton
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={!(consentDone && trainingDone)}
                  onClick={onContinue}
                >
                  {continueLabel}
                </PillButton>
              ) : (
                <PillButton type="button" variant="primary" size="sm" onClick={() => onOpenChange(false)}>
                  Done
                </PillButton>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="font-heading text-[19px] font-semibold tracking-[-0.3px] text-dark sm:text-[21px]">
              {queue.length > 1 ? `Record your videos · ${stepNo} of ${queue.length}` : `Record your ${LABEL[kind].toLowerCase()}`}
            </DialogTitle>
            <DialogDescription className="mt-1 text-[13px] leading-[1.5] text-gray-3 sm:text-[13.5px]">
              {kind === "consent"
                ? "Read the consent script below, out loud, looking at the camera."
                : "2 minutes total — read the training script for 1 minute, then hold still and stay silent for 1 minute."}
            </DialogDescription>

            {/* Self-view — video is absolutely positioned so the aspect box owns
                the height (an in-flow h-full video overflows the grid layout). */}
            <div className="relative mt-5 w-full shrink-0 self-start overflow-hidden rounded-input bg-dark" style={{ aspectRatio: "16 / 9" }}>
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[14px] text-white/70">{error}</div>
              ) : (
                <>
                  <video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-dark/70 px-3.5 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur">
                    {recStarted ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-error animate-status-pulse" />
                        {phase.label}
                      </>
                    ) : (
                      <>
                        <User size={14} /> Center your head &amp; shoulders
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

            {(() => {
              // Before starting, show the first phase's script; while recording,
              // show the current phase's script (the silent phase has none).
              const script = recStarted ? phase.script : spec.phases[0].script;
              if (!script) return null;
              return (
                <div className="mt-4 rounded-input border border-border bg-bg-input/50 px-4 py-3.5">
                  <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-5">Read on camera</div>
                  <p className="mt-1.5 text-[14px] italic leading-[1.6] text-gray-2">{script}</p>
                </div>
              );
            })()}

            {!recStarted ? (
              <>
                {qi > 0 && (
                  <div className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-mint px-3 py-1.5 text-[12.5px] font-semibold text-mint-text">
                    <Check size={14} /> {LABEL[queue[qi - 1]]} recorded · next up: {LABEL[kind].toLowerCase()}
                  </div>
                )}
                {kind === "training" && (
                  <Disclosure title="Watch a sample first" className="mt-4">
                    <div className="relative w-full overflow-hidden rounded-input border border-border bg-dark" style={{ aspectRatio: "16 / 9" }}>
                      <video src={SAMPLE_TRAINING_SRC} controls playsInline className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                  </Disclosure>
                )}
                <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                  <PillButton type="button" variant="outline" size="sm" onClick={() => setMode("overview")}>
                    Back
                  </PillButton>
                  <PillButton
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!!error}
                    onClick={() => {
                      setRecStarted(true);
                      setPi(0);
                      setElapsed(0);
                    }}
                  >
                    <Video size={16} /> {qi > 0 ? `Record ${LABEL[kind].toLowerCase()}` : "Start recording"}
                  </PillButton>
                </div>
              </>
            ) : (
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet">
                    {LABEL[kind]}
                    {spec.phases.length > 1 ? ` · step ${pi + 1} of ${spec.phases.length}` : ""}
                  </div>
                  <div className="mt-1.5 font-heading text-[16px] font-semibold tracking-[-0.3px] text-dark sm:text-[17px]">{phase.label}</div>
                  <p className="mt-1 text-[13px] leading-[1.45] text-gray-4">{phase.hint}</p>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <div className="font-sans text-[28px] font-extrabold leading-none tabular-nums tracking-[-1px] text-dark sm:text-[30px]">
                      {mm}:{ss}
                    </div>
                    <div className="mt-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-gray-5">Remaining</div>
                  </div>
                  {isLastPhase ? (
                    <PillButton type="button" variant="primary" size="sm" onClick={endKind}>
                      <Check size={16} /> {qi < queue.length - 1 ? "Done · next" : "Finish"}
                    </PillButton>
                  ) : (
                    <PillButton type="button" variant="outline" size="sm" onClick={() => setMode("overview")}>
                      Cancel
                    </PillButton>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CopyScript() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(CONSENT_SCRIPT.replace(/[“”]/g, "")).then(
          () => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          },
          () => {},
        );
      }}
      className="mt-3 inline-flex items-center gap-1.5 self-start text-[12.5px] font-semibold text-violet transition-colors hover:text-violet-h"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy script"}
    </button>
  );
}

function VideoSlot({
  label,
  done,
  poster,
  intro,
  onRecord,
  onUpload,
  onRemove,
}: {
  label: string;
  done: boolean;
  poster?: string | null;
  intro?: React.ReactNode;
  onRecord: () => void;
  onUpload: (f: File) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-gray-5">{label}</div>
      {intro && <div className="mb-2.5 flex-1">{intro}</div>}
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/webm,video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f && f.type.startsWith("video/")) onUpload(f);
        }}
        className={cn(
          "relative min-h-[172px] overflow-hidden rounded-input border-[1.5px] transition-colors",
          done
            ? "border-mint-text/40 bg-mint/20"
            : dragOver
              ? "border-dashed border-violet bg-violet-light"
              : "border-dashed border-border bg-bg-input/40",
        )}
      >
        {done && poster ? (
          // Recorded/uploaded clip: the frame fills the whole box like a thumbnail.
          <>
            <Image src={poster} alt="" fill unoptimized className="object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/45 to-transparent" />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-[12px] font-bold text-mint-text shadow-sm">
              <Check size={13} strokeWidth={2.5} /> Ready
            </span>
          </>
        ) : done ? (
          // Consent clip has no poster frame — a clean confirmation instead.
          <div className="grid min-h-[172px] place-items-center">
            <div className="flex flex-col items-center gap-2">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-mint text-mint-text">
                <Check size={22} strokeWidth={2.5} />
              </span>
              <span className="text-[13.5px] font-bold text-dark">Ready</span>
            </div>
          </div>
        ) : (
          <div className="grid min-h-[172px] place-items-center px-5 py-8 text-center">
            <div className="flex flex-col items-center gap-1">
              <Upload size={22} className="mb-1 text-gray-4" strokeWidth={1.75} />
              <span className="text-[14px] font-bold text-dark">Add a video</span>
              <span className="text-[12.5px] text-gray-4">Drop a video here, upload from device, or record now.</span>
              <span className="text-[11.5px] text-gray-5">MP4 or WebM – max 750 MB</span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <PillButton type="button" variant="primary" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload size={15} /> {done ? "Replace" : "Upload video"}
        </PillButton>
        <PillButton type="button" variant="outline" size="sm" onClick={onRecord}>
          <Video size={15} /> {done ? "Re-record" : "Record video"}
        </PillButton>
        {done && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto text-[13px] font-semibold text-gray-4 transition-colors hover:text-error"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function Disclosure({
  title,
  defaultOpen = false,
  className,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("overflow-hidden rounded-input border border-border", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 bg-bg-input/40 px-4 py-3 text-left text-[13.5px] font-bold text-dark transition-colors hover:bg-bg-input/70"
      >
        {title}
        <ChevronDown size={17} className={cn("shrink-0 text-gray-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-4 py-3.5">{children}</div>}
    </div>
  );
}
