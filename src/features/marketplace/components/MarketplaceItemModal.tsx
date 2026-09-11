"use client";

import { ArrowLeft, Check, CreditCard, Package, Sparkles, TriangleAlert, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { INDUSTRY_TONE } from "@/features/shared/data/industries";
import {
  SKILLS,
  INTERCONNECTORS,
  STARTER_PACKS,
  type SkillItem,
  type Interconnector,
  type StarterPack,
} from "../data/mock-data";
import { BrandIcon } from "./BrandIcon";
import { PackGlyph } from "./PackArt";
import { VerifiedBadge } from "./VerifiedBadge";
import { useMarketplaceMode, type ItemRef } from "./MarketplaceMode";

const TYPE_LABEL = {
  skills: "Skill",
  interconnectors: "Interconnector",
  "starter-packs": "Starter Pack",
} as const;

const BRAND_LOGOS = new Set([
  "slack", "notion", "linear", "github", "figma", "gmail", "drive", "calendar",
  "hubspot", "zendesk", "intercom", "jira", "stripe", "quickbooks",
]);

// Real brand glyphs render in full colour on a light tile.
const PLAIN_BG: Record<string, string | undefined> = {};

type SimpleType = "skills" | "interconnectors";
type Item = SkillItem | Interconnector;

function pool(type: SimpleType): Item[] {
  if (type === "skills") return SKILLS;
  return INTERCONNECTORS;
}

function lookup(type: SimpleType, id: string): Item | undefined {
  return pool(type).find((x) => x.id === id);
}

// Icon box for an item — interconnector uses its brand glyph (or industry
// monogram); skill an industry-tinted lucide icon.
function ItemIcon({ type, item, size }: { type: SimpleType; item: Item; size: "lg" | "sm" }) {
  const box = size === "lg" ? "h-12 w-12 rounded-[13px]" : "h-9 w-9 rounded-[9px]";
  if (type === "interconnectors" && BRAND_LOGOS.has((item as Interconnector).logo)) {
    return (
      <div
        className={cn("grid shrink-0 place-items-center border border-border", box)}
        style={{ background: PLAIN_BG[(item as Interconnector).logo] ?? "#FAFAFE" }}
      >
        <BrandIcon logo={(item as Interconnector).logo} className={size === "lg" ? "h-6 w-6" : "h-[18px] w-[18px]"} />
      </div>
    );
  }
  if (type === "skills") {
    const SkillIcon = (item as SkillItem).icon;
    return (
      <div className={cn("grid shrink-0 place-items-center", box, INDUSTRY_TONE[item.industry])}>
        <SkillIcon size={size === "lg" ? 24 : 18} strokeWidth={1.9} />
      </div>
    );
  }
  return (
    <div className={cn("grid shrink-0 place-items-center font-heading font-bold", box, INDUSTRY_TONE[item.industry], size === "lg" ? "text-[19px]" : "text-[15px]")}>
      {item.name[0]}
    </div>
  );
}

// Top bar shared by both detail views: an optional Back button on the left and
// the close X on the right, on one aligned row with consistent padding.
function ModalTopBar({ backLabel, onBack }: { backLabel?: string; onBack?: () => void }) {
  return (
    <div className={cn("mb-5 flex items-center gap-3", backLabel ? "justify-between" : "justify-end")}>
      {backLabel && (
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12.5px] font-semibold text-gray-3 outline-none transition-colors hover:bg-bg-input hover:text-violet focus-visible:ring-2 focus-visible:ring-violet/40"
        >
          <ArrowLeft size={15} /> {backLabel}
        </button>
      )}
      <DialogClose className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bg-input text-gray-4 outline-none transition-colors hover:bg-border hover:text-dark focus-visible:ring-2 focus-visible:ring-violet/40">
        <X size={16} />
        <span className="sr-only">Close</span>
      </DialogClose>
    </div>
  );
}

export function MarketplaceItemModal({
  item: ref,
  onChange,
  onClose,
}: {
  item: ItemRef | null;
  onChange: (ref: ItemRef) => void;
  onClose: () => void;
}) {
  const pack = ref?.type === "starter-packs" ? STARTER_PACKS.find((p) => p.id === ref.id) : undefined;
  const simpleType = ref && ref.type !== "starter-packs" ? (ref.type as SimpleType) : undefined;
  const item = ref && simpleType ? lookup(simpleType, ref.id) : undefined;

  return (
    <Dialog open={!!ref && (!!item || !!pack)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent showCloseButton={false} className="max-h-[88vh] max-w-[560px] overflow-y-auto rounded-card p-0">
        {pack ? (
          <PackDetail pack={pack} onClose={onClose} onChange={onChange} />
        ) : (
          ref && simpleType && item && (
            <ItemDetail itemRef={{ type: simpleType, id: ref.id }} item={item} from={ref.from} onClose={onClose} onChange={onChange} />
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Capability / skill / interconnector detail ──────────────────────────────
function ItemDetail({
  itemRef,
  item,
  from,
  onClose,
  onChange,
}: {
  itemRef: { type: SimpleType; id: string };
  item: Item;
  from?: ItemRef;
  onClose: () => void;
  onChange: (ref: ItemRef) => void;
}) {
  const { mode, requireSignup, purchase } = useMarketplaceMode();

  // When opened from a pack, offer a way back to it.
  const fromPack = from?.type === "starter-packs" ? STARTER_PACKS.find((p) => p.id === from.id) : undefined;

  // Same type, same industry first, then fill — "more like this".
  const rest = pool(itemRef.type).filter((x) => x.id !== itemRef.id);
  const same = rest.filter((x) => x.industry === item.industry);
  const other = rest.filter((x) => x.industry !== item.industry);
  const similar = [...same, ...other].slice(0, 4);

  const onPurchase = () => {
    onClose();
    if (mode === "public") return requireSignup();
    purchase({
      id: item.id,
      name: item.name,
      description: item.description,
      type: itemRef.type,
      typeLabel: TYPE_LABEL[itemRef.type],
      pricePerYear: item.pricePerYear,
    });
  };

  return (
    <div className="p-7">
      <ModalTopBar
        backLabel={fromPack ? `Back to ${fromPack.name}` : undefined}
        onBack={fromPack ? () => onChange(from!) : undefined}
      />
      <div className="flex items-start gap-4">
        <ItemIcon type={itemRef.type} item={item} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="font-heading text-[20px] font-semibold tracking-[-0.4px] text-dark">
              {item.name}
            </DialogTitle>
            {item.verified && <VerifiedBadge />}
          </div>
          <p className="mt-0.5 text-[12px] font-medium text-gray-4">by {item.builder}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em]", INDUSTRY_TONE[item.industry])}>
              {item.industry}
            </span>
          </div>
        </div>
      </div>

      <DialogDescription className="mt-4 text-[13.5px] leading-[1.6] text-gray-3">
        {item.description}
      </DialogDescription>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-input bg-bg-input/60 px-4 py-3">
        <span className="font-inter text-[20px] font-extrabold tracking-[-0.4px] text-dark">
          ${item.pricePerYear}
          <small className="text-[12px] font-medium tracking-normal text-gray-4"> /yr per twyn</small>
        </span>
        <button
          type="button"
          onClick={onPurchase}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-violet px-5 text-[13.5px] font-bold text-white transition-colors hover:bg-violet-h"
        >
          <CreditCard size={16} /> Purchase
        </button>
      </div>

      {similar.length > 0 && (
        <div className="mt-7">
          <h3 className="mb-3 font-heading text-[14px] font-semibold tracking-[-0.2px] text-dark">
            More popular {itemRef.type}
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {similar.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange({ type: itemRef.type, id: s.id })}
                className="flex items-center gap-2.5 rounded-input border border-border bg-white p-2.5 text-left transition-colors hover:border-violet/50"
              >
                <ItemIcon type={itemRef.type} item={s} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-bold text-dark">{s.name}</span>
                  <span className="block text-[11px] text-gray-4">
                    ${s.pricePerYear}/yr · {s.industry}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 flex items-center justify-center gap-1.5 text-[11.5px] text-gray-5">
        <Sparkles size={11} /> Works on any twyn · billed annually
      </p>
    </div>
  );
}

// A single item inside a pack — tagged with its type (Skill / Interconnector)
// so the mixed list is scannable; opening it remembers the pack for a Back button.
function PackItemRow({
  type,
  item,
  packId,
  onChange,
}: {
  type: SimpleType;
  item: Item;
  packId: string;
  onChange: (ref: ItemRef) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange({ type, id: item.id, from: { type: "starter-packs", id: packId } })}
      className="flex w-full items-center gap-2.5 rounded-input border border-border bg-white p-2.5 text-left transition-colors hover:border-violet/50"
    >
      <ItemIcon type={type} item={item} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="min-w-0 truncate text-[12.5px] font-bold text-dark">{item.name}</span>
          {item.verified && <VerifiedBadge compact />}
        </span>
        <span className="block text-[11px] text-gray-4">by {item.builder}</span>
      </span>
      <span className="shrink-0 rounded-full bg-bg-input px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.05em] text-gray-4">
        {TYPE_LABEL[type]}
      </span>
    </button>
  );
}

// ── Starter Pack detail ─────────────────────────────────────────────────────
function PackDetail({
  pack,
  onClose,
  onChange,
}: {
  pack: StarterPack;
  onClose: () => void;
  onChange: (ref: ItemRef) => void;
}) {
  const { mode, requireSignup, purchase } = useMarketplaceMode();

  const skills = pack.components.skillIds
    .map((id) => SKILLS.find((s) => s.id === id))
    .filter((x): x is SkillItem => Boolean(x));
  const interconnectors = pack.components.interconnectorIds
    .map((id) => INTERCONNECTORS.find((i) => i.id === id))
    .filter((x): x is Interconnector => Boolean(x));
  const assetCount = skills.length + interconnectors.length;

  const otherPacks = STARTER_PACKS.filter((p) => p.id !== pack.id).slice(0, 3);

  const onPurchase = () => {
    if (pack.owned) return;
    onClose();
    if (mode === "public") return requireSignup();
    purchase({
      id: pack.id,
      name: pack.name,
      description: pack.description,
      type: "packs",
      typeLabel: "Starter Pack",
      pricePerYear: pack.pricePerYear,
    });
  };

  return (
    <div className="p-7">
      <ModalTopBar />
      <div className="flex items-start gap-4">
        <PackGlyph pack={pack} size={24} className="h-12 w-12 shrink-0 rounded-[13px]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="font-heading text-[20px] font-semibold tracking-[-0.4px] text-dark">
              {pack.name}
            </DialogTitle>
            {pack.verified && <VerifiedBadge />}
          </div>
          <p className="mt-0.5 text-[12px] font-medium text-gray-4">by {pack.builder}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em]", INDUSTRY_TONE[pack.industry])}>
              {pack.industry}
            </span>
            <span className="inline-flex items-center gap-1 text-[12px] text-gray-4">
              <Package size={12} /> {assetCount} assets
            </span>
          </div>
        </div>
      </div>

      <DialogDescription className="mt-4 text-[13.5px] leading-[1.6] text-gray-3">
        {pack.description}
      </DialogDescription>

      {/* Price / purchase */}
      <div className="mt-5 flex items-center justify-between gap-3 rounded-input bg-bg-input/60 px-4 py-3">
        {pack.owned ? (
          <span className="inline-flex items-center gap-1.5 font-inter text-[16px] font-extrabold tracking-[-0.3px] text-mint-text">
            <Check size={17} strokeWidth={2.5} /> Included with your account
          </span>
        ) : (
          <span className="font-inter text-[20px] font-extrabold tracking-[-0.4px] text-dark">
            ${pack.pricePerYear}
            <small className="text-[12px] font-medium tracking-normal text-gray-4"> /yr per twyn</small>
          </span>
        )}
        {pack.owned ? (
          <span className="inline-flex h-10 items-center gap-2 rounded-full bg-mint px-5 text-[13.5px] font-bold text-mint-text">
            <Check size={16} strokeWidth={2.5} /> Owned
          </span>
        ) : (
          <button
            type="button"
            onClick={onPurchase}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-violet px-5 text-[13.5px] font-bold text-white transition-colors hover:bg-violet-h"
          >
            <CreditCard size={16} /> Purchase
          </button>
        )}
      </div>

      {/* What's included */}
      <div className="mt-7">
        <h3 className="mb-3 font-heading text-[14px] font-semibold tracking-[-0.2px] text-dark">
          What&apos;s included
        </h3>
        <div className="space-y-2">
          {skills.map((s) => (
            <PackItemRow key={s.id} type="skills" item={s} packId={pack.id} onChange={onChange} />
          ))}
          {interconnectors.map((i) => (
            <PackItemRow key={i.id} type="interconnectors" item={i} packId={pack.id} onChange={onChange} />
          ))}
        </div>
      </div>

      {/* Dependencies / prerequisites */}
      {pack.prerequisites.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 font-heading text-[14px] font-semibold tracking-[-0.2px] text-dark">
            Dependencies
          </h3>
          <div className="space-y-2 rounded-input border border-amber-text/15 bg-amber/40 p-3.5">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-amber-text">
              System prerequisites
            </p>
            {pack.prerequisites.map((req) => (
              <p key={req} className="flex items-start gap-2 text-[12.5px] leading-[1.5] text-amber-text">
                <TriangleAlert size={14} className="mt-px shrink-0" /> {req}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* More packs */}
      {otherPacks.length > 0 && (
        <div className="mt-7">
          <h3 className="mb-3 font-heading text-[14px] font-semibold tracking-[-0.2px] text-dark">
            More popular packs
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {otherPacks.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange({ type: "starter-packs", id: p.id })}
                className="flex items-center gap-2.5 rounded-input border border-border bg-white p-2.5 text-left transition-colors hover:border-violet/50"
              >
                <PackGlyph pack={p} size={18} className="h-9 w-9 shrink-0 rounded-[9px]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-bold text-dark">{p.name}</span>
                  <span className="block text-[11px] text-gray-4">
                    {p.owned ? "Owned" : `$${p.pricePerYear}/yr`}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-5 flex items-center justify-center gap-1.5 text-[11.5px] text-gray-5">
        <Sparkles size={11} /> Works on any twyn · billed annually
      </p>
    </div>
  );
}
