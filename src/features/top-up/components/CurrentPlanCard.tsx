import Link from "next/link";
import { ArrowRight, Check, Rocket } from "lucide-react";
import { PLANS, USAGE_SUMMARY } from "../data/mock-data";

// Compact "you're on this plan" summary that leads the Plans page — the plan,
// its price, and a live usage meter — so the current state reads at a glance
// without scrolling the full tier comparison.
export function CurrentPlanCard() {
  const plan = PLANS.find((p) => p.current) ?? PLANS[0];
  const { used, total, resetsOn } = USAGE_SUMMARY;
  const pct = Math.min(100, Math.round((used / total) * 100));

  return (
    <section className="rounded-[18px] border-[1.5px] border-border bg-white p-6">
      {/* Header — plan identity + current badge */}
      <div className="flex items-start gap-3.5">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-violet-light text-violet">
          <Rocket size={23} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-[19px] font-bold tracking-[-0.3px] text-dark">
              {plan.name}
            </h2>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-mint-text">
              <Check size={10} strokeWidth={3} /> Current plan
            </span>
          </div>
          <p className="mt-0.5 text-[12.5px] text-gray-4">
            <span className="font-semibold text-gray-2">{plan.priceLabel}</span> · {plan.priceUnit}
          </p>
        </div>
      </div>

      {/* Usage meter */}
      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-end justify-between">
          <span className="text-[12px] font-semibold text-gray-3">AI credits this month</span>
          <span className="font-sans text-[13px] font-bold tabular-nums text-dark">
            {used} <span className="font-medium text-gray-4">/ {total}</span>
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-input">
          <div className="h-full rounded-full bg-violet" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[11.5px] text-gray-4">Resets {resetsOn}</span>
          <Link
            href="/top-up"
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-violet hover:underline"
          >
            Top up credits <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}
