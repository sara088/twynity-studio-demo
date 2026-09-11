"use client";

import { useEffect, useState } from "react";
import { DEFAULT_TIER, TIERS, getTierId, onTierChanged, type Tier } from "@/features/shared/lib/tier";

// Current subscription tier, reactive to changes (?tier param, promo unlock,
// upgrade). Returns the resolved Tier and whether custom avatars are unlocked.
export function useTier(): { tier: Tier; hasCustom: boolean } {
  // Start from the server default to avoid hydration mismatch; sync on mount.
  const [id, setId] = useState(DEFAULT_TIER);
  useEffect(() => {
    const sync = () => setId(getTierId());
    sync();
    return onTierChanged(sync);
  }, []);
  const tier = TIERS[id];
  return { tier, hasCustom: tier.customAvatars > 0 };
}
