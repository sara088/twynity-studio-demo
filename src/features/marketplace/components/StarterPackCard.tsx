"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INDUSTRY_TONE } from "@/features/shared/data/industries";
import { SKILLS, INTERCONNECTORS, type StarterPack } from "../data/mock-data";
import { BrandIcon, hasBrandIcon } from "./BrandIcon";
import { PackBanner } from "./PackArt";
import { VerifiedBadge } from "./VerifiedBadge";
import { useMarketplaceMode } from "./MarketplaceMode";

// A pack is a bundle, so it gets a distinct, more prominent treatment than the
// single-asset cards: a wide hero image, a colour gradient + accent stroke, a
// "Starter Pack" badge, and a stack of the included asset icons so it visibly
// reads as a bundle of things.
export function StarterPackCard({ pack, fluid = false }: { pack: StarterPack; fluid?: boolean }) {
  const { mode, requireSignup, purchase, viewItem } = useMarketplaceMode();
  const isPublic = mode === "public";

  const skills = pack.components.skillIds
    .map((id) => SKILLS.find((s) => s.id === id))
    .filter((x): x is (typeof SKILLS)[number] => Boolean(x));
  const interconnectors = pack.components.interconnectorIds
    .map((id) => INTERCONNECTORS.find((i) => i.id === id))
    .filter((x): x is (typeof INTERCONNECTORS)[number] => Boolean(x));
  const assetCount = skills.length + interconnectors.length;

  // Build the "what's inside" icon stack (skills → interconnectors).
  const stack: React.ReactNode[] = [
    ...skills.map((s) => {
      const Icon = s.icon;
      return (
        <StackTile key={`s-${s.id}`} className={INDUSTRY_TONE[s.industry]}>
          <Icon size={13} strokeWidth={2} />
        </StackTile>
      );
    }),
    ...interconnectors.map((i) => (
      <StackTile key={`i-${i.id}`} className="bg-white">
        {hasBrandIcon(i.logo) ? (
          <BrandIcon logo={i.logo} className="h-3.5 w-3.5" />
        ) : (
          <span className={cn("grid h-full w-full place-items-center text-[10px] font-bold", INDUSTRY_TONE[i.industry])}>
            {i.name[0]}
          </span>
        )}
      </StackTile>
    )),
  ];
  const shown = stack.slice(0, 5);
  const extra = stack.length - shown.length;

  const onPurchase = () => {
    if (pack.owned) return;
    if (isPublic) return requireSignup();
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
    <article
      onClick={() => viewItem({ type: "starter-packs", id: pack.id })}
      className={cn(
        "group flex cursor-pointer flex-col overflow-hidden rounded-[14px] border-[1.5px] border-violet/20 bg-white shadow-[0_2px_8px_rgba(15,15,30,0.04)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(108,92,231,0.16)]",
        fluid ? "w-full" : "w-[260px] shrink-0",
      )}
    >
      {/* Wide generated hero banner */}
      <div className="relative">
        <PackBanner pack={pack} className="h-[120px] w-full" />
        {pack.verified && (
          <VerifiedBadge
            compact
            className="absolute right-2.5 top-2.5 bg-white shadow-[0_2px_8px_rgba(15,15,30,0.16)]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <h3 className="truncate text-[14px] font-bold tracking-[-0.2px] text-dark">{pack.name}</h3>
        <p className="mt-0.5 text-[10px] font-medium text-gray-5">by {pack.builder}</p>

        <p className="mt-2 flex-1 text-[11.5px] leading-[1.45] text-gray-3">{pack.outcome}</p>

        {/* What's inside — overlapping icon stack signals a bundle */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex -space-x-1.5">{shown}</div>
          <span className="text-[10.5px] font-semibold text-gray-4">
            {extra > 0 ? `+${extra} · ` : ""}
            {assetCount} assets
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
          {pack.owned ? (
            <span />
          ) : (
            <span className="min-w-0 font-inter text-[15px] font-extrabold tracking-[-0.3px] text-dark">
              ${pack.pricePerYear}
              <small className="text-[11px] font-medium tracking-normal text-gray-4">/yr</small>
            </span>
          )}
          {pack.owned ? (
            <Button type="button" variant="outline" size="sm" disabled className="h-[30px] rounded-[8px] px-3.5 text-[11.5px] font-bold">
              Included
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPurchase();
              }}
              className="h-[30px] rounded-[8px] px-3.5 text-[11.5px] font-bold"
            >
              Purchase
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function StackTile({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "grid h-7 w-7 place-items-center overflow-hidden rounded-[8px] ring-2 ring-white",
        className,
      )}
    >
      {children}
    </span>
  );
}
