"use client";

import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckoutPayment } from "@/features/shared/components/CheckoutPayment";
import { clearTierPreview, isTierId, setTierId } from "@/features/shared/lib/tier";
import type { Plan } from "../data/mock-data";

// Upgrade + purchase a paid plan. Gold scales CHF 99–299 with usage; the upgrade
// starts at the entry monthly price. First purchase runs the add-card setup flow
// (shared CheckoutPayment), then one-click thereafter.
const PRICE = "CHF 99";

export function UpgradePlanModal({
  plan,
  onOpenChange,
}: {
  plan: Plan | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={plan !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-card p-7">
        {plan && (
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-heading text-[19px] font-semibold tracking-[-0.4px] text-dark">
                Upgrade to {plan.name}
              </DialogTitle>
              <DialogDescription className="text-[13px] text-gray-3">
                {plan.priceLabel} {plan.priceUnit} · cancel anytime.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-3">
              <div className="rounded-input border-[1.5px] border-violet bg-violet-light px-4 py-3">
                <div className="text-[13.5px] font-bold text-dark">{plan.name}</div>
                <div className="text-[11.5px] text-gray-4">{plan.tagline}</div>
              </div>

              <ul className="space-y-1.5">
                {plan.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[12.5px] leading-[1.4] text-gray-3">
                    <Check size={14} strokeWidth={2.5} className="mt-px shrink-0 text-violet" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="space-y-2 rounded-input bg-bg-input px-4 py-3">
                <div className="flex items-center justify-between text-[13px] text-gray-3">
                  <span>{plan.name} · monthly</span>
                  <span className="tabular-nums">{PRICE} / mo</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2.5">
                  <span className="text-[14px] font-semibold text-dark">Due today</span>
                  <span className="font-sans text-[17px] font-extrabold tracking-[-0.4px] text-dark tabular-nums">
                    {PRICE}
                  </span>
                </div>
              </div>

              {/* Payment is handled by Stripe — the button hands off to it. */}
              <CheckoutPayment
                variant="footer"
                onPay={() => {
                  // Actually move the workspace onto the plan. Without this the
                  // toast claimed the upgrade while every tier-aware surface
                  // (entitlements, plan CTAs, the switch flow) still read the
                  // old tier. Clearing the preview param stops a ?tier= URL
                  // from masking the change.
                  if (isTierId(plan.id)) {
                    setTierId(plan.id);
                    clearTierPreview();
                  }
                  onOpenChange(false);
                  toast.success(`You're on ${plan.name}`, {
                    description: `${PRICE}/mo — your virtual team is unlocked.`,
                  });
                }}
                onCancel={() => onOpenChange(false)}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
