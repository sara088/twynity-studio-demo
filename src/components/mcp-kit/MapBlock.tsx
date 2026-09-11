import * as React from "react";
import { MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────
// MapBlock — a tokenised map surface with pin markers. This is the kit's
// stand-in surface (soft grid + violet pins) so location results look
// consistent; an app with a real map tile can render it inside the same frame.
// Pin coords are percentages (0–100) of the surface.
// ─────────────────────────────────────────────────────────────────────────

type Pin = { x: number; y: number; label?: string };

function MapBlock({
  pins = [],
  height = 160,
  className,
}: {
  pins?: Pin[];
  height?: number;
  className?: string;
}) {
  return (
    <div
      data-slot="mcp-map"
      className={cn(
        "relative overflow-hidden rounded-[12px] border border-border",
        className
      )}
      style={{
        height,
        backgroundColor: "var(--violet-light)",
        backgroundImage:
          "linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {pins.map((p, i) => (
        <span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-full text-violet drop-shadow-sm"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          title={p.label}
        >
          <MapPin size={22} fill="currentColor" className="text-violet" />
        </span>
      ))}
    </div>
  );
}

export { MapBlock };
export type { Pin };
