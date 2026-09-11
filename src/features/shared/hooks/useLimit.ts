"use client";

import { useEffect, useState } from "react";

// An account can be blocked two ways: its interaction credits are spent, or its
// subscription is over (a free trial is just a form of subscription in the
// backend — so this covers both a trial ending AND a paid plan lapsing; which
// one is shown depends on the tier). Neither auto-recovers. Driven by the URL
// (?limit=credits | ?limit=subscription; legacy ?limit=trial / ?credits=out
// still map through) so the dev State panel can demo it.
//
// This is the single source of truth for that state — the studio chat, the
// sidebar usage card, and the mobile nav all read it here, so a blocked account
// looks blocked everywhere at once (not just in the chat).
export type LimitState = "credits" | "subscription" | null;

export function readLimit(): LimitState {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  const lim = sp.get("limit");
  if (lim === "subscription" || lim === "trial") return "subscription";
  if (lim === "credits" || sp.get("credits") === "out") return "credits";
  return null;
}

export function useLimit(): LimitState {
  // Starts null (SSR) and resolves on mount from the URL, matching how the tier
  // preview works — a brief pre-hydration flash of the un-blocked state is fine.
  const [limit, setLimit] = useState<LimitState>(null);
  useEffect(() => {
    setLimit(readLimit());
  }, []);
  return limit;
}
