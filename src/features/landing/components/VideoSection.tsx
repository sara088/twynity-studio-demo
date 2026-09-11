"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export function VideoSection() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="relative z-10 py-[100px]">
      <div className="mx-auto max-w-[1120px] px-7">
        <div className="mb-14 text-center">
          <div className="mb-[14px] text-[11.5px] font-bold uppercase tracking-[1.2px] text-violet">
            See it in action
          </div>
          <h2 className="mt-[14px] font-heading text-[44px] font-semibold leading-[1.1] tracking-[-1.4px] text-dark">
            Watch a twyn at work
          </h2>
          <p className="mx-auto mt-[18px] max-w-[560px] text-[16px] leading-[1.6] text-gray-3">
            See how a twyn handles real conversations, runs the work, and keeps
            their human in the loop — without ever replacing them.
          </p>
        </div>

        <div className="mx-auto max-w-[760px]">
          <div
            className="relative overflow-hidden rounded-card shadow-[0_30px_80px_rgba(15,15,30,0.20)]"
            style={{
              aspectRatio: "16 / 9",
              background:
                "linear-gradient(135deg, var(--video-panel-from) 0%, var(--video-panel-to) 100%)",
            }}
          >
            <video
              ref={ref}
              src="/assets/sara_studio.mp4"
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause video" : "Play video"}
              className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-dark transition-transform duration-[180ms] ease-soft hover:scale-[1.06]"
            >
              {playing ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" className="ml-[3px]" />
              )}
            </button>

            <div className="absolute bottom-[18px] left-[18px] flex items-center gap-[10px] text-white">
              <span className="h-[30px] w-[30px] shrink-0 rounded-full bg-violet" />
              <div className="leading-tight">
                <div className="text-[13px] font-bold">
                  Alex&apos;s Twyn
                </div>
                <div className="text-[11.5px] font-medium text-white/70">
                  Software Lead · Acme Corp
                </div>
              </div>
            </div>

            <span className="absolute right-[18px] top-[18px] inline-flex items-center gap-[6px] rounded-chip bg-black/55 px-[10px] py-[5px] text-[10.5px] font-bold uppercase tracking-[0.5px] text-white backdrop-blur-[8px]">
              <span className="h-[6px] w-[6px] rounded-full bg-success animate-status-pulse" />
              Live
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
