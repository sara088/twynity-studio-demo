"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Check, ArrowLeft, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PLANS, type PlanTier } from "@/features/top-up/data/mock-data";

// Second step of the in-studio upgrade: after the two videos (consent +
// training) are captured, pick a plan and hand off to Stripe Checkout in a new
// tab. The Stripe session is server-created per plan — DEVS wire the real URL
// (this opens a placeholder). Tier flips on Stripe's return, so this doesn't
// mutate the tier itself.

// Self-serve upgrade targets that unlock a moving avatar. Teams is contact-sales.
const UPGRADE_PLAN_IDS: PlanTier[] = ["basic", "standard", "pro"];
// DEV PLACEHOLDER — replace with the server-created Stripe Checkout Session URL.
const STRIPE_CHECKOUT_URL = "https://checkout.stripe.com/";

export function UpgradePlansModal({
  open,
  onOpenChange,
  onBack,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Back to the two-video step. */
  onBack?: () => void;
}) {
  const [plan, setPlan] = useState<PlanTier>("standard");
  const [handedOff, setHandedOff] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPlan("standard");
    setHandedOff(false);
  }, [open]);

  const plans = PLANS.filter((p) => UPGRADE_PLAN_IDS.includes(p.id));
  const chosen = plans.find((p) => p.id === plan);

  const purchase = () => {
    // Hand off to Stripe in a new tab (devs wire the real session). Carry the
    // plan so the server can build the right checkout.
    window.open(`${STRIPE_CHECKOUT_URL}?plan=${plan}`, "_blank", "noopener,noreferrer");
    setHandedOff(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-card p-0 sm:max-w-[900px]">
        {/* Header */}
        <div className="border-b border-border px-7 pb-4 pt-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-violet-light text-violet">
              <Sparkles size={19} strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <DialogTitle className="font-heading text-[19px] font-bold tracking-[-0.4px] text-dark">
                Choose your plan
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[13px] leading-[1.5] text-gray-4">
                Your videos are ready — pick a plan and we&apos;ll build your moving avatar.
              </DialogDescription>
            </div>
            <span className="ml-auto hidden shrink-0 self-center rounded-full bg-bg-input px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-gray-5 sm:inline-block">
              Step 2 of 2
            </span>
          </div>
        </div>

        {handedOff ? (
          <div className="px-7 py-10 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mint text-mint-text">
              <ExternalLink size={22} />
            </span>
            <div className="mt-4 font-heading text-[18px] font-bold tracking-[-0.3px] text-dark">
              Complete your payment in the new tab
            </div>
            <p className="mx-auto mt-2 max-w-[440px] text-[13px] leading-[1.55] text-gray-4">
              We opened Stripe to finish your <span className="font-semibold text-dark">{chosen?.name}</span>{" "}
              upgrade securely. Once payment goes through, your avatar starts building right away.
            </p>
            <div className="mt-6 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full bg-dark px-6 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-gray-2"
              >
                Done
              </button>
              <button
                type="button"
                onClick={purchase}
                className="text-[12.5px] font-semibold text-violet hover:underline"
              >
                Reopen Stripe
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-7 py-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {plans.map((p) => {
                  const selected = plan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlan(p.id)}
                      className={cn(
                        "relative rounded-card border-[1.5px] p-5 text-left transition-colors",
                        selected ? "border-violet bg-violet-light/30" : "border-border hover:border-violet/40"
                      )}
                    >
                      {p.recommended && (
                        <span className="absolute -top-2.5 left-5 rounded-full bg-violet px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-white">
                          Recommended
                        </span>
                      )}
                      <span
                        className={cn(
                          "absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border-2 transition-colors",
                          selected ? "border-violet bg-violet text-white" : "border-border text-transparent"
                        )}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <div className="font-heading text-[16px] font-bold tracking-[-0.2px] text-dark">{p.name}</div>
                      <div className="mt-1.5 font-sans text-[19px] font-extrabold tracking-[-0.4px] text-dark tabular-nums">
                        {p.priceLabel}
                        <small className="ml-0.5 text-[11.5px] font-medium tracking-normal text-gray-4">{p.priceUnit}</small>
                      </div>
                      <div className="mt-3 h-px bg-border" />
                      <ul className="mt-3 space-y-2">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-[12px] leading-[1.4] text-gray-2">
                            <Check size={13} strokeWidth={2.6} className="mt-0.5 shrink-0 text-violet" /> {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
              <p className="mt-5 text-center text-[12.5px] text-gray-4">
                Need a team plan?{" "}
                <Link href="/plans" className="font-semibold text-violet hover:underline">
                  See all plans
                </Link>
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border px-7 py-4">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-semibold text-gray-3 transition-colors hover:text-dark"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={purchase}
                  className="inline-flex items-center gap-1.5 rounded-full bg-violet px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-violet-h"
                >
                  Continue to payment <ExternalLink size={14} />
                </button>
                <span className="text-[10.5px] text-gray-5">Secured by Stripe · opens in a new tab</span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
