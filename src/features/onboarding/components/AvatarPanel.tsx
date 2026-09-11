"use client";

import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Typewriter } from "./Typewriter";

// Dark avatar side — the recorded Tavus guide "Sky" plays on loop. When the user
// adds their photo, Sky shrinks (360→240) and slides left while the user's photo
// grows in beside it (the "one face → two" payoff), animated as a 0.4s width
// transition. One caption stays centered under the pair.
export function AvatarPanel({ caption, photo }: { caption: string; photo?: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const hasPhoto = Boolean(photo);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) v.play().catch(() => {});
  };

  return (
    <aside
      className="relative hidden h-full flex-col items-center justify-center overflow-hidden bg-dark px-10 py-8 lg:flex"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--violet) 18%, transparent) 0%, transparent 55%)",
      }}
    >
      {/* Avatar stack: Sky alone → Sky + your photo, side by side. */}
      <div
        className="flex items-center justify-center transition-[column-gap] duration-[400ms] ease-soft"
        style={{ columnGap: hasPhoto ? 24 : 0 }}
      >
        {/* Sky video frame (360 alone → 240 with photo) */}
        <div
          className="relative aspect-square shrink-0 overflow-hidden rounded-[22px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-[width] duration-[400ms] ease-soft"
          style={{ width: hasPhoto ? 240 : 360, background: "var(--video-panel-from)" }}
        >
          <video
            ref={videoRef}
            src="/assets/avatar.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          <span className="absolute right-[14px] top-[14px] h-2 w-2 rounded-full bg-success animate-status-pulse" />
          <button
            type="button"
            onClick={toggle}
            className="absolute bottom-[14px] left-[14px] inline-flex items-center gap-[6px] rounded-chip border border-white/15 bg-dark/70 px-3 py-2 text-[12px] font-semibold text-white backdrop-blur-[10px] transition-colors hover:bg-dark/90"
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {muted ? "Tap for sound" : "Sound on"}
          </button>
        </div>

        {/* Your photo frame — grows in from width 0 */}
        <div
          className="relative aspect-square shrink-0 overflow-hidden rounded-[22px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-[width,opacity] duration-[400ms] ease-soft"
          style={{ width: hasPhoto ? 240 : 0, opacity: hasPhoto ? 1 : 0, background: "var(--video-panel-to)" }}
        >
          {photo && <Image src={photo} alt="Your photo" fill unoptimized className="object-cover object-top" />}
        </div>
      </div>

      {/* Speech area — fixed reserved height (≈4 transcript lines + caption +
          waveform) with no shrink, so Sky's center doesn't jump as the
          typewriter transcript wraps to more lines. Content stays top-aligned. */}
      <div className="mt-[35px] flex min-h-[220px] max-w-[440px] shrink-0 flex-col items-center text-center">
        <div className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.8px] text-white/40">
          Sky · Your guide
        </div>
        <div className="font-heading text-[22px] font-semibold leading-[1.35] tracking-[-0.4px] text-white">
          <Typewriter text={caption} />
        </div>
        {/* Static audio glyph (no infinite motion, per design rule) */}
        <div className="mt-[22px] flex h-6 items-center justify-center gap-1" aria-hidden>
          {[8, 16, 22, 14, 20, 10, 18].map((h, i) => (
            <span key={i} className="block w-[3px] rounded-full bg-white/50" style={{ height: `${h}px` }} />
          ))}
        </div>
      </div>
    </aside>
  );
}
