import { cn } from "@/lib/utils";
import type { StarterPack } from "../data/mock-data";

// Generated, crisp pack artwork — a soft pastel gradient tinted from the pack's
// hue with the icon in the brand colour. Sharp at any size and themeable, so it
// doesn't depend on raster images. Pastel stops keep it on-brand and gentle.
function gradient(pack: StarterPack) {
  return `linear-gradient(145deg, color-mix(in srgb, ${pack.iconColor} 12%, #ffffff) 0%, color-mix(in srgb, ${pack.iconColor} 30%, #ffffff) 100%)`;
}

function Glyph({ pack, size }: { pack: StarterPack; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={`color-mix(in srgb, ${pack.iconColor}, #000000 12%)`}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={pack.iconPath} />
    </svg>
  );
}

// Wide hero banner (cards).
export function PackBanner({ pack, className }: { pack: StarterPack; className?: string }) {
  return (
    <div className={cn("relative grid place-items-center overflow-hidden", className)} style={{ background: gradient(pack) }}>
      <Glyph pack={pack} size={44} />
    </div>
  );
}

// Square glyph tile (modal header, "more packs" thumbnails).
export function PackGlyph({
  pack,
  className,
  size = 22,
}: {
  pack: StarterPack;
  className?: string;
  size?: number;
}) {
  return (
    <div className={cn("relative grid place-items-center overflow-hidden", className)} style={{ background: gradient(pack) }}>
      <Glyph pack={pack} size={size} />
    </div>
  );
}
