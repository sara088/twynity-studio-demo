"use client";

import Image from "next/image";
import Link from "next/link";
import { Volume2, VolumeX, Mic, MicOff, PanelRightOpen, PhoneOff, RotateCcw, Send, TriangleAlert, ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import type { Twyn } from "@/features/my-twyns/types";
import { cn } from "@/lib/utils";
import { AVATAR_ETA_LABEL, type AvatarState } from "@/features/shared/lib/avatar";
import { StageToggle } from "./StageToggle";

export type TalkMode = "avatar" | "audio";

const CTRL_BASE = "grid h-10 w-10 place-items-center rounded-full transition-colors";
const CTRL_ON = "bg-violet text-white hover:bg-violet-h";
const CTRL_OFF = "border border-white/15 bg-white/10 text-white backdrop-blur hover:bg-white/15";

export function VideoPanel({
  twyn,
  mode,
  onModeChange,
  chatOpen,
  onToggleChat,
  onEndCall,
  onSendMessage,
  twynName,
  isFree = false,
  avatarImage,
  avatarState = "ready",
  avatarForced = false,
  avatarProgress = 1,
  avatarReason,
  onRedoAvatar,
  onMakeItMove,
  ownAvatar = false,
}: {
  twyn: Twyn;
  mode: TalkMode;
  /** Switch the live stage between avatar / audio (the control sits on the stage). */
  onModeChange: (m: TalkMode) => void;
  chatOpen: boolean;
  /** Show / hide the chat pane. "Show chat" lives here when chat is hidden. */
  onToggleChat: () => void;
  onEndCall: () => void;
  /** Send a typed message from the stage (mobile — type when you can't talk). */
  onSendMessage?: (text: string) => void;
  twynName?: string;
  /** Free tier — show the upgrade overlay. Free + own footage = static photo;
      free + stock = the ready-made replica still plays (it's animated). */
  isFree?: boolean;
  /** Avatar image chosen in onboarding (stock or captured still). */
  avatarImage?: string;
  /** Avatar training state — the avatar screen reflects processing / failed. */
  avatarState?: AvatarState;
  /** Dev preview (?avatar=processing|failed): show the processing/failed screen
      on ANY tier, bypassing the free-tier gate. Off for real flows. */
  avatarForced?: boolean;
  avatarProgress?: number;
  avatarReason?: string;
  /** Re-record + reprocess after a failed avatar. */
  onRedoAvatar?: () => void;
  /** Free trial: tapping the upgrade pill opens the in-studio upgrade. */
  onMakeItMove?: () => void;
  /** The static avatar is the user's own photo (true) vs a stock replica (false).
      Drives the copy: own → "Make it move"; stock → "Make your own". */
  ownAvatar?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // avatarMuted = you can't hear the avatar; micMuted = the avatar can't hear you.
  const [avatarMuted, setAvatarMuted] = useState(true);
  const [micMuted, setMicMuted] = useState(true);
  // Mobile: type to the twyn while watching the stage (when you can't talk).
  const [draft, setDraft] = useState("");
  const submitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSendMessage?.(text);
    setDraft("");
  };

  const toggleSpeaker = () => {
    const next = !avatarMuted;
    setAvatarMuted(next);
    const v = videoRef.current;
    if (v) {
      v.muted = next;
      if (v.paused) v.play().catch(() => {});
    }
  };

  const avatarSrc = avatarImage ?? twyn.portrait;

  // Free-tier upgrade overlay — a label saying WHAT is on screen + the pill.
  //   own photo (static) → "your photo" / "Make it move" (animate the real you)
  //   stock (already moving) → "stock avatar" / "Make it your own" (it's not you —
  //     add your face). Shown on both the free static photo and the free stock clip.
  const freeOverlay = (
    <>
      <span className="absolute bottom-3 left-3 z-10 rounded-full bg-dark/55 px-2.5 py-1 text-[10px] font-medium lowercase tracking-[0.04em] text-white/80 backdrop-blur">
        {ownAvatar ? "your photo" : "stock avatar"}
      </span>
      {(() => {
        const cls = cn(
          "group absolute right-[21px] z-10 inline-flex items-center gap-1 rounded-full bg-violet px-3.5 py-2 text-[11.5px] font-bold text-white shadow-[0_4px_14px_rgba(108,92,231,0.4)] transition-colors hover:bg-violet-h",
          chatOpen ? "top-[15px]" : "top-[60px]",
        );
        const inner = (
          <>
            {ownAvatar ? "Make it move" : "Make it your own"}
            <ArrowUpRight
              size={13}
              strokeWidth={2.5}
              className="transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
            />
          </>
        );
        return onMakeItMove ? (
          <button type="button" onClick={onMakeItMove} className={cls}>
            {inner}
          </button>
        ) : (
          <Link href="/plans" className={cls}>
            {inner}
          </Link>
        );
      })()}
    </>
  );

  return (
    <div className="relative h-full overflow-hidden bg-dark">
      {mode === "avatar" ? (
        // A real Basic avatar mid-training (post-upgrade) OR a dev preview
        // (?avatar=processing|failed) shows the processing / failed screens.
        // `avatarForced` lets the preview params work on ANY tier; without it the
        // free tier never trains, so a stale processing record can't hijack the
        // stage (it falls through to the static photo / moving replica below).
        (avatarForced || !isFree) && avatarState === "processing" ? (
          <AvatarProcessingView portrait={avatarSrc} progress={avatarProgress} />
        ) : (avatarForced || !isFree) && avatarState === "failed" ? (
          <AvatarFailedView portrait={avatarSrc} reason={avatarReason} onRedo={onRedoAvatar} />
        ) : isFree && ownAvatar ? (
          // Free + OWN video → static photo: only Basic (Tavus) animates YOUR face.
          <div className="relative h-full w-full">
            <Image src={avatarSrc} alt="" fill className="object-cover object-top" unoptimized />
            {freeOverlay}
          </div>
        ) : (
          // Moving avatar. Two very different cases share this branch:
          //   free + stock → a ready-made replica that ISN'T you (the "Sky" demo
          //     avatar), with the "make it your own" overlay.
          //   Basic ready → your OWN trained, moving avatar (Sara).
          <div className="relative h-full w-full">
            <video
              ref={videoRef}
              src={isFree ? "/assets/avatar.mp4" : "/assets/sara_studio.mp4"}
              // No poster on the stock clip — the portrait is Sara, and flashing
              // her over a not-you replica would be confusing.
              poster={isFree ? undefined : avatarSrc}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
            {isFree && freeOverlay}
          </div>
        )
      ) : (
        <AudioModeView portrait={avatarSrc} name={twyn.name} />
      )}

      {/* Top-left of the stage: the Avatar/Audio control (it governs the stage,
          so it lives on it — and stays reachable in full-screen). The inset
          matches the chat header's px-5 py-3.5 + 1px card border (= 21px / 15px)
          so the pill lands on the exact same spot when it hops header↔stage —
          no jump. */}
      <div className="absolute left-[21px] top-[15px]">
        <StageToggle active={mode} onPick={onModeChange} tone="glass" avatarProcessing={avatarState === "processing"} />
      </div>

      {/* "Show chat" lives top-right when chat is hidden — the corner the chat
          returns to, and clear of the Avatar/Audio control on the left. Same
          inset as the pill so the two sit on one line. */}
      {!chatOpen && (
        <button
          type="button"
          onClick={onToggleChat}
          aria-label="Show chat"
          title="Show chat"
          className="absolute right-[21px] top-[15px] inline-flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 text-[12px] font-semibold text-white outline-none backdrop-blur transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <PanelRightOpen size={14} /> Show chat
        </button>
      )}

      {/* Controls — speaker, mic, end call. (Mode is chosen by the top-left
          Avatar/Audio pill, not down here, so it never moves between states.)
          On mobile a text bar sits below them: type to the twyn when you can't
          talk out loud, without leaving the stage. */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-4 pb-4 pt-10">
        <div className="flex items-center justify-center gap-3">
          {/* Speaker — mute/unmute the avatar's audio */}
          <button
            type="button"
            onClick={toggleSpeaker}
            aria-label={avatarMuted ? "Unmute avatar" : "Mute avatar"}
            title={avatarMuted ? "Avatar muted" : "Avatar audio on"}
            className={cn(CTRL_BASE, avatarMuted ? CTRL_OFF : CTRL_ON)}
          >
            {avatarMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Mic — mute/unmute your microphone */}
          <button
            type="button"
            onClick={() => setMicMuted((m) => !m)}
            aria-label={micMuted ? "Unmute your mic" : "Mute your mic"}
            title={micMuted ? "Your mic is off" : "Your mic is live"}
            className={cn(CTRL_BASE, micMuted ? CTRL_OFF : CTRL_ON)}
          >
            {micMuted ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          {/* End call — leave the live call (drops to text chat) */}
          <button
            type="button"
            onClick={onEndCall}
            aria-label="End call"
            className="grid h-10 w-10 place-items-center rounded-full bg-error text-white transition-opacity hover:opacity-90"
          >
            <PhoneOff size={15} />
          </button>
        </div>

        {/* Mobile-only message bar — type instead of talk. Desktop types in the
            chat pane beside the stage, so it's hidden there. */}
        {onSendMessage && (
          <form onSubmit={submitDraft} className="mx-auto mt-3 flex max-w-[560px] items-center gap-2 lg:hidden">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${twynName ?? "your twyn"}…`}
              aria-label="Type a message"
              className="h-11 min-w-0 flex-1 rounded-full border border-white/15 bg-white/12 px-4 text-[14px] text-white outline-none backdrop-blur transition-colors placeholder:text-white/55 focus:border-white/40"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet text-white transition-opacity hover:bg-violet-h disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function AudioModeView({ portrait, name }: { portrait: string; name: string }) {
  return (
    <div className="relative h-full w-full bg-dark">
      <div className="absolute inset-0 grid place-items-center">
        <div className="flex flex-col items-center gap-7">
          <div className="relative grid h-[220px] w-[220px] place-items-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 220 220" aria-hidden>
              <circle cx="110" cy="110" r="106" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="2 6" />
            </svg>
            <div className="h-[110px] w-[110px] overflow-hidden rounded-full">
              <Image src={portrait} alt={name} width={110} height={110} className="h-full w-full object-cover object-top" unoptimized />
            </div>
          </div>

          <div className="flex items-end gap-[3px]">
            {[6, 12, 18, 9, 22, 14, 8, 17, 11, 7].map((h, i) => (
              <span
                key={i}
                className="block w-[3px] rounded-full bg-white/65"
                style={{ height: `${h}px`, animation: `talk-wave 1.1s ease-in-out ${i * 0.08}s infinite alternate` }}
              />
            ))}
          </div>

          <span className="text-[12.5px] font-semibold tracking-[0.04em] text-white/70">Voice-only mode</span>
        </div>
      </div>
    </div>
  );
}

// Shown on the avatar screen while the video avatar is still training. The
// portrait sits behind a progress ring; voice still works in the meantime.
function AvatarProcessingView({ portrait, progress }: { portrait: string; progress: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const R = 104;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative h-full w-full bg-dark">
      <div className="absolute inset-0 grid place-items-center px-6">
        <div className="flex max-w-[360px] flex-col items-center text-center">
          <div className="relative grid h-[220px] w-[220px] place-items-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 220 220" aria-hidden>
              <circle cx="110" cy="110" r={R} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="3" />
              <circle
                cx="110"
                cy="110"
                r={R}
                fill="none"
                stroke="var(--violet)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - pct / 100)}
                className="transition-[stroke-dashoffset] duration-500 ease-soft"
              />
            </svg>
            <div className="h-[120px] w-[120px] overflow-hidden rounded-full opacity-60">
              <Image src={portrait} alt="" width={120} height={120} className="h-full w-full object-cover object-top" unoptimized />
            </div>
            <span className="absolute bottom-1 rounded-full bg-dark/80 px-2.5 py-0.5 text-[12px] font-bold tabular-nums text-white backdrop-blur">
              {pct}%
            </span>
          </div>

          <div className="mt-7 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
            <span className="h-2 w-2 rounded-full bg-violet animate-status-pulse" />
            Building your avatar
          </div>
          <div className="mt-2 font-heading text-[19px] font-semibold leading-[1.3] tracking-[-0.3px] text-white">
            Your video avatar is processing
          </div>
          <p className="mt-2 text-[13px] leading-[1.55] text-white/65">
            Usually ready in {AVATAR_ETA_LABEL}. You can talk by voice now — we&apos;ll
            notify you the moment your avatar is live.
          </p>
        </div>
      </div>
    </div>
  );
}

// Shown on the avatar screen when training failed a quality check. Gives the
// short reason and a redo (re-record) action; voice still works meanwhile.
function AvatarFailedView({
  portrait,
  reason,
  onRedo,
}: {
  portrait: string;
  reason?: string;
  onRedo?: () => void;
}) {
  return (
    <div className="relative h-full w-full bg-dark">
      <div className="absolute inset-0 grid place-items-center px-6">
        <div className="flex max-w-[380px] flex-col items-center text-center">
          <div className="relative grid h-[148px] w-[148px] place-items-center">
            <div className="h-[120px] w-[120px] overflow-hidden rounded-full opacity-35 grayscale">
              <Image src={portrait} alt="" width={120} height={120} className="h-full w-full object-cover object-top" unoptimized />
            </div>
            <span className="absolute -bottom-1 grid h-9 w-9 place-items-center rounded-full bg-error text-white ring-4 ring-dark">
              <TriangleAlert size={17} />
            </span>
          </div>

          <div className="mt-7 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-error/90">
            Couldn&apos;t build your avatar
          </div>
          <div className="mt-2 font-heading text-[19px] font-semibold leading-[1.3] tracking-[-0.3px] text-white">
            Let&apos;s try that again
          </div>
          <p className="mt-2 text-[13px] leading-[1.55] text-white/65">
            {reason ?? "Something went wrong while training your avatar."}
          </p>

          <button
            type="button"
            onClick={onRedo}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-btn bg-violet px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-violet-h"
          >
            <RotateCcw size={16} /> Redo video
          </button>
          <p className="mt-3 text-[12px] text-white/45">Voice still works in the meantime.</p>
        </div>
      </div>
    </div>
  );
}
