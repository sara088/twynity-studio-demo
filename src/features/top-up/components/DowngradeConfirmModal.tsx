"use client";

import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TIERS, type TierId } from "@/features/shared/lib/tier";
import { allAssets, budgetsFor, formatMb, PERIOD_END_LABEL } from "../lib/downgrade";

// Scenario 1: everything already fits the target tier, so there's nothing to
// choose — just confirm. We still show what the new tier holds, because "it
// fits" is only reassuring if you can see the numbers behind it.
export function DowngradeConfirmModal({
  to,
  onCancel,
  onConfirm,
}: {
  to: TierId | null;
  onCancel: () => void;
  onConfirm: (to: TierId) => void;
}) {
  if (!to) return null;
  const target = TIERS[to];
  const budgets = budgetsFor(allAssets(), target);

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-[440px] gap-0 p-0">
        <DialogHeader className="space-y-1 border-b border-border p-5">
          <DialogTitle className="font-heading text-[17px] font-semibold tracking-[-0.3px] text-dark">
            Downgrade to {target.name}?
          </DialogTitle>
          <DialogDescription className="text-[12.5px] leading-relaxed text-gray-4">
            Your plan changes on {PERIOD_END_LABEL}. You keep {target.name}&apos;s limits from that
            date — everything you have today fits, so nothing is archived.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 p-5">
          {budgets.map((b) => (
            <li key={b.kind} className="flex items-center gap-2.5 text-[12.5px] text-gray-2">
              <Check size={15} className="shrink-0 text-mint-text" strokeWidth={2.5} />
              <span className="flex-1">{b.label}</span>
              <span className="tabular-nums text-gray-4">
                {b.bySize ? `${formatMb(b.used)} / ${formatMb(b.limit)}` : `${b.used} / ${b.limit}`}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button variant="outline" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="md" onClick={() => onConfirm(to)}>
            Schedule downgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
