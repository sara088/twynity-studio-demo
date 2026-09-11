"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopUpPack } from "../data/mock-data";

export function TopUpPackCard({
  pack,
  onBuy,
}: {
  pack: TopUpPack;
  onBuy: (pack: TopUpPack) => void;
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-[16px] border bg-white p-6 transition-[border-color,box-shadow] duration-150",
        pack.popular
          ? "border-violet shadow-[0_10px_28px_rgba(108,92,231,0.10)]"
          : "border-border hover:border-violet/40"
      )}
    >
      {pack.popular && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-violet px-3 py-1 font-heading text-[9.5px] font-bold uppercase tracking-[0.14em] text-white">
          Most popular
        </span>
      )}

      <div className="font-heading text-[12px] font-bold uppercase tracking-[0.12em] text-violet">
        {pack.tier}
      </div>

      <div className="mt-2 font-sans text-[22px] font-bold tracking-[-0.4px] text-dark tabular-nums">
        + {pack.credits.toLocaleString()} credits
      </div>

      <div className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-3">
        <Clock size={13} className="text-gray-4" />
        Valid for {pack.validity}
      </div>

      <p className="mt-2 mb-5 text-[12.5px] text-gray-3">{pack.caption}</p>

      <div className="mb-6 flex items-baseline gap-1.5">
        <span className="font-sans text-[28px] font-bold leading-none tracking-[-0.6px] text-dark tabular-nums">
          ${pack.price}
        </span>
        {pack.unitPrice && (
          <span className="text-[11.5px] text-gray-4">{pack.unitPrice}</span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onBuy(pack)}
        className={cn(
          "mt-auto inline-flex h-[42px] items-center justify-center gap-1.5 rounded-[11px] px-3 text-[13px] font-bold transition-colors",
          pack.popular
            ? "bg-violet text-white hover:bg-violet-h"
            : "border-[1.5px] border-border bg-white text-violet hover:border-violet"
        )}
      >
        Buy this pass
      </button>
    </article>
  );
}
