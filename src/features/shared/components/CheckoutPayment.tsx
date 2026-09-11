"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { PillButton } from "@/features/shared/components/PillButton";

// Payment is handled entirely by Stripe — we never collect or store card details
// on-platform. This is the single "hand off to Stripe" step for every checkout:
// the order summary lives in the surrounding modal; here we just confirm and
// redirect. (Prototype: a brief "Redirecting…" then the success callback fires,
// standing in for the round-trip to Stripe Checkout.)
//   variant="footer"  — Secured note + [Cancel] [Pay] (inside confirm dialogs)
//   variant="stacked" — full-width Pay + centered Secured note (PurchaseModal)
export function CheckoutPayment({
  onPay,
  onCancel,
  variant = "footer",
  disabled = false,
}: {
  /** Fires after the (simulated) Stripe round-trip completes. */
  onPay: () => void;
  onCancel?: () => void;
  variant?: "footer" | "stacked";
  /** Block payment until a prerequisite is met (e.g. a video was provided). */
  disabled?: boolean;
}) {
  const [redirecting, setRedirecting] = useState(false);

  const pay = () => {
    if (redirecting || disabled) return;
    setRedirecting(true);
    // Hand off to Stripe Checkout; on return we complete the purchase.
    setTimeout(() => onPay(), 1100);
  };

  const secured = (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-5">
      <Lock size={12} /> Secured by Stripe
    </span>
  );

  if (variant === "stacked") {
    return (
      <div className="pt-0.5">
        <button
          type="button"
          onClick={pay}
          disabled={redirecting || disabled}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-violet py-3 text-[14.5px] font-bold text-white transition-colors hover:bg-violet-h disabled:cursor-not-allowed disabled:opacity-50"
        >
          {redirecting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
          {redirecting ? "Redirecting to Stripe…" : "Continue to payment"}
        </button>
        <p className="mt-2.5 text-center text-[11.5px] leading-[1.45] text-gray-5">
          You&apos;ll complete payment securely on Stripe.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      {secured}
      <div className="flex gap-2.5">
        {onCancel && (
          <PillButton type="button" variant="outline" size="sm" onClick={onCancel} disabled={redirecting}>
            Cancel
          </PillButton>
        )}
        <PillButton type="button" size="sm" onClick={pay} disabled={redirecting}>
          {redirecting ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Redirecting…
            </>
          ) : (
            "Continue to payment"
          )}
        </PillButton>
      </div>
    </div>
  );
}
