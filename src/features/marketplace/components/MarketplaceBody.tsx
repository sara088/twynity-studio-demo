"use client";

import { useState } from "react";
import {
  MarketplaceModeProvider,
  type MarketplaceMode,
  type PurchaseItem,
  type ItemRef,
} from "./MarketplaceMode";
import { MarketplaceSections } from "./MarketplaceSections";
import { CategoryView, type MarketplaceCategory } from "./CategoryView";
import { SignUpGate } from "./SignUpGate";
import { PurchaseModal } from "./PurchaseModal";
import { MarketplaceItemModal } from "./MarketplaceItemModal";

// Wraps the marketplace with mode context. Signed-in: purchasing opens the
// purchase modal. Public: every action opens the sign-up gate instead. Clicking a
// card opens its detail (with "more like this"). With a `category`, renders that
// category's filterable "View All" page instead of the browse home.
export function MarketplaceBody({
  mode,
  category,
}: {
  mode: MarketplaceMode;
  category?: MarketplaceCategory;
}) {
  const [gateOpen, setGateOpen] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState<PurchaseItem | null>(null);
  const [detail, setDetail] = useState<ItemRef | null>(null);

  return (
    <MarketplaceModeProvider
      mode={mode}
      requireSignup={() => setGateOpen(true)}
      purchase={setPurchaseItem}
      viewItem={setDetail}
    >
      {category ? <CategoryView category={category} /> : <MarketplaceSections />}
      <SignUpGate open={gateOpen} onOpenChange={setGateOpen} />
      <PurchaseModal item={purchaseItem} onClose={() => setPurchaseItem(null)} />
      <MarketplaceItemModal item={detail} onChange={setDetail} onClose={() => setDetail(null)} />
    </MarketplaceModeProvider>
  );
}
