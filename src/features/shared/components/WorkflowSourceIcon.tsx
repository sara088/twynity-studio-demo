import Image from "next/image";
import { BrandIcon, hasBrandIcon } from "@/features/marketplace/components/BrandIcon";
import { cn } from "@/lib/utils";

// The origin-platform mark for a workflow — so a workflow reads at a glance as an
// n8n flow, a Power Automate flow, a UiPath robot, etc. Real logos via Simple
// Icons where available; a branded monogram for platforms without one (Power
// Automate); a generic workflow tile for native / marketplace (no platform).

const LOGO: Record<string, string> = {
  n8n: "n8n",
  zapier: "zapier",
  uipath: "uipath",
  make: "make",
  langflow: "langflow",
};

const TILE: Record<string, { color: string; letter: string }> = {
  "power automate": { color: "#0B63CE", letter: "P" },
};

export function WorkflowSourceIcon({
  platform,
  className,
  iconClassName,
}: {
  platform?: string;
  /** Sizing for the tile box (h/w/rounded/text). */
  className?: string;
  /** Sizing for the brand/lucide glyph inside. */
  iconClassName?: string;
}) {
  const key = platform?.trim().toLowerCase();
  const logoId = key ? LOGO[key] : undefined;
  const tile = key ? TILE[key] : undefined;

  if (logoId && hasBrandIcon(logoId)) {
    return (
      <span className={cn("grid shrink-0 place-items-center rounded-[12px] border border-border bg-white", className)}>
        <BrandIcon logo={logoId} className={cn("h-[55%] w-[55%]", iconClassName)} />
      </span>
    );
  }
  if (tile) {
    return (
      <span
        className={cn("grid shrink-0 place-items-center rounded-[12px] font-heading font-bold text-white", className)}
        style={{ background: tile.color }}
      >
        {tile.letter}
      </span>
    );
  }
  // Native / marketplace (built on Twynity's own engine, no external platform) →
  // the Twynity mark.
  return (
    <span className={cn("relative shrink-0 overflow-hidden rounded-[12px] border border-border bg-white", className)}>
      <Image src="/assets/twynity-logo.svg" alt="" fill className={cn("object-contain p-[20%]", iconClassName)} />
    </span>
  );
}
