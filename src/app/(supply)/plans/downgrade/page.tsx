"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { DowngradeSelection } from "@/features/top-up/components/DowngradeSelection";
import { TIERS, canSwitchTo, type TierId } from "@/features/shared/lib/tier";
import { useTier } from "@/features/shared/hooks/useTier";

// The paused half of a downgrade (story: scenarios 2 and 3). Reached from the
// plans page only when the workspace doesn't fit the target tier; the tier is
// in the URL so the step is linkable and survives a refresh.
export default function DowngradePage() {
  // `useSearchParams` bails out of prerendering without a boundary.
  return (
    <Suspense fallback={null}>
      <DowngradeRoute />
    </Suspense>
  );
}

function DowngradeRoute() {
  const raw = useSearchParams().get("to");
  const { tier } = useTier();
  const to = raw && raw in TIERS ? (raw as TierId) : null;

  // The URL is user-editable, so re-check here rather than trusting the caller:
  // the trial is entry-only and the current plan isn't a switch.
  if (!to || !canSwitchTo(tier.id, to)) {
    return (
      <div className="mx-auto max-w-[520px] pt-12 text-center">
        <h1 className="font-heading text-[20px] font-bold text-dark">
          {to && TIERS[to].trial ? "The free trial can't be switched back to" : "Nothing to switch to"}
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-gray-3">
          {to && TIERS[to].trial
            ? "The trial is a one-time introduction. To stop paying, cancel your subscription from billing instead."
            : "Pick a plan from the plans page to start a switch."}
        </p>
        <Link
          href="/plans"
          className="mt-5 inline-flex rounded-btn bg-violet px-4 py-2 text-[13.5px] font-semibold text-white hover:bg-violet-h"
        >
          Back to plans
        </Link>
      </div>
    );
  }

  return <DowngradeSelection to={to} />;
}
