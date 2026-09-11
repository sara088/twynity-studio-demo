"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Search, Check, X, Sparkles, Store, Info, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PillButton } from "@/features/shared/components/PillButton";
import {
  CAPABILITIES,
  SKILLS,
  KNOWLEDGE,
  WORKFLOWS,
  INTERCONNECTORS,
  CHIP_COLORS,
  EQUIPPED_CAPABILITIES,
  EQUIPPED_SKILLS,
  EQUIPPED_WORKFLOWS,
  ASSIGNED_KNOWLEDGE,
} from "../data/loadout";
import { GmailLogo, AzureLogo } from "./LoadoutCard";
import { BrandIcon, hasBrandIcon } from "@/features/marketplace/components/BrandIcon";
import {
  getPurchases,
  onPurchasesChanged,
  type PurchasedItem,
} from "@/features/shared/lib/purchases";
import type { BrowseType } from "./EditTwynView";

const CATS: { id: BrowseType; label: string }[] = [
  { id: "workflows", label: "Workflows" },
  { id: "interconnectors", label: "Interconnectors" },
  { id: "skills", label: "Skills" },
  { id: "knowledge", label: "Knowledge" },
];
// Singular noun per category, for the info card's type label.
const TYPE_LABEL: Record<BrowseType, string> = {
  capabilities: "Capability",
  skills: "Skill",
  interconnectors: "Interconnector",
  knowledge: "Knowledge",
  workflows: "Workflow",
};

const SLOTS: Record<BrowseType, number> = { capabilities: 6, skills: 8, interconnectors: 8, knowledge: 10, workflows: 6 };
// Provenance filter (not a per-row badge — keeps long titles clean).
const SOURCE_TABS = ["All", "Free", "Built", "Purchased"];
const DEFAULTS: Record<BrowseType, string[]> = {
  capabilities: EQUIPPED_CAPABILITIES,
  skills: EQUIPPED_SKILLS,
  interconnectors: ["gmail", "azure"],
  knowledge: ASSIGNED_KNOWLEDGE,
  workflows: EQUIPPED_WORKFLOWS,
};
const LOGO: Record<string, ReactNode> = { gmail: <GmailLogo />, azure: <AzureLogo /> };

type CatItem = { id: string; name: string; desc: string; icon?: unknown };

function catalogFor(cat: BrowseType): CatItem[] {
  if (cat === "capabilities") return CAPABILITIES;
  if (cat === "skills") return SKILLS;
  if (cat === "knowledge") return KNOWLEDGE;
  if (cat === "workflows") return WORKFLOWS;
  return INTERCONNECTORS as CatItem[];
}

export function BrowseDrawer({
  category,
  twynId,
  defaultSource,
  onClose,
  onCategoryChange,
  equipped,
  onToggle,
  onOpenWorkflowDetails,
}: {
  category: BrowseType | null;
  twynId: string;
  defaultSource?: string;
  onClose: () => void;
  onCategoryChange: (c: BrowseType) => void;
  equipped: Record<BrowseType, string[]>;
  onToggle: (cat: BrowseType, id: string) => void;
  /** Workflows open the rich details dialog instead of the generic info card. */
  onOpenWorkflowDetails?: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [source, setSource] = useState("All");
  const [dragOver, setDragOver] = useState(false);
  const [detail, setDetail] = useState<CatItem | null>(null);
  const cat = category ?? "interconnectors";

  // When the drawer opens, honour a requested source tab (e.g. "Purchased").
  useEffect(() => {
    if (category !== null) setSource(defaultSource ?? "All");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Marketplace purchases for this twyn (the "Purchased" tab).
  const [purchases, setPurchases] = useState<PurchasedItem[]>([]);
  useEffect(() => {
    const load = () => setPurchases(getPurchases(twynId));
    load();
    return onPurchasesChanged(load);
  }, [twynId, category]);

  const purchasedFor = (c: BrowseType): CatItem[] =>
    purchases
      .filter((p) => p.type === c)
      .map((p) => ({ id: p.id, name: p.name, desc: p.description }));
  // Resolve any id (catalog or purchased) — used for the left-pane chips.
  const resolve = (c: BrowseType, id: string) =>
    catalogFor(c).find((x) => x.id === id) ??
    purchasedFor(c).find((x) => x.id === id);

  // Filter by provenance.
  const rows: CatItem[] =
    source === "Purchased"
      ? purchasedFor(cat)
      : source === "Free"
        ? catalogFor(cat).filter((i) => DEFAULTS[cat].includes(i.id))
        : source === "Built"
          ? catalogFor(cat).filter((i) => !DEFAULTS[cat].includes(i.id))
          : [...catalogFor(cat), ...purchasedFor(cat)];
  const items = rows.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));

  // Where an item came from — drives the info card's provenance badge.
  const provenanceOf = (id: string) =>
    purchasedFor(cat).some((p) => p.id === id)
      ? "Purchased"
      : DEFAULTS[cat].includes(id)
        ? "Free"
        : "Built";

  // Drag a catalog item onto the left loadout to equip it.
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    try {
      const { cat: c, id } = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (!equipped[c as BrowseType].includes(id)) onToggle(c, id);
    } catch {}
  };

  return (
    <>
    <Dialog open={category !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bd-drawer flex h-[90vh] w-[96vw] max-w-[96vw] flex-col gap-0 overflow-hidden rounded-card p-0 sm:max-w-[96vw]">
        <div className="flex h-full">
          {/* Left — current loadout (drop target) */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "hidden w-[42%] flex-col gap-5 overflow-y-auto border-r p-7 transition-colors lg:flex",
              dragOver ? "border-violet bg-violet-light" : "border-border bg-bg-input",
            )}
          >
            <div>
              <DialogTitle className="font-heading text-[20px] font-semibold tracking-[-0.4px] text-dark">
                What Sara has equipped
              </DialogTitle>
              <DialogDescription className="mt-1 text-[12.5px] leading-[1.5] text-gray-4">
                Each twyn has {SLOTS.interconnectors} interconnector slots, {SLOTS.skills} skill slots,{" "}
                {SLOTS.knowledge} knowledge slots. Add from the catalog, or × to swap out.
              </DialogDescription>
            </div>
            {CATS.map((c) => {
              const empties = Math.max(0, SLOTS[c.id] - equipped[c.id].length);
              return (
                <div key={c.id}>
                  <div className="mb-2 flex items-center justify-between border-b border-border pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-gray-5">
                    {c.label} <span className="font-sans">{equipped[c.id].length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {equipped[c.id].map((id) => {
                      const item = resolve(c.id, id);
                      if (!item) return null;
                      return (
                        <span key={id} className={cn("inline-flex h-[34px] items-center gap-1.5 rounded-chip border px-3.5 text-[13px] font-semibold", CHIP_COLORS[c.id])}>
                          {item.name}
                          <button type="button" onClick={() => onToggle(c.id, id)} aria-label={`Remove ${item.name}`} className="opacity-60 transition hover:text-error hover:opacity-100">
                            <X size={13} />
                          </button>
                        </span>
                      );
                    })}
                    {Array.from({ length: empties }).map((_, i) => (
                      <span key={i} className="inline-flex h-[34px] items-center rounded-chip border border-dashed border-gray-6 px-3.5 text-[12px] font-medium text-gray-5">
                        Empty slot
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right — catalog */}
          <div className="flex flex-1 flex-col overflow-hidden bg-white">
            <div className="border-b border-border p-7 pb-4">
              <h3 className="font-heading text-[20px] font-semibold tracking-[-0.4px] text-dark">Browse &amp; add</h3>
              <p className="mt-1 text-[12.5px] text-gray-4">
                Equip skills and connect interconnectors — all free, billed by usage.
              </p>

              {/* Row 1 — category tabs (underline style, matching the Equip panel) */}
              <div className="mt-4 flex items-center gap-6 border-b border-border">
                {CATS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onCategoryChange(c.id)}
                    className={cn(
                      "relative -mb-px flex items-center gap-1.5 border-b-2 py-2.5 text-[13px] font-semibold transition-colors",
                      cat === c.id ? "border-violet text-violet" : "border-transparent text-gray-4 hover:text-dark",
                    )}
                  >
                    {c.label}
                    <span className={cn("rounded-full px-1.5 font-sans text-[10px]", cat === c.id ? "bg-violet/12 text-violet" : "bg-bg-input text-gray-4")}>
                      {equipped[c.id].length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Row 2 — provenance filter (All / Free / Built / Purchased) */}
              <div className="mt-3 inline-flex gap-1 rounded-chip bg-bg-input p-1">
                {SOURCE_TABS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={cn(
                      "rounded-chip px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                      source === s ? "bg-white text-dark shadow-[0_1px_3px_rgba(15,15,30,0.08)]" : "text-gray-4 hover:text-dark",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="relative mt-3">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  className="h-10 w-full rounded-input border-[1.5px] border-border bg-bg-input pl-9 pr-3 text-[13px] text-dark outline-none transition-colors placeholder:text-gray-6 focus:border-violet"
                />
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-5" />
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-7 pt-4">
              {items.length === 0 && (
                <div className="grid place-items-center gap-2 py-16 text-center">
                  <Sparkles size={22} className="text-gray-5" />
                  <p className="text-[13px] font-semibold text-dark">
                    {source === "Purchased" ? "No purchases yet" : "Nothing here"}
                  </p>
                  <p className="max-w-[300px] text-[12.5px] text-gray-4">
                    {source === "Purchased"
                      ? "Buy in the marketplace and it shows up here, licensed to this twyn."
                      : "Try a different filter."}
                  </p>
                </div>
              )}
              {items.map((item) => {
                const on = equipped[cat].includes(item.id);
                const Icon = (item.icon as React.ComponentType<{ size?: number }> | undefined) ?? Sparkles;
                return (
                  <div
                    key={item.id}
                    draggable={!on}
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ cat, id: item.id }))}
                    className={cn(
                      "flex items-center gap-3 rounded-input border px-4 py-3 transition-colors",
                      on ? CHIP_COLORS[cat] : "cursor-grab border-border bg-white active:cursor-grabbing hover:border-violet/40",
                    )}
                  >
                    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-input", on ? "bg-white/70" : `${CHIP_COLORS[cat]} border-0`)}>
                      {cat === "interconnectors"
                        ? hasBrandIcon(item.id)
                          ? <BrandIcon logo={item.id} className="h-4 w-4" />
                          : (LOGO[item.id] ?? <Icon size={16} />)
                        : <Icon size={16} />}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        cat === "workflows" && onOpenWorkflowDetails
                          ? onOpenWorkflowDetails(item.id)
                          : setDetail(item)
                      }
                      className="group/info flex min-w-0 flex-1 items-center gap-1.5 text-left"
                      aria-label={`View details for ${item.name}`}
                    >
                      <span className="min-w-0">
                        <span className={cn("flex items-center gap-1 text-[13px] font-semibold", on ? "" : "text-dark")}>
                          <span className="truncate">{item.name}</span>
                          <Info size={12.5} className={cn("shrink-0 opacity-0 transition-opacity group-hover/info:opacity-100", on ? "" : "text-gray-5")} />
                        </span>
                        <span className={cn("block truncate text-[12px]", on ? "opacity-70" : "text-gray-4")}>{item.desc}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggle(cat, item.id)}
                      className={cn(
                        "inline-flex h-8 shrink-0 items-center gap-1 rounded-btn px-3.5 text-[12px] font-bold transition-colors",
                        on
                          ? "border border-violet-mid bg-white text-violet hover:border-error hover:text-error"
                          : "bg-violet text-white hover:bg-violet-h",
                      )}
                    >
                      {on ? (<><Check size={12} /> Remove</>) : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border p-5">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-3 transition-colors hover:text-violet"
              >
                <Store size={14} /> Browse marketplace
              </Link>
              <PillButton size="sm" onClick={onClose}>Done</PillButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <ItemDetailDialog
      item={detail}
      cat={cat}
      on={detail ? equipped[cat].includes(detail.id) : false}
      provenance={detail ? provenanceOf(detail.id) : "Free"}
      onToggle={() => detail && onToggle(cat, detail.id)}
      onClose={() => setDetail(null)}
    />
    </>
  );
}

// Focused info card for a single catalog item, shown over the browse drawer.
// Kept lightweight — the drawer's data is one-line, so this surfaces the full
// description, type, provenance, equip state, and a single clear action.
function ItemDetailDialog({
  item,
  cat,
  on,
  provenance,
  onToggle,
  onClose,
}: {
  item: CatItem | null;
  cat: BrowseType;
  on: boolean;
  provenance: string;
  onToggle: () => void;
  onClose: () => void;
}) {
  const Icon = (item?.icon as React.ComponentType<{ size?: number }> | undefined) ?? Sparkles;
  return (
    <Dialog open={item !== null} onOpenChange={(o) => !o && onClose()}>
      {item && (
        <DialogContent
          showCloseButton={false}
          overlayClassName="z-[600] bg-dark/50"
          className="z-[601] w-[min(440px,calc(100vw-32px))] gap-0 rounded-[20px] border-0 bg-white p-0 shadow-[0_32px_80px_rgba(15,15,30,0.24)]"
        >
          <div className="p-6">
            <div className="mb-4 flex items-start gap-3.5">
              <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-[16px]", CHIP_COLORS[cat])}>
                {cat === "interconnectors"
                  ? hasBrandIcon(item.id)
                    ? <BrandIcon logo={item.id} className="h-6 w-6" />
                    : (LOGO[item.id] ?? <Icon size={24} />)
                  : <Icon size={24} />}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <DialogTitle className="font-heading text-[19px] font-semibold leading-tight tracking-[-0.3px] text-dark">
                  {item.name}
                </DialogTitle>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-chip bg-bg-input px-2.5 py-1 text-[11px] font-semibold text-gray-3">
                    {TYPE_LABEL[cat]}
                  </span>
                  <span className="rounded-chip border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-4">
                    {provenance}
                  </span>
                  {cat === "interconnectors" && on && (
                    <span className="inline-flex items-center gap-1 rounded-chip bg-mint px-2.5 py-1 text-[11px] font-semibold text-mint-text">
                      <span className="h-1.5 w-1.5 rounded-full bg-mint-text" /> Connected
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg bg-bg-input text-gray-3 hover:bg-border hover:text-dark"
              >
                <X size={14} strokeWidth={2.2} />
              </button>
            </div>

            <DialogDescription className="mb-5 text-[13.5px] leading-[1.6] text-gray-3">
              {item.desc}
            </DialogDescription>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onToggle();
                  onClose();
                }}
                className={cn(
                  "inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-btn text-[13px] font-bold transition-colors",
                  on
                    ? "border border-violet-mid bg-white text-violet hover:border-error hover:text-error"
                    : "bg-violet text-white hover:bg-violet-h",
                )}
              >
                {on ? (<><Check size={14} /> Remove from twyn</>) : "Add to twyn"}
              </button>
              <Link
                href="/marketplace"
                className="inline-flex h-10 items-center gap-1 rounded-btn border border-border bg-white px-3.5 text-[12.5px] font-semibold text-gray-3 transition-colors hover:border-violet hover:text-violet"
              >
                Marketplace <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
