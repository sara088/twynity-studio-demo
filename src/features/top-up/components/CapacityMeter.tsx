import { formatMb, type Budget } from "../lib/downgrade";

/**
 * One category's capacity against a tier — used on both sides of the same
 * interaction: Make Room (you're over the cap, pick what leaves) and My Archive
 * (you're under it, pick what comes back).
 *
 * It already reads as headroom rather than overage — "1 left", "50.5 MB left",
 * "Full" — which is exactly what restoring needs, so the two screens share this
 * verbatim instead of drifting apart.
 */
export function CapacityMeter({ budget: b }: { budget: Budget }) {
  const ok = b.over === 0;
  const fmt = (n: number) => (b.bySize ? formatMb(n) : String(n));
  // A tier that includes none of something has no meaningful ratio to draw.
  const notIncluded = b.limit === 0;
  const pct = notIncluded ? (b.used > 0 ? 100 : 0) : Math.min(100, (b.used / b.limit) * 100);
  // Rounded so a floating-point crumb doesn't render as "0.0 MB left".
  const headroom = Math.max(0, Math.round((b.limit - b.used) * 10) / 10);

  return (
    <div className={`rounded-[14px] border bg-white p-3.5 ${ok ? "border-border" : "border-amber-text/35"}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12.5px] font-semibold text-dark">{b.label}</span>
        <span
          className={`shrink-0 text-[12px] font-semibold tabular-nums ${ok ? "text-gray-3" : "text-amber-text"}`}
        >
          {notIncluded ? (b.used > 0 ? fmt(b.used) : "None") : `${fmt(b.used)} / ${fmt(b.limit)}`}
        </span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-input"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${b.label} usage`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${ok ? "bg-success" : "bg-amber-text/70"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {/* Headroom, not a verdict — the bar and the ratio already say whether it
          fits; what you can't see is how much room is left. */}
      <p className={`mt-1.5 text-[11.5px] ${ok ? "text-gray-4" : "font-semibold text-amber-text"}`}>
        {notIncluded && ok
          ? "Not included on this plan"
          : ok
            ? headroom === 0
              ? "Full"
              : `${fmt(headroom)} left`
            : `${fmt(b.over)} over`}
      </p>
    </div>
  );
}
