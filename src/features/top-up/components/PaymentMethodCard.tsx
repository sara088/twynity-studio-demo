"use client";

import { ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PillButton } from "@/features/shared/components/PillButton";
import { BillingCard } from "./BillingCard";

// Card and billing details live entirely in Stripe — never on Twynity. This
// card points users to the Stripe customer portal to manage both.
export function PaymentMethodCard() {
  const openPortal = () =>
    toast("Opening Stripe…", {
      description: "You'd be taken to the secure Stripe customer portal.",
    });

  return (
    <BillingCard
      title="Payment & billing"
      description="Your card and billing details are stored securely by Stripe — never on Twynity."
      action={
        <PillButton variant="outline" size="sm" onClick={openPortal}>
          Manage in Stripe
        </PillButton>
      }
    >
      <button
        type="button"
        onClick={openPortal}
        className="mt-5 flex w-full items-center gap-4 rounded-[14px] border border-border bg-bg-input/40 px-5 py-4 text-left transition-colors hover:border-violet/40"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-violet-light text-violet">
          <ShieldCheck size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold text-dark">Managed by Stripe</span>
          <span className="mt-0.5 block text-[12px] text-gray-4">
            Add or update your payment method and billing details in the secure Stripe portal.
          </span>
        </span>
        <ExternalLink size={16} className="shrink-0 text-gray-5" />
      </button>
    </BillingCard>
  );
}
