"use client";

import { cn } from "@/lib/utils";
import { useLimit } from "../hooks/useLimit";
import { useTier } from "../hooks/useTier";
import { USAGE_SUMMARY } from "@/features/top-up/data/mock-data";

// Credit meter in the expanded sidebar. Reads the shared limit state so it turns
// into a clear "blocked" card the moment the account is out of credits or the
// subscription is over — the same signal the studio chat shows, kept in sync.
// A subscription-over state reads as a trial ending (free tier) or a paid plan
// lapsing (paid tier).
export function UsageCard({
  // Sidebar shows ONE combined number — monthly plan + topped-up (paid) credits
  // together. The per-bucket breakdown lives on the billing page.
  used = USAGE_SUMMARY.used + USAGE_SUMMARY.topUpUsed,
  total = USAGE_SUMMARY.total + USAGE_SUMMARY.topUpTotal,
}: {
  used?: number;
  total?: number;
}) {
  const limit = useLimit();
  const { tier } = useTier();
  const blocked = limit !== null;
  const isSub = limit === "subscription";
  const isPaid = tier.id !== "free-trial";

  // Blocked → the meter reads full (nothing left / subscription spent).
  const shownUsed = blocked ? total : used;
  const pct = Math.min(100, Math.round((shownUsed / total) * 100));
  const remaining = Math.max(0, total - shownUsed);

  const label = isSub ? (isPaid ? "Subscription" : "Free trial") : "Credits";
  const status = !blocked
    ? `${remaining} credits left`
    : isSub
      ? isPaid
        ? "Plan lapsed"
        : "Trial expired"
      : "Out of credits";
  const ctaLabel = !blocked ? "Top up" : isSub ? (isPaid ? "Reactivate" : "Choose plan") : "Upgrade";

  return (
    <div
      className={cn(
        "mb-2.5 rounded-[10px] border-[1.5px] bg-input-bg px-3 py-3",
        blocked ? "border-error/35" : "border-border"
      )}
    >
      <div className="mb-2 block">
        <div className="mb-1 font-heading text-[9.5px] font-semibold uppercase tracking-[0.14em] text-gray-5">
          {label}
        </div>
        {isSub ? (
          <div className="font-sans text-[15px] font-bold leading-none tracking-[-0.3px] text-error">
            {isPaid ? "Ended" : "Trial ended"}
          </div>
        ) : (
          <div className="font-sans text-[18px] font-bold leading-none tracking-[-0.4px] text-dark tabular-nums">
            {shownUsed}
            <span className="font-medium text-gray-4">/{total}</span>
          </div>
        )}
      </div>
      <div className="mb-2 h-[5px] overflow-hidden rounded-[3px] bg-border">
        <div
          className={cn(
            "h-full rounded-[3px] transition-[width] duration-300 ease-out",
            blocked ? "bg-error" : "bg-violet"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10.5px]">
        <span className={blocked ? "font-semibold text-error" : "text-gray-4"}>{status}</span>
        {/* Demo build: inert, like the rest of the rail. Nothing in a client
            walkthrough should lead into billing. */}
        <span className="cursor-default font-bold text-violet">{ctaLabel}</span>
      </div>
    </div>
  );
}
