"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Play, Video, RotateCcw, TriangleAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Twyn } from "@/features/my-twyns/types";
import { Section } from "./Section";
import { useAvatarStatus } from "@/features/shared/hooks/useAvatarStatus";
import { AVATAR_ETA_LABEL, clearAvatarProcessing, startAvatarProcessing, type AvatarStatus } from "@/features/shared/lib/avatar";
import { VideoCaptureDialog } from "@/features/onboarding/components/VideoCaptureDialog";

type Pick = "own" | "f" | "m";

const STOCK = {
  f: { label: "Feminine", image: "/assets/replica-female.png" },
  m: { label: "Masculine", image: "/assets/replica-male.png" },
} as const;

// Avatar/voice card. For a custom avatar it surfaces the two clips you recorded
// (consent + training) and their live training state (building / couldn't
// process / ready), mirroring what onboarding captured. You can switch to a
// stock look, but the custom avatar can't be regenerated — the recording is the
// only way back.
export function AvatarVoiceSection({ twyn, hasCustom }: { twyn: Twyn; hasCustom: boolean }) {
  const initial: Pick = hasCustom ? "own" : "f";
  const [avatar, setAvatar] = useState<Pick>(initial);
  const [voice, setVoice] = useState<Pick>("own");
  const [base, setBase] = useState<{ avatar: Pick; voice: Pick }>({ avatar: initial, voice: "own" });
  const [redoOpen, setRedoOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const status = useAvatarStatus(twyn.id, twyn.name);
  const dirty = avatar !== base.avatar || voice !== base.voice;

  const save = () => {
    setBase({ avatar, voice });
    toast.success("Changes saved");
  };
  const discard = () => {
    setAvatar(base.avatar);
    setVoice(base.voice);
  };
  // Deleting the custom avatar is immediate (two-step confirmed in the card): it
  // clears the training record and reverts the twyn to a stock look.
  const handleDelete = () => {
    clearAvatarProcessing(twyn.id);
    setAvatar("f");
    setBase((b) => ({ ...b, avatar: "f" }));
    setDeleted(true);
    toast.success("Custom avatar deleted");
  };

  return (
    <Section title="Avatar & voice" summary="How your twyn looks and sounds." defaultOpen={false}>
      <div className="grid items-start gap-7 lg:grid-cols-2">
        {/* Avatar */}
        <div>
          <span className="mb-2.5 block text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
            Avatar
          </span>

          {hasCustom && !deleted ? (
            <>
              <VideosCard
                twyn={twyn}
                status={status}
                selected={avatar === "own"}
                onSelect={() => setAvatar("own")}
                onRerecord={() => setRedoOpen(true)}
                onDelete={handleDelete}
              />
              <span className="mb-2 mt-4 block text-[11px] font-semibold text-gray-4">Or use a stock look</span>
              <div className="grid grid-cols-2 gap-2.5">
                <Tile selected={avatar === "f"} onClick={() => setAvatar("f")} label={STOCK.f.label} image={STOCK.f.image} />
                <Tile selected={avatar === "m"} onClick={() => setAvatar("m")} label={STOCK.m.label} image={STOCK.m.image} />
              </div>
            </>
          ) : deleted ? (
            <>
              <p className="mb-2.5 flex items-start gap-1.5 rounded-[10px] border border-border bg-bg-input px-3 py-2.5 text-[12px] leading-[1.5] text-gray-3">
                <TriangleAlert size={13} className="mt-px shrink-0 text-amber-text" />
                Your custom avatar was deleted. Your twyn now uses a stock look.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <Tile selected={avatar === "f"} onClick={() => setAvatar("f")} label={STOCK.f.label} image={STOCK.f.image} />
                <Tile selected={avatar === "m"} onClick={() => setAvatar("m")} label={STOCK.m.label} image={STOCK.m.image} />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              <Tile selected={avatar === "own"} onClick={() => setAvatar("own")} label="Your photo" image={twyn.portrait} />
              <Tile selected={avatar === "f"} onClick={() => setAvatar("f")} label={STOCK.f.label} image={STOCK.f.image} />
              <Tile selected={avatar === "m"} onClick={() => setAvatar("m")} label={STOCK.m.label} image={STOCK.m.image} />
            </div>
          )}
        </div>

        {/* Voice */}
        <div>
          <span className="mb-2.5 block text-[11.5px] font-bold uppercase tracking-[0.04em] text-gray-2">
            Voice
          </span>
          <div className="space-y-2">
            <VoiceRow selected={voice === "own"} onClick={() => setVoice("own")} label="Your voice" />
            <VoiceRow selected={voice === "f"} onClick={() => setVoice("f")} label="Feminine" />
            <VoiceRow selected={voice === "m"} onClick={() => setVoice("m")} label="Masculine" />
          </div>
        </div>
      </div>

      {dirty && (
        <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-border pt-4">
          <button
            type="button"
            onClick={discard}
            className="rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-violet px-[18px] py-[9px] text-[13px] font-bold text-white transition-colors hover:bg-violet-h"
          >
            Save changes
          </button>
        </div>
      )}

      {/* Re-record restarts training (first pass fails a quality check, a redo succeeds). */}
      <VideoCaptureDialog open={redoOpen} onOpenChange={setRedoOpen} onCapture={() => startAvatarProcessing(twyn.id)} />
    </Section>
  );
}

// The custom-avatar block — the two recorded clips + the live training state.
function VideosCard({
  twyn,
  status,
  selected,
  onSelect,
  onRerecord,
  onDelete,
}: {
  twyn: Twyn;
  status: AvatarStatus;
  selected: boolean;
  onSelect: () => void;
  onRerecord: () => void;
  onDelete: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const processing = status.state === "processing";
  const failed = status.state === "failed";
  const pct = Math.round(status.progress * 100);

  const pill = processing
    ? { text: "Building avatar", cls: "bg-violet-light text-violet", dot: true }
    : failed
      ? { text: "Couldn't process", cls: "bg-error/10 text-error", dot: false }
      : { text: "Ready", cls: "bg-mint text-mint-text", dot: false };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      className={cn(
        "cursor-pointer rounded-[14px] border-[1.5px] p-3 transition-colors",
        selected ? "border-violet bg-violet-light/30" : "border-border bg-white hover:border-violet/40",
      )}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[12px] font-bold text-dark">Your twyn videos</span>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold", pill.cls)}>
          {pill.dot && <span className="h-1.5 w-1.5 rounded-full bg-violet animate-status-pulse" />}
          {pill.text}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Clip label="Consent" poster={twyn.portrait} dim={processing || failed} />
        <Clip label="Training" poster={twyn.portrait} building={processing} />
      </div>

      {processing && (
        <div className="mt-3">
          <div className="h-[5px] overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-violet transition-[width] duration-500 ease-soft"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11.5px] text-gray-4">Building your avatar — ready in {AVATAR_ETA_LABEL}.</p>
        </div>
      )}

      {failed && (
        <div className="mt-3 rounded-[10px] border border-error/25 bg-error/[0.04] p-2.5">
          <p className="flex items-start gap-1.5 text-[11.5px] leading-[1.45] text-gray-2">
            <TriangleAlert size={13} className="mt-px shrink-0 text-error" />
            {status.reason ?? "Your avatar couldn't be processed."}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRerecord();
            }}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-violet px-3 py-1.5 text-[11.5px] font-bold text-white transition-colors hover:bg-violet-h"
          >
            <RotateCcw size={12} /> Redo video
          </button>
        </div>
      )}

      {status.state === "ready" && (
        <p className="mt-2.5 text-[11.5px] text-gray-4">Consent + training captured — live in the studio.</p>
      )}

      {/* Actions — re-record / delete, with an inline two-step confirm for delete. */}
      {confirming ? (
        <div className="mt-2.5 border-t border-border/70 pt-2.5" onClick={(e) => e.stopPropagation()}>
          <p className="text-[11.5px] leading-[1.45] text-gray-2">
            Delete your custom avatar? This removes your recorded consent + training videos and can&apos;t be undone.
          </p>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-[11.5px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                onDelete();
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-error px-3 py-1.5 text-[11.5px] font-bold text-white transition-opacity hover:opacity-90"
            >
              <Trash2 size={12} /> Delete avatar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2.5 flex items-center justify-end gap-3 border-t border-border/70 pt-2.5">
          {status.state === "ready" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRerecord();
              }}
              className="text-[11.5px] font-semibold text-violet hover:underline"
            >
              Re-record
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConfirming(true);
            }}
            className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-gray-4 transition-colors hover:text-error"
          >
            <Trash2 size={11} /> Delete avatar
          </button>
        </div>
      )}
    </div>
  );
}

// One recorded clip — poster + play affordance, with a building overlay while training.
function Clip({ label, poster, dim, building }: { label: string; poster: string; dim?: boolean; building?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-violet-mid">
      <span className="relative block aspect-video w-full">
        <Image src={poster} alt="" fill className={cn("object-cover object-top", dim && "opacity-60")} />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm">
            <Play size={12} className="ml-px" />
          </span>
        </span>
        {building && (
          <span className="absolute inset-0 grid place-items-center bg-dark/45">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/90">Building</span>
          </span>
        )}
      </span>
      <span className="flex items-center gap-1 px-2 py-1.5 text-[10.5px] font-semibold text-dark">
        <Video size={11} className="text-gray-4" /> {label}
      </span>
    </div>
  );
}

function Tile({
  selected,
  onClick,
  label,
  image,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  image: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative overflow-hidden rounded-[14px] border-[1.5px] bg-white text-left transition-colors",
        selected ? "border-violet" : "border-border hover:border-violet/40",
      )}
    >
      <span className="relative block aspect-[4/5] w-full overflow-hidden bg-violet-mid">
        <Image src={image} alt="" fill className="object-cover object-top" />
      </span>
      <span className="flex items-center justify-between gap-1 px-2.5 py-2">
        <span className="truncate text-[12px] font-semibold text-dark">{label}</span>
        <span
          className={cn(
            "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-[1.5px] transition-colors",
            selected ? "border-violet bg-violet text-white" : "border-gray-6",
          )}
        >
          {selected && <Check size={11} strokeWidth={3} />}
        </span>
      </span>
    </button>
  );
}

function VoiceRow({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-input border-[1.5px] px-3 py-2.5 text-left transition-colors",
        selected ? "border-violet bg-violet-light/40" : "border-border bg-white hover:border-violet/40",
      )}
    >
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors",
          selected ? "bg-violet text-white" : "bg-bg-input text-violet",
        )}
      >
        <Play size={13} className="ml-px" />
      </span>
      <span className="flex-1 truncate text-[13px] font-semibold text-dark">{label}</span>
      <span
        className={cn(
          "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-[1.5px] transition-colors",
          selected ? "border-violet bg-violet text-white" : "border-gray-6",
        )}
      >
        {selected && <Check size={11} strokeWidth={3} />}
      </span>
    </button>
  );
}
