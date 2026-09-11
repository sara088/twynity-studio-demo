"use client";

import { createContext, useContext } from "react";
import type { PurchaseType } from "@/features/shared/lib/purchases";

export type MarketplaceMode = "signed-in" | "public";

export type PurchaseItem = {
  id: string;
  name: string;
  description: string;
  type: PurchaseType;
  typeLabel: string;
  pricePerYear: number;
};

/** Reference to a catalog item, for opening its detail card. `from` lets a
 * detail remember where it was opened from (e.g. a pack) for a Back button. */
export type ItemRef = {
  type: "skills" | "interconnectors" | "starter-packs";
  id: string;
  from?: ItemRef;
};

type Ctx = {
  mode: MarketplaceMode;
  /** Public mode: gate any add/purchase/hire action behind sign-up. */
  requireSignup: () => void;
  /** Signed-in: open the purchase modal for an item. */
  purchase: (item: PurchaseItem) => void;
  /** Open the item's detail card (with "more like this"). */
  viewItem: (ref: ItemRef) => void;
};

const MarketplaceModeContext = createContext<Ctx>({
  mode: "signed-in",
  requireSignup: () => {},
  purchase: () => {},
  viewItem: () => {},
});

export function MarketplaceModeProvider({
  mode,
  requireSignup,
  purchase,
  viewItem,
  children,
}: Ctx & { children: React.ReactNode }) {
  return (
    <MarketplaceModeContext.Provider value={{ mode, requireSignup, purchase, viewItem }}>
      {children}
    </MarketplaceModeContext.Provider>
  );
}

export function useMarketplaceMode() {
  return useContext(MarketplaceModeContext);
}
