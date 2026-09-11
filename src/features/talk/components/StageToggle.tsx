"use client";

import { AudioLines, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TalkMode } from "./VideoPanel";

// The one Avatar/Audio control — a single segmented pill used in every state so
// the choice always lives in the same place (top-left). It both STARTS a stage
// (when none is active → `active` is null, nothing highlighted) and SWITCHES it
// (when a stage is live → that segment is highlighted). Two surfaces:
//   • "light" — on the white chat header (when chat is open)
//   • "glass" — on the dark stage (when chat is hidden)
// so it reads as the same control wherever it lands.
// Each segment fills the track height (items-stretch on the wrap) so the control
// is a clean h-9 — the same height as the chat toggle beside it and the header's
// Equip/Canvas buttons.
const SEG =
  "inline-flex items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition-colors outline-none focus-visible:ring-2";

export function StageToggle({
  active,
  onPick,
  tone = "light",
  className,
  avatarProcessing = false,
}: {
  active: TalkMode | null;
  onPick: (m: TalkMode) => void;
  tone?: "light" | "glass";
  className?: string;
  /** Avatar still training — show a pulse on the Avatar segment. */
  avatarProcessing?: boolean;
}) {
  const wrap =
    tone === "glass"
      ? "border border-white/15 bg-white/10 backdrop-blur"
      : "border border-border bg-white";
  const on = tone === "glass" ? "bg-white text-dark" : "bg-violet text-white";
  const off =
    tone === "glass"
      ? "text-white/80 hover:text-white"
      : "text-gray-2 hover:text-violet";
  // Theme-matched focus ring per surface (no stray browser-default blue).
  const ring = tone === "glass" ? "focus-visible:ring-white/40" : "focus-visible:ring-violet/40";

  return (
    <div
      className={cn(
        "inline-flex h-9 shrink-0 items-stretch gap-[2px] rounded-full p-[3px]",
        wrap,
        className
      )}
    >
      {(["avatar", "audio"] as const).map((m) => {
        const Icon = m === "avatar" ? Video : AudioLines;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onPick(m)}
            aria-pressed={active === m}
            className={cn(SEG, ring, active === m ? on : off)}
          >
            <Icon size={14} /> {m === "avatar" ? "Avatar" : "Audio"}
            {m === "avatar" && avatarProcessing && (
              <span
                className="ml-0.5 h-1.5 w-1.5 rounded-full bg-violet animate-status-pulse"
                title="Avatar processing"
                aria-label="Avatar processing"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
