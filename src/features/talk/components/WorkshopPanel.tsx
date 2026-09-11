"use client";

import { X, Info, Check, Blocks, Play } from "lucide-react";
import { useMemo, useState, type DragEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GmailLogo, AzureLogo } from "@/features/edit-twyn/components/LoadoutCard";
import { WorkflowSourceIcon } from "@/features/shared/components/WorkflowSourceIcon";
import {
  TAB_LABELS,
  TAB_ORDER,
  type Provenance,
  type WorkshopItem,
  type WorkshopTab,
} from "../data/workshop";

const DND_TYPE = "application/x-twynity-workshop-item";

const BRAND_LOGO: Record<string, ReactNode> = {
  gmail: <GmailLogo />,
  azure: <AzureLogo />,
};

// Category color per tab — consistent with the edit-twyn loadout chips.
const TAB_ICON: Record<WorkshopTab, string> = {
  capabilities: "bg-violet-light text-violet",
  skills: "bg-skill-bg text-skill-text",
  interconnectors: "bg-amber text-amber-text",
  knowledge: "bg-mint text-mint-text",
  workflows: "bg-violet-light text-violet",
};

// Provenance filter (instead of a per-row badge that fights long titles):
// free (included) · built (workshop) · purchased (marketplace).
type ProvFilter = "all" | Provenance;
const PROV_FILTERS: { id: ProvFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "built", label: "Built" },
  { id: "purchased", label: "Purchased" },
  { id: "imported", label: "Imported" },
];

export function WorkshopPanel({
  catalog,
  equipped,
  connected,
  tab,
  onTabChange,
  onAdd,
  onRemove,
  onConnect,
  onDisconnect,
  onRunWorkflow,
  getTrigger,
  onOpenDetails,
  onClose,
}: {
  catalog: WorkshopItem[];
  equipped: Set<string>;
  connected: Set<string>;
  tab: WorkshopTab;
  onTabChange: (t: WorkshopTab) => void;
  onAdd: (item: WorkshopItem) => void;
  onRemove: (item: WorkshopItem) => void;
  onConnect: (item: WorkshopItem) => void;
  onDisconnect: (item: WorkshopItem) => void;
  /** Workflows tab only — run an equipped workflow (opens its run in the Canvas). */
  onRunWorkflow?: (item: WorkshopItem) => void;
  /** Workflows tab only — the trigger (/slash + phrase) shown on the row. */
  getTrigger?: (item: WorkshopItem) => { slash: string; phrase: string };
  /** Workflows tab only — open the details panel (source, trigger, schedule). */
  onOpenDetails?: (item: WorkshopItem) => void;
  onClose: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [prov, setProv] = useState<ProvFilter>("all");

  const items = useMemo(
    () =>
      catalog.filter(
        (i) => i.tab === tab && (prov === "all" || i.provenance === prov)
      ),
    [catalog, tab, prov]
  );

  const onDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData(DND_TYPE, id);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside className="flex h-full w-full shrink-0 flex-col overflow-hidden rounded-card border border-border bg-white lg:w-[420px]">
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-white px-5 py-3.5">
        <h2 className="flex items-center gap-1.5 font-heading text-[16px] font-bold tracking-[-0.3px] text-violet">
          <Blocks size={15} strokeWidth={2} />
          Equip
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close equip panel"
          className="grid h-7 w-7 place-items-center rounded-md text-gray-4 hover:bg-input-bg hover:text-dark"
        >
          <X size={14} />
        </button>
      </header>

      <div data-tour="tabs" className="shrink-0 border-b border-border px-5">
        <div className="flex items-center gap-6">
          {TAB_ORDER.map((t) => (
            <button
              key={t}
              type="button"
              data-tour={t === "workflows" ? "wf-tab" : undefined}
              onClick={() => onTabChange(t)}
              className={cn(
                "relative -mb-px border-b-2 py-3 text-[13px] font-semibold transition-colors",
                tab === t
                  ? "border-violet text-violet"
                  : "border-transparent text-gray-4 hover:text-dark"
              )}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-5 pt-3">
        <div className="inline-flex rounded-full bg-bg-input p-0.5">
          {PROV_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setProv(f.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                prov === f.id
                  ? "bg-white text-dark shadow-[0_1px_2px_rgba(15,15,30,0.08)]"
                  : "text-gray-4 hover:text-dark"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!dismissed && (
        <div className="mx-5 mt-3 flex shrink-0 items-start gap-2 rounded-[10px] bg-violet-light/70 px-3 py-2 text-[11.5px] leading-snug text-violet">
          <Info size={13} className="mt-0.5 shrink-0" />
          <span className="flex-1">
            Drag items into the chat to equip them, or click Add. Your slots
            are shown below the chat.
          </span>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="-mr-1 grid h-5 w-5 shrink-0 place-items-center rounded text-violet/70 hover:bg-violet/10 hover:text-violet"
          >
            <X size={11} />
          </button>
        </div>
      )}

      <div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-3">
        {items.length === 0 && (
          <p className="px-2 py-10 text-center text-[12.5px] text-gray-4">
            {prov === "purchased"
              ? "Nothing purchased yet — add assets from the Workshop."
              : "Nothing here yet."}
          </p>
        )}
        {items.map((item) => {
          // Interconnectors are added by default — the action is connect/disconnect
          // (OAuth), not add/remove. Everything else uses add/remove (equip).
          const isInterconnector = !!item.logo;
          const isEquipped = equipped.has(item.id);
          const isConnected = connected.has(item.id);
          // Equipped items read as "already added" (dimmed) — EXCEPT workflows,
          // which stay bright because equipped = runnable (the Run button is live).
          const dim = !isInterconnector && isEquipped && item.tab !== "workflows";
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              data-tour={
                item.logo
                  ? `ic-${item.logo}`
                  : item.id === "wf-morning-brief"
                    ? "wf-row"
                    : undefined
              }
              draggable={!isInterconnector && !isEquipped}
              onDragStart={(e) => onDragStart(e, item.id)}
              className={cn(
                "flex items-center gap-3 rounded-[12px] px-2.5 py-2.5 transition-colors",
                isInterconnector && isConnected && "bg-violet-light",
                dim && "opacity-50",
                !isInterconnector &&
                  !isEquipped &&
                  "hover:cursor-grab hover:bg-input-bg/60 active:cursor-grabbing"
              )}
            >
              {item.tab === "workflows" ? (
                <WorkflowSourceIcon platform={item.workflow?.platform} className="h-11 w-11 text-[17px]" />
              ) : item.logo ? (
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border border-border bg-white [&>svg]:h-[22px] [&>svg]:w-[22px]">
                  {BRAND_LOGO[item.logo]}
                </div>
              ) : (
                <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-[12px]", TAB_ICON[tab])}>
                  <Icon size={17} strokeWidth={1.8} />
                </div>
              )}
              {item.tab === "workflows" && onOpenDetails ? (
                <button
                  type="button"
                  onClick={() => onOpenDetails(item)}
                  className="group min-w-0 flex-1 text-left"
                >
                  <span className="flex items-center gap-1 truncate font-heading text-[14px] font-bold tracking-[-0.2px] text-dark group-hover:text-violet">
                    {item.name}
                    <Info size={12} className="shrink-0 text-gray-5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-gray-4">{item.description}</span>
                  {getTrigger && (
                    <span className="mt-1 inline-block rounded bg-bg-input px-1.5 py-0.5 font-sans text-[11px] font-semibold text-violet">
                      {getTrigger(item).slash}
                    </span>
                  )}
                </button>
              ) : (
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-heading text-[14px] font-bold tracking-[-0.2px] text-dark">{item.name}</span>
                  <div className="mt-0.5 truncate text-[12px] text-gray-4">{item.description}</div>
                </div>
              )}
              {isInterconnector ? (
                isConnected ? (
                  <button
                    type="button"
                    onClick={() => onDisconnect(item)}
                    className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-violet-mid bg-white px-3.5 text-[12px] font-semibold text-violet transition-colors hover:border-error hover:text-error"
                  >
                    <Check size={12} /> Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onConnect(item)}
                    className="h-8 shrink-0 rounded-full bg-violet px-4 text-[12px] font-bold text-white transition-colors hover:bg-violet-h"
                  >
                    Connect
                  </button>
                )
              ) : isEquipped && item.tab === "workflows" && onRunWorkflow ? (
                <button
                  type="button"
                  onClick={() => onRunWorkflow(item)}
                  className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-violet px-3.5 text-[12px] font-bold text-white transition-colors hover:bg-violet-h"
                >
                  <Play size={11} /> Run
                </button>
              ) : isEquipped ? (
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  className="h-8 shrink-0 rounded-full border border-border bg-white px-4 text-[12px] font-semibold text-gray-4 transition-colors hover:border-violet hover:text-violet"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onAdd(item)}
                  className="h-8 shrink-0 rounded-full bg-violet px-4 text-[12px] font-bold text-white transition-colors hover:bg-violet-h"
                >
                  Add
                </button>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export { DND_TYPE as WORKSHOP_DND_TYPE };
