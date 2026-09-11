"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { Check, Mic, Pause, Play, Video } from "lucide-react";
import { Sparkles } from "lucide-react";
import { TwynVideosDialog, type VideoKind } from "./TwynVideosDialog";
import { VoiceRecordDialog } from "./VoiceRecordDialog";
import { PolicyLink } from "./PolicyLink";
import { UnlockCustomPanel } from "./UnlockCustomPanel";
import { PillButton } from "@/features/shared/components/PillButton";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TierId } from "@/features/shared/lib/tier";

// Tavus replica placeholders (still frames for now; likely videos later).
// Inclusive labels rather than Female/Male.
const AVATARS = {
  f: { label: "Feminine", image: "/assets/replica-female.png" },
  m: { label: "Masculine", image: "/assets/replica-male.png" },
} as const;

export type Choice = "own" | "f" | "m" | null;

// Step 1 — "add your own" is the encouraged path; a ready-made replica/voice is a
// quiet fallback. Each card's left side is a single preview slot that always
// reflects the current selection; the right side is the ready-made picker.
export function BuildStep({
  onContinue,
  photo,
  onPhotoChange,
  onFaceSourceChange = () => {},
  customUnlocked = false,
  onPromoUnlock = () => {},
  face,
  setFace,
  voice,
  setVoice,
  ownVoiceReady,
  setOwnVoiceReady,
  consentVideoDone,
  setConsentVideoDone,
  consented,
  setConsented,
  tierLabel,
  eyebrow,
  heading,
  intro,
  cta = "Create my twyn",
}: {
  onContinue: () => void;
  photo: string | null;
  onPhotoChange: (url: string | null) => void;
  /** "own" = user recorded their video (avatar will process); "ready" = ready-made (instant). */
  onFaceSourceChange?: (source: "own" | "ready" | null) => void;
  /** Custom avatar/voice available (paid tier, comped, or upgrade intent). */
  customUnlocked?: boolean;
  /** A valid promo code was entered — comp to this tier immediately. */
  onPromoUnlock?: (tier: TierId) => void;
  // Selections live in the parent so they survive back/forward navigation.
  face: Choice;
  setFace: Dispatch<SetStateAction<Choice>>;
  voice: Choice;
  setVoice: Dispatch<SetStateAction<Choice>>;
  ownVoiceReady: boolean;
  setOwnVoiceReady: Dispatch<SetStateAction<boolean>>;
  /** Whether the on-camera consent clip has been captured/uploaded. */
  consentVideoDone: boolean;
  setConsentVideoDone: Dispatch<SetStateAction<boolean>>;
  consented: boolean;
  setConsented: Dispatch<SetStateAction<boolean>>;
  /** Subtle "now on <tier>" pill once a paid tier is unlocked (promo/upgrade). */
  tierLabel?: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  cta?: string;
}) {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [previewing, setPreviewing] = useState<"f" | "m" | null>(null);
  const [unlockOpen, setUnlockOpen] = useState(false);

  const voiceFileRef = useRef<HTMLInputElement>(null);

  // Face is "own" once the TRAINING clip is captured (it supplies the avatar);
  // the own path is only complete once the CONSENT clip is captured too.
  const trainingDone = face === "own";
  const usingReady = face === "f" || face === "m";
  const ownFaceComplete = trainingDone && consentVideoDone;
  const faceReady = ownFaceComplete || usingReady;
  const usingOwn = trainingDone || voice === "own";
  const canContinue = faceReady && voice !== null && (!usingOwn || consented);

  // Copy shifts with the tier: a free trial picks stock and is nudged toward a
  // custom upgrade; an unlocked (paid/comped) flow leads with "record your own".
  const copy = customUnlocked
    ? {
        eyebrow: eyebrow ?? "Takes under 2 minutes",
        heading: heading ?? "Build your twyn.",
        intro:
          intro ??
          "Record a short video and your voice — we'll turn it into a lifelike talking avatar. Or start with a ready-made one.",
      }
    : {
        eyebrow: eyebrow ?? "Start your 15-day free trial",
        heading: heading ?? "Build your twyn.",
        intro:
          intro ??
          "Capture a short video and record your voice — free. Your twyn talks in your voice from day one; upgrade whenever you want your avatar to move and talk on screen.",
      };

  // Training clip supplies the avatar — its poster previews next to Sky.
  const applyOwnVideo = (url: string) => {
    setFace("own");
    onPhotoChange(url);
    onFaceSourceChange("own");
  };
  const resetFace = () => {
    setFace(null);
    onPhotoChange(null);
    onFaceSourceChange(null);
  };
  const pickFace = (id: "f" | "m") => {
    setFace(id);
    onPhotoChange(AVATARS[id].image); // preview the chosen replica next to Sky
    onFaceSourceChange("ready");
    setConsentVideoDone(false); // ready-made path doesn't use the recorded clips
  };

  const onVideoCaptured = (kind: VideoKind, poster?: string) => {
    if (kind === "consent") {
      setConsentVideoDone(true);
      setConsented(true); // the on-camera script IS the consent (covers audio + video)
    } else {
      applyOwnVideo(poster || "");
    }
  };
  const removeVideo = (kind: VideoKind) => {
    if (kind === "consent") setConsentVideoDone(false);
    else resetFace();
  };
  const removeAllVideos = () => {
    resetFace();
    setConsentVideoDone(false);
  };
  const videoCount = (consentVideoDone ? 1 : 0) + (trainingDone ? 1 : 0);

  // Grab a still frame from an uploaded video so the preview shows a real photo
  // instead of a non-rendering blob (training only; consent needs no poster).
  const uploadVideo = (kind: VideoKind, f: File) => {
    if (kind === "consent") {
      setConsentVideoDone(true);
      setConsented(true); // uploaded consent clip satisfies consent too
      return;
    }
    const url = URL.createObjectURL(f);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    const grab = () => {
      const w = video.videoWidth || 480;
      const h = video.videoHeight || 360;
      const scale = Math.min(1, 480 / w);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      const ctx = canvas.getContext("2d");
      if (ctx && video.videoWidth) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        applyOwnVideo(canvas.toDataURL("image/jpeg", 0.85));
      } else {
        applyOwnVideo(url);
      }
      URL.revokeObjectURL(url);
    };
    video.onseeked = grab;
    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(0.1, (video.duration || 0.2) / 2);
      } catch {
        grab();
      }
    };
    video.onerror = () => applyOwnVideo(url);
  };
  const onVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setOwnVoiceReady(true);
      setVoice("own");
    }
  };
  const resetVoice = () => {
    setVoice(null);
    setOwnVoiceReady(false);
  };
  const previewVoice = (id: "f" | "m") => {
    setPreviewing((p) => (p === id ? null : id));
    window.setTimeout(() => setPreviewing((p) => (p === id ? null : p)), 2400);
  };

  const Header = (
    <>
      <div className="mb-[18px] flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px] text-violet">
          <span className="h-[8px] w-[8px] rounded-full bg-violet animate-status-pulse" />
          {copy.eyebrow}
        </span>
        {tierLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white animate-[onb-fade_200ms_var(--ease-soft)]">
            <Sparkles size={11} strokeWidth={2.5} /> {tierLabel}
          </span>
        )}
      </div>
      <h1 className="mb-[10px] font-heading text-[32px] font-semibold leading-[1.15] tracking-[-0.7px] text-dark">
        {copy.heading}
      </h1>
      <p className="mb-8 text-[15px] leading-[1.6] text-gray-3">{copy.intro}</p>
    </>
  );


  return (
    <div className="animate-[onb-fade_200ms_var(--ease-soft)]">
      {Header}

      <input ref={voiceFileRef} type="file" accept="audio/*" className="hidden" onChange={onVoiceUpload} />

      <div className="space-y-4">
        {/* ---------- Face: consent + training videos (captured in the popup) ---------- */}
        <SplitCard
          pickerLabel="Ready-made"
          showPicker={!ownFaceComplete}
          options={(["f", "m"] as const).map((id) => ({
            id,
            label: AVATARS[id].label,
            selected: face === id,
            onSelect: () => pickFace(id),
            media: (
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[10px] sm:h-7 sm:w-7 sm:rounded-[7px]">
                <Image src={AVATARS[id].image} alt="" fill className="object-cover object-center" />
              </span>
            ),
          }))}
        >
          {ownFaceComplete ? (
            <PreviewSlot
              media={<IconMedia tone="success" icon={<Check size={22} strokeWidth={2.5} />} />}
              title="Your twyn videos"
              subtitle={customUnlocked ? "Consent + training · avatar will process" : "Consent + training ✓"}
              actions={[
                { label: "Edit", onClick: () => setVideoOpen(true) },
                { label: "Remove", onClick: removeAllVideos, muted: true },
              ]}
            />
          ) : (
            <AddSlot
              icon={<Video size={20} />}
              title="Add your twyn videos"
              action={videoCount > 0 ? `Finish — ${videoCount} of 2` : "Consent + training"}
              onPrimary={() => setVideoOpen(true)}
              onUpload={() => setVideoOpen(true)}
              hideUpload
            />
          )}
        </SplitCard>

        {/* ---------- Voice ---------- */}
        <SplitCard
          pickerLabel="Ready-made"
          showPicker={!(voice === "own" && ownVoiceReady)}
          options={(["f", "m"] as const).map((id) => ({
            id,
            label: AVATARS[id].label,
            selected: voice === id,
            onSelect: () => {
              setVoice(id);
              previewVoice(id);
            },
            media: (
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors sm:h-7 sm:w-7",
                  voice === id ? "bg-white/25 text-white" : "bg-white text-violet ring-1 ring-violet/25",
                )}
              >
                {previewing === id ? (
                  <Pause className="h-4 w-4 sm:h-3 sm:w-3" />
                ) : (
                  <Play className="ml-px h-4 w-4 sm:h-3 sm:w-3" />
                )}
              </span>
            ),
          }))}
        >
          {voice === "own" && ownVoiceReady ? (
            <PreviewSlot
              media={<IconMedia tone="success" icon={<Check size={22} strokeWidth={2.5} />} />}
              title="Your voice"
              subtitle="Added"
              actions={[{ label: "Remove", onClick: resetVoice, muted: true }]}
            />
          ) : (
            // Custom voice is free on every tier.
            <AddSlot
              icon={<Mic size={20} />}
              title="Record your voice"
              action="Record · 15 sec"
              onPrimary={() => setVoiceOpen(true)}
              onUpload={() => voiceFileRef.current?.click()}
            />
          )}
        </SplitCard>
      </div>

      {/* Free trial: capturing + a stock/still avatar is fully featured. Making
          the avatar MOVE is the paid part — but we don't sell here. This is a
          teaser (what it looks like + a promo field); the actual upgrade is a
          one-tap purchase later, from inside the studio. */}
      {!customUnlocked && (
        <button
          type="button"
          onClick={() => setUnlockOpen(true)}
          className="group mt-4 flex w-full items-center gap-4 rounded-card border-[1.5px] border-violet/25 bg-violet-light/50 px-4 py-3.5 text-left transition-colors hover:border-violet/50 animate-[onb-fade_200ms_var(--ease-soft)]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-violet text-white">
            <Sparkles size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-bold text-dark">Want your avatar to move?</span>
            <span className="mt-0.5 block text-[12.5px] leading-[1.45] text-gray-3">
              Your twyn always talks in your voice. Build free now — make your avatar move anytime from your studio, or use an early access code.
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] border-violet bg-white px-4 py-2 text-[12.5px] font-bold text-violet transition-colors group-hover:bg-violet group-hover:text-white">
            See how <span aria-hidden>→</span>
          </span>
        </button>
      )}

      {/* Consent — only when the user supplies their own face/voice. */}
      {usingOwn && (
        <label className="mt-6 flex cursor-pointer items-start gap-[10px] text-[13px] leading-[1.5] text-gray-2 animate-[onb-fade_200ms_var(--ease-soft)]">
          <Checkbox
            checked={consented}
            onCheckedChange={(v) => setConsented(v === true)}
            className="mt-[2px] size-[18px] shrink-0 border-border bg-white data-[state=checked]:border-violet data-[state=checked]:bg-violet"
          />
          <span className="min-w-0">
            <span className="block font-medium text-dark">
              This is me — or someone whose face and voice I have permission to use — and I
              agree to Twynity creating an AI version of this likeness.
            </span>
            <span className="mt-1 block text-[12px] text-gray-4">
              It&apos;s encrypted, never sold or shared, and you can delete it anytime. See our{" "}
              <PolicyLink policy="biometric">Biometric Data Policy</PolicyLink>.
            </span>
          </span>
        </label>
      )}

      <div className="mt-8 flex justify-end">
        <PillButton type="button" onClick={onContinue} disabled={!canContinue} className="w-full sm:w-auto">
          {cta}
          <span className="transition-transform duration-150 group-hover:translate-x-[3px]">→</span>
        </PillButton>
      </div>

      <TwynVideosDialog
        open={videoOpen}
        onOpenChange={setVideoOpen}
        consentDone={consentVideoDone}
        trainingDone={trainingDone}
        trainingPoster={trainingDone ? photo : null}
        onCaptured={onVideoCaptured}
        onUpload={uploadVideo}
        onRemove={removeVideo}
      />
      <VoiceRecordDialog
        open={voiceOpen}
        onOpenChange={setVoiceOpen}
        onDone={() => {
          setOwnVoiceReady(true);
          setVoice("own");
        }}
      />
      <UnlockCustomPanel
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        hasVideo={face === "own"}
        onPromo={onPromoUnlock}
      />
    </div>
  );
}


type Opt = {
  id: "f" | "m";
  label: string;
  selected: boolean;
  onSelect: () => void;
  media: React.ReactNode;
};

// One card per section: the live preview/primary fills the left; the ready-made
// picker sits on the right with a subtle surface.
function SplitCard({
  children,
  options,
  pickerLabel,
  showPicker = true,
}: {
  children: React.ReactNode;
  options: Opt[];
  pickerLabel: string;
  showPicker?: boolean;
}) {
  return (
    // Mobile: stack (primary on top, picker below). Desktop (sm+): side-by-side
    // with a fixed-min-height so the card doesn't shrink when the picker collapses.
    <div className="flex flex-col items-stretch overflow-hidden rounded-card border-[1.5px] border-border bg-white sm:min-h-[123px] sm:flex-row">
      <div className="min-w-0 flex-1">{children}</div>
      {/* Once your own is added the picker is irrelevant — collapse it so the
          card is just the confirmation; Remove brings it back. */}
      {showPicker && (
        <>
          <div className="h-px w-full shrink-0 bg-border sm:h-auto sm:w-px" />
          <div className="flex w-full flex-col justify-center gap-2 bg-bg-input/40 px-3 py-3 sm:w-[164px] sm:gap-1">
            <span className="px-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-5 sm:pb-0.5">
              {pickerLabel}
            </span>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col sm:gap-1">
              {options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={o.onSelect}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-[14px] font-semibold transition-colors sm:gap-2 sm:rounded-[10px] sm:px-1.5 sm:py-1 sm:text-[12.5px]",
                    o.selected ? "bg-violet text-white" : "text-gray-2 hover:bg-white",
                  )}
                >
                  {o.media}
                  <span className="flex-1 text-left">{o.label}</span>
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 transition-opacity sm:h-[13px] sm:w-[13px]",
                      o.selected ? "opacity-100" : "opacity-0",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Empty state — the encouraged "add your own" action.
function AddSlot({
  icon,
  title,
  action,
  onPrimary,
  onUpload,
  hideUpload = false,
}: {
  icon: React.ReactNode;
  title: string;
  action: string;
  hideUpload?: boolean;
  onPrimary: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="group relative flex h-full items-center gap-4 px-4 py-6 transition-colors hover:bg-violet-light/40 sm:gap-3.5 sm:p-3.5">
      <button type="button" onClick={onPrimary} aria-label={title} className="absolute inset-0" />
      <span className="pointer-events-none relative grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[15px] bg-violet-mid text-violet sm:h-12 sm:w-12 sm:rounded-[14px]">
        {icon}
      </span>
      <span className="pointer-events-none relative min-w-0">
        <span className="block text-[16px] font-bold tracking-[-0.2px] text-dark sm:text-[14.5px]">{title}</span>
        <span className="block text-[13.5px] text-gray-4 sm:text-[12.5px]">
          {action}
          {/* Desktop keeps the quiet inline "upload" link (hidden when upload
              only lives elsewhere, e.g. the twyn-videos popup). */}
          {!hideUpload && (
            <span className="hidden sm:inline">
              {" · or "}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpload();
                }}
                className="pointer-events-auto font-semibold text-violet underline underline-offset-2 hover:text-violet-h"
              >
                upload
              </button>
            </span>
          )}
        </span>
      </span>
      {/* Mobile: Upload becomes a trailing chip on the right (mirrors the
          PreviewSlot's Remove action), keeping the title/description clean. */}
      {!hideUpload && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpload();
          }}
          className="pointer-events-auto relative ml-auto inline-flex shrink-0 items-center rounded-lg bg-violet-light px-3.5 py-2 text-[13.5px] font-semibold text-violet transition-colors hover:bg-violet-mid sm:hidden"
        >
          Upload
        </button>
      )}
    </div>
  );
}

// Filled state — same layout as AddSlot, just reflecting the current selection
// (your photo, your voice, or the chosen replica) with quiet inline actions.
function PreviewSlot({
  media,
  title,
  subtitle,
  actions,
}: {
  media: React.ReactNode;
  title: string;
  subtitle?: string;
  actions: { label: string; onClick: () => void; muted?: boolean }[];
}) {
  return (
    <div className="flex h-full items-center gap-4 py-6 pl-4 pr-5 sm:gap-3.5 sm:py-3.5 sm:pl-3.5 sm:pr-6">
      <span className="relative grid h-[52px] w-[52px] shrink-0 place-items-center overflow-hidden rounded-[13px] sm:h-12 sm:w-12 sm:rounded-[12px]">
        {media}
      </span>
      <span className="min-w-0">
        <span className="block text-[16px] font-bold tracking-[-0.2px] text-dark sm:text-[14.5px]">{title}</span>
        {subtitle && <span className="block text-[13.5px] text-gray-4 sm:text-[12.5px]">{subtitle}</span>}
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-4 pl-3 text-[14px] font-semibold sm:text-[12.5px]">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className={cn(
              "transition-colors",
              a.muted ? "text-gray-4 hover:text-error" : "text-violet hover:text-violet-h",
            )}
          >
            {a.label}
          </button>
        ))}
      </span>
    </div>
  );
}

// A small coloured icon tile used as the preview slot's media when there's no
// image to show in the card (the real preview lives next to Sky).
function IconMedia({ tone, icon }: { tone: "success" | "violet"; icon: React.ReactNode }) {
  return (
    <span
      className={cn(
        "grid h-full w-full place-items-center",
        tone === "success" ? "bg-mint text-mint-text" : "bg-violet-mid text-violet",
      )}
    >
      {icon}
    </span>
  );
}
