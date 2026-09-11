"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, TriangleAlert, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TWYNS } from "@/features/my-twyns/data/mock-data";
import { CheckoutPayment } from "@/features/shared/components/CheckoutPayment";
import { addPurchase } from "@/features/shared/lib/purchases";
import { STARTER_PACKS, SKILLS, INTERCONNECTORS } from "@/features/marketplace/data/mock-data";
import type { PurchaseItem } from "./MarketplaceMode";

type Step = "assign" | "checkout";

// Marketplace purchase flow. A license is bought per twyn and is non-transferable.
// Two steps:
//   1. Assign — multi-select which of your twyns get a license (price scales with
//      the count); an explicit non-transferable warning.
//   2. Checkout — confirm the twyns, scaled total, and saved card, then pay.
export function PurchaseModal({
  item,
  onClose,
}: {
  item: PurchaseItem | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("assign");
  // A license is bought per twyn — pick one or many; the price scales with count.
  const [twynIds, setTwynIds] = useState<string[]>([]);

  useEffect(() => {
    if (item) {
      setStep("assign");
      setTwynIds([]);
    }
  }, [item]);

  if (!item) return null;
  const selected = TWYNS.filter((t) => twynIds.includes(t.id));
  const count = selected.length;
  const total = item.pricePerYear * count;

  const toggle = (id: string) =>
    setTwynIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  // Demo: one twyn already owns whatever you're buying — shown grayed out and
  // not selectable (you can't buy the same asset for it twice).
  const ownsItem = (id: string) => id === "priya";

  const purchase = () => {
    if (count === 0) return;
    const bought = item;
    if (bought.type === "packs") {
      // A pack is a bundle — fan its component skills & interconnectors out to the
      // chosen twyns so they show up individually in each twyn editor.
      const pack = STARTER_PACKS.find((p) => p.id === bought.id);
      for (const id of pack?.components.skillIds ?? []) {
        const s = SKILLS.find((x) => x.id === id);
        if (s) addPurchase(twynIds, { id: s.id, name: s.name, description: s.description, type: "skills", pricePerYear: s.pricePerYear });
      }
      for (const id of pack?.components.interconnectorIds ?? []) {
        const i = INTERCONNECTORS.find((x) => x.id === id);
        if (i) addPurchase(twynIds, { id: i.id, name: i.name, description: i.description, type: "interconnectors", pricePerYear: i.pricePerYear });
      }
    } else {
      addPurchase(twynIds, {
        id: bought.id,
        name: bought.name,
        description: bought.description,
        type: bought.type,
        pricePerYear: bought.pricePerYear,
      });
    }
    onClose();
    // Packs fan out into individual assets; deep-link to a tab that exists in the
    // editor (the twyn editor has no "packs" tab).
    const cat = bought.type === "packs" ? "interconnectors" : bought.type;
    // One toast per twyn, stacked — each lets you jump to that twyn's editor.
    for (const t of selected) {
      toast.custom(
        (id) => (
          <div className="flex w-[380px] items-center gap-3 rounded-card border border-border bg-white p-3.5 shadow-[0_16px_44px_rgba(15,15,30,0.16)]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint text-mint-text">
              <Check size={16} strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-bold tracking-[-0.2px] text-dark">
                {bought.name} purchased
              </div>
              <div className="mt-0.5 truncate text-[12px] text-gray-4">Bound to {t.name}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(id);
                router.push(`/my-twyns/${t.id}?show=purchased&cat=${cat}`);
              }}
              className="shrink-0 rounded-full border border-border bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-dark transition-colors hover:border-violet hover:text-violet"
            >
              View
            </button>
          </div>
        ),
        { duration: 8000 }
      );
    }
  };

  return (
    <Dialog open={item !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-[424px] gap-0 p-0"
      >
        {/* Header */}
        <DialogHeader className="flex-row items-start justify-between gap-3 space-y-0 px-6 pt-6 pb-0">
          <div className="flex min-w-0 items-center gap-2.5">
            {step === "checkout" && (
              <button
                type="button"
                onClick={() => setStep("assign")}
                aria-label="Back to assign"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bg-input text-gray-3 transition-colors hover:bg-border hover:text-dark"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="min-w-0">
              <DialogTitle className="truncate font-heading text-[19px] font-semibold tracking-[-0.4px] text-dark">
                {item.name}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[12.5px] text-gray-4">
                {step === "assign"
                  ? `${item.typeLabel} · $${item.pricePerYear}/year`
                  : "Confirm & pay"}
              </DialogDescription>
            </div>
          </div>
          <DialogClose className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bg-input text-gray-4 outline-none transition-colors hover:bg-border hover:text-dark focus-visible:ring-2 focus-visible:ring-violet/40">
            <X size={16} />
          </DialogClose>
        </DialogHeader>

        {/* Slim progress */}
        <div className="px-6 pt-5">
          <div className="flex gap-1.5">
            <span className="h-[3px] flex-1 rounded-full bg-violet" />
            <span className={cn("h-[3px] flex-1 rounded-full", step === "checkout" ? "bg-violet" : "bg-border")} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10.5px] font-bold uppercase tracking-[0.1em]">
            <span className={step === "assign" ? "text-violet" : "text-gray-4"}>Assign to twyns</span>
            <span className={step === "checkout" ? "text-violet" : "text-gray-4"}>Confirm &amp; pay</span>
          </div>
        </div>

        {step === "assign" ? (
          <div className="space-y-4 px-6 pb-6 pt-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-5">
              Assign to your twyns — one license each
            </p>
            <div className="scrollbar-thin max-h-[244px] space-y-2 overflow-y-auto">
              {TWYNS.map((t) => {
                // A twyn that already owns this asset can't buy it again — shown
                // grayed out and disabled.
                const ownsIt = ownsItem(t.id);
                const on = twynIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={ownsIt}
                    onClick={() => !ownsIt && toggle(t.id)}
                    aria-pressed={on}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-input border-[1.5px] px-3 py-2.5 text-left transition-colors",
                      ownsIt
                        ? "cursor-not-allowed border-border bg-bg-input/50 opacity-60"
                        : on
                          ? "border-violet bg-violet-light"
                          : "border-border bg-white hover:border-violet/40",
                    )}
                  >
                    <Image
                      src={t.portrait}
                      alt=""
                      width={36}
                      height={36}
                      className={cn(
                        "h-9 w-9 shrink-0 rounded-full bg-violet-mid object-cover object-top",
                        ownsIt && "grayscale",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-dark">{t.name}</span>
                      <span className="block truncate text-[11.5px] text-gray-4">{t.role}</span>
                    </span>
                    {ownsIt ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-mint-text">
                        <Check size={10} strokeWidth={3} /> Owned
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border-[1.5px] transition-colors",
                          on ? "border-violet bg-violet text-white" : "border-gray-6",
                        )}
                      >
                        {on && <Check size={12} strokeWidth={3} />}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Non-transferable warning — compact, softer */}
            <div className="flex gap-2.5 rounded-input border border-amber-text/15 bg-amber/55 px-3.5 py-3">
              <TriangleAlert size={15} className="mt-px shrink-0 text-amber-text" />
              <p className="text-[12.5px] leading-[1.5] text-amber-text">
                <span className="font-bold">Non-transferable.</span>{" "}
                Each license is permanently bound to its twyn and can&apos;t be moved later.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep("checkout")}
              disabled={count === 0}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-violet py-3 text-[14.5px] font-bold text-white transition-colors hover:bg-violet-h disabled:cursor-not-allowed disabled:opacity-40"
            >
              {count === 0 ? "Select a twyn" : `Continue · $${total}/yr`}
              {count > 0 && <span aria-hidden>→</span>}
            </button>
          </div>
        ) : (
          <div className="space-y-3 px-6 pb-6 pt-5">
            {/* Selected twyns */}
            <div className="rounded-input border-[1.5px] border-violet bg-violet-light px-3.5 py-3">
              <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-violet">
                {count} {count === 1 ? "twyn" : "twyns"} · one license each
              </div>
              <div className="flex flex-col gap-2">
                {selected.map((t) => (
                  <div key={t.id} className="flex items-center gap-2.5">
                    <Image
                      src={t.portrait}
                      alt=""
                      width={28}
                      height={28}
                      className="h-7 w-7 shrink-0 rounded-full bg-violet-mid object-cover object-top"
                    />
                    <span className="truncate text-[13px] font-semibold text-dark">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order summary — scales with the number of twyns */}
            <div className="space-y-2 rounded-input bg-bg-input px-4 py-3">
              <div className="flex items-center justify-between text-[13px] text-gray-3">
                <span>{item.name} · ${item.pricePerYear}/yr each</span>
                <span className="tabular-nums">× {count}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2.5">
                <span className="text-[14px] font-semibold text-dark">Total</span>
                <span className="font-inter text-[17px] font-extrabold tracking-[-0.4px] text-dark tabular-nums">
                  ${total}/yr
                </span>
              </div>
            </div>

            <p className="flex items-start gap-1.5 px-0.5 text-[11.5px] leading-[1.45] text-amber-text">
              <TriangleAlert size={13} className="mt-px shrink-0" />
              Each license is permanently bound to its twyn — can&apos;t be transferred later.
            </p>

            {/* Payment is handled by Stripe — the button hands off to it. */}
            <CheckoutPayment variant="stacked" onPay={purchase} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
