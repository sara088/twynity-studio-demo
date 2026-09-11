"use client";

import { useState } from "react";
import { Plus, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CheckoutPayment } from "@/features/shared/components/CheckoutPayment";

// À-la-carte top-up — quick presets or a custom amount, billed at a flat rate
// against the saved card after a confirm step (inspired by OpenAI/Claude credit
// top-ups). Credits are the unit; price is computed live.
const RATE = 0.04; // $/credit
const PRESETS = [100, 500, 1000];
const MIN_CREDITS = 50;
const MAX_CREDITS = 100000;

const priceFor = (min: number) => Math.round(min * RATE * 100) / 100;
const fmt$ = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

export function BuyCredits() {
  const [credits, setCredits] = useState(500);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const price = priceFor(credits);
  const valid = credits >= MIN_CREDITS && credits <= MAX_CREDITS;

  const confirm = () => {
    setConfirmOpen(false);
    toast.success(`Added ${credits.toLocaleString()} credits`, {
      description: `${fmt$(price)} paid securely via Stripe`,
    });
  };

  return (
    <section className="mt-5 rounded-[18px] border-[1.5px] border-border bg-white p-6">
      <h2 className="font-heading text-[18px] font-semibold tracking-[-0.3px] text-dark">
        Buy more credits
      </h2>
      <p className="mt-1 text-[12.5px] text-gray-3">
        Top up any time — a one-off boost on top of your plan. {fmt$(RATE)} / credit.
      </p>

      {/* Quick presets */}
      <div className="mt-5 flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const on = credits === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setCredits(p)}
              aria-pressed={on}
              className={cn(
                "rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold tabular-nums transition-colors",
                on
                  ? "border-violet bg-violet-light/50 text-violet"
                  : "border-border bg-white text-gray-3 hover:border-violet/40",
              )}
            >
              +{p.toLocaleString()} credits
            </button>
          );
        })}
      </div>

      {/* Custom amount + buy */}
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[0.08em] text-gray-5">
            Custom amount
          </span>
          <div className="flex items-center gap-2 rounded-input border-[1.5px] border-border bg-white px-3.5 focus-within:border-violet">
            <input
              type="number"
              min={MIN_CREDITS}
              max={MAX_CREDITS}
              step={10}
              value={Number.isNaN(credits) ? "" : credits}
              onChange={(e) => setCredits(parseInt(e.target.value, 10))}
              className="h-11 w-full bg-transparent text-[15px] font-semibold text-dark outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="shrink-0 text-[13px] font-medium text-gray-4">credits</span>
            <span className="shrink-0 border-l border-border pl-2.5 text-[14px] font-bold text-dark tabular-nums">
              {valid ? fmt$(price) : "—"}
            </span>
          </div>
        </label>

        <button
          type="button"
          disabled={!valid}
          onClick={() => setConfirmOpen(true)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-[12px] bg-violet px-5 text-[13.5px] font-bold text-white transition-colors hover:bg-violet-h disabled:cursor-not-allowed disabled:opacity-40 sm:w-[180px]"
        >
          <Plus size={15} strokeWidth={2.5} />
          {valid ? `Buy · ${fmt$(price)}` : "Buy"}
        </button>
      </div>
      {!valid && (
        <p className="mt-2 text-[11.5px] text-amber-text">
          Enter between {MIN_CREDITS} and {MAX_CREDITS.toLocaleString()} credits.
        </p>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-[420px] rounded-card p-7">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-heading text-[19px] font-semibold tracking-[-0.4px] text-dark">
              Confirm top-up
            </DialogTitle>
            <DialogDescription className="text-[13px] text-gray-3">
              Review the charge before we add the credits.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 rounded-input border-[1.5px] border-violet bg-violet-light px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-violet text-white">
                <Zap size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-bold text-dark">
                  +{credits.toLocaleString()} credits
                </div>
                <div className="text-[11.5px] text-gray-4">Added to your balance instantly</div>
              </div>
            </div>

            <div className="space-y-2 rounded-input bg-bg-input px-4 py-3">
              <div className="flex items-center justify-between text-[13px] text-gray-3">
                <span className="tabular-nums">{credits.toLocaleString()} credits × {fmt$(RATE)}</span>
                <span className="tabular-nums">{fmt$(price)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2.5">
                <span className="text-[14px] font-semibold text-dark">Total</span>
                <span className="font-sans text-[17px] font-extrabold tracking-[-0.4px] text-dark tabular-nums">
                  {fmt$(price)}
                </span>
              </div>
            </div>

            {/* Payment — first time adds a card, then one-click thereafter. */}
            <CheckoutPayment
              variant="footer"
              onPay={confirm}
              onCancel={() => setConfirmOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
