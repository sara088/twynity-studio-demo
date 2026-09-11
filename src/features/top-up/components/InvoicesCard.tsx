"use client";

import { toast } from "sonner";
import { Download } from "lucide-react";
import { BillingCard } from "./BillingCard";
import { INVOICES } from "../data/mock-data";

export function InvoicesCard() {
  return (
    <BillingCard
      title="Billing history"
      description="Past charges. Download a receipt anytime."
    >
      <div className="mt-4 divide-y divide-border">
        {INVOICES.map((inv) => (
          <div key={inv.id} className="flex items-center gap-4 py-3">
            <div className="w-[92px] shrink-0 text-[12.5px] font-medium text-gray-4 tabular-nums">
              {inv.date}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-dark">{inv.description}</div>
              <div className="text-[11.5px] text-gray-5">{inv.number}</div>
            </div>
            <span className="shrink-0 rounded-full bg-mint px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-mint-text">
              {inv.status}
            </span>
            <div className="w-[60px] shrink-0 text-right text-[13px] font-bold text-dark tabular-nums">
              ${inv.amount.toFixed(2)}
            </div>
            <button
              type="button"
              onClick={() => toast.success(`Receipt ${inv.number} downloaded`)}
              aria-label={`Download receipt ${inv.number}`}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-border text-gray-4 transition-colors hover:border-violet hover:text-violet"
            >
              <Download size={14} />
            </button>
          </div>
        ))}
      </div>
    </BillingCard>
  );
}
