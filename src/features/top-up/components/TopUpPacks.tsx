"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TopUpPackCard } from "./TopUpPackCard";
import { TopUpConfirmModal } from "./TopUpConfirmModal";
import { TOP_UP_PACKS, type TopUpPack } from "../data/mock-data";

// Tiered passes + a confirm-total step that hands off to Stripe for payment.
export function TopUpPacks() {
  const [selected, setSelected] = useState<TopUpPack | null>(null);

  const confirm = (pack: TopUpPack) => {
    setSelected(null);
    toast.success(`${pack.tier} added — +${pack.credits.toLocaleString()} credits`, {
      description: `$${pack.price} paid via Stripe. Valid for ${pack.validity}.`,
    });
  };

  return (
    <>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TOP_UP_PACKS.map((pack) => (
          <TopUpPackCard key={pack.id} pack={pack} onBuy={setSelected} />
        ))}
      </div>

      <TopUpConfirmModal
        pack={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onConfirm={confirm}
      />
    </>
  );
}
