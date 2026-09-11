"use client";

import { Clock, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckoutPayment } from "@/features/shared/components/CheckoutPayment";
import type { TopUpPack } from "../data/mock-data";

// Confirm the exact charge, then hand off to Stripe to collect payment (we never
// see card details on-platform).
export function TopUpConfirmModal({
  pack,
  onOpenChange,
  onConfirm,
}: {
  pack: TopUpPack | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (pack: TopUpPack) => void;
}) {
  return (
    <Dialog open={pack !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] rounded-card p-7">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-heading text-[19px] font-semibold tracking-[-0.4px] text-dark">
            Confirm top-up
          </DialogTitle>
          <DialogDescription className="text-[13px] text-gray-3">
            Review the charge before we add the credits.
          </DialogDescription>
        </DialogHeader>

        {pack && (
          <div className="mt-5 space-y-3">
            {/* Selected pass */}
            <div className="flex items-center gap-3 rounded-input border-[1.5px] border-violet bg-violet-light px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-violet text-white">
                <Zap size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold text-dark">
                  {pack.tier} · +{pack.credits.toLocaleString()} credits
                </div>
                <div className="inline-flex items-center gap-1 text-[11.5px] text-gray-4">
                  <Clock size={11} /> Valid for {pack.validity} after purchase
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="space-y-2 rounded-input bg-bg-input px-4 py-3">
              <div className="flex items-center justify-between text-[13px] text-gray-3">
                <span>{pack.tier}</span>
                <span className="tabular-nums">${pack.price}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2.5">
                <span className="text-[14px] font-semibold text-dark">Total</span>
                <span className="font-sans text-[17px] font-extrabold tracking-[-0.4px] text-dark tabular-nums">
                  ${pack.price}
                </span>
              </div>
            </div>

            <p className="px-0.5 text-[11.5px] leading-[1.45] text-gray-4">
              Credits are added instantly and expire {pack.validity} after purchase.
            </p>

            <CheckoutPayment
              variant="footer"
              onPay={() => onConfirm(pack)}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
