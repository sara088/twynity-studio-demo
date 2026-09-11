"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TAB_MAX,
  TAB_SLOT_LABEL,
  type WorkshopItem,
  type WorkshopTab,
} from "../data/workshop";

// Chip color per category — consistent with the loadout chips on the edit page.
const CHIP: Record<WorkshopTab, string> = {
  capabilities: "border-violet-mid text-violet hover:bg-violet/10",
  skills: "border-skill-border text-skill-text hover:bg-skill-bg",
  interconnectors: "border-amber-text/35 text-amber-text hover:bg-amber/40",
  knowledge: "border-mint-text/30 text-mint-text hover:bg-mint",
  workflows: "border-violet-mid text-violet hover:bg-violet/10",
};

// Keep the bar to a single row — show this many slot indicators, overflow the rest.
const CAP = 6;

export function EquippedBar({
  tab,
  equippedIds,
  getItem,
  onRemove,
}: {
  tab: WorkshopTab;
  equippedIds: string[];
  getItem: (id: string) => WorkshopItem | undefined;
  onRemove: (id: string) => void;
}) {
  const max = TAB_MAX[tab];
  const items = equippedIds
    .map(getItem)
    .filter((i): i is WorkshopItem => !!i && i.tab === tab);

  const shown = items.slice(0, CAP);
  const empties = Math.max(0, Math.min(max - items.length, CAP - shown.length));
  const hidden = Math.max(0, max - shown.length - empties);

  return (
    <div
      data-tour="slots"
      className="shrink-0 border-t border-border bg-violet-light/35 px-5 py-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-violet">
          {TAB_SLOT_LABEL[tab]}
        </span>
        <span className="text-[11px] font-semibold text-gray-4 tabular-nums">
          {items.length} / {max}
        </span>
      </div>
      <div className="flex flex-nowrap items-center gap-2 overflow-hidden">
        {shown.map((item) => (
          <span
            key={item.id}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] bg-white px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
              CHIP[item.tab]
            )}
          >
            {item.name}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.name}`}
              className="-mr-1 grid h-4 w-4 place-items-center rounded-full opacity-60 transition hover:text-error hover:opacity-100"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        {Array.from({ length: empties }).map((_, i) => (
          <span
            key={`empty-${i}`}
            aria-hidden
            className="inline-block h-7 w-7 shrink-0 rounded-full border-[1.5px] border-dashed border-gray-6"
          />
        ))}
        {hidden > 0 && (
          <span className="shrink-0 text-[12px] font-semibold text-gray-5 tabular-nums">
            +{hidden}
          </span>
        )}
      </div>
    </div>
  );
}
