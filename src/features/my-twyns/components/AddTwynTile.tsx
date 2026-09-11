import Link from "next/link";
import { Plus } from "lucide-react";

// "Add another twyn" tile — same footprint as a twyn card, visually distinct
// (dashed). Extra twyns are a paid add-on ($5/month each).
export function AddTwynTile() {
  return (
    <Link
      href="/onboarding?add=1"
      className="group flex min-h-[360px] flex-col items-center justify-center rounded-card border-[1.5px] border-dashed border-gray-6 bg-bg-input px-[22px] py-8 text-center transition-[border-color,background] duration-150 hover:border-violet hover:bg-violet-light"
    >
      <span className="mb-[14px] grid h-14 w-14 place-items-center rounded-input border border-border bg-white text-violet transition-colors group-hover:border-violet">
        <Plus size={28} strokeWidth={2} />
      </span>
      <span className="mb-1.5 font-heading text-[18px] font-semibold tracking-[-0.4px] text-dark">
        Add another twyn
      </span>
      <span className="max-w-[240px] text-[13px] leading-[1.5] text-gray-3">
        A different version of you for a different role. Same accountability,
        separate engagements.
      </span>
      <span className="mt-4 inline-flex items-baseline gap-1 rounded-full border border-violet-mid bg-white px-3.5 py-1.5 font-heading text-[14px] font-bold text-violet">
        $5
        <span className="text-[11.5px] font-semibold text-gray-4">/ month</span>
      </span>
    </Link>
  );
}
