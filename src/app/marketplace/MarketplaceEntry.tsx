"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { SupplyShell } from "@/features/shared/components/SupplyShell";
import { PublicMarketplaceHeader } from "@/features/marketplace/components/PublicMarketplaceHeader";
import { MarketplaceBody } from "@/features/marketplace/components/MarketplaceBody";
import type { MarketplaceCategory } from "@/features/marketplace/components/CategoryView";

// Marketplace has two modes: `?public` (logged-out) swaps the supply sidebar for
// a public header. The product reads that on the server; a static export has no
// request, so the check moves to the client. Same two modes, same chrome.
function Entry({ category }: { category?: MarketplaceCategory }) {
  const isPublic = useSearchParams().get("public") !== null;

  if (isPublic) {
    return (
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-bg-content">
        <PublicMarketplaceHeader />
        <div className="scrollbar-thin flex-1 overflow-y-auto px-7 pb-12 pt-[26px]">
          <MarketplaceBody mode="public" category={category} />
        </div>
      </div>
    );
  }

  return (
    <SupplyShell>
      <MarketplaceBody mode="signed-in" category={category} />
    </SupplyShell>
  );
}

export function MarketplaceEntry({ category }: { category?: MarketplaceCategory }) {
  return (
    <Suspense fallback={null}>
      <Entry category={category} />
    </Suspense>
  );
}
