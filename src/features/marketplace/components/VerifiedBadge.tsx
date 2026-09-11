import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Small "4th-IR verified" badge — marks marketplace items vetted & approved by
// 4th-IR. `compact` is for the dense cards; the default size is for modals.
export function VerifiedBadge({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      title="Verified by 4th-IR"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EAF1FF] font-bold tracking-[0.01em] text-[#2563EB]",
        compact ? "px-1.5 py-[1px] text-[9px]" : "px-2.5 py-1 text-[11px]",
        className,
      )}
    >
      <BadgeCheck size={compact ? 10 : 13} strokeWidth={2.5} />
      {compact ? "4th-IR" : "4th-IR verified"}
    </span>
  );
}
