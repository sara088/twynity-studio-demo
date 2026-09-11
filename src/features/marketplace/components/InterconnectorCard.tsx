"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INDUSTRY_TONE } from "@/features/shared/data/industries";
import type { Interconnector } from "../data/mock-data";
import { BrandIcon } from "./BrandIcon";
import { VerifiedBadge } from "./VerifiedBadge";
import { useMarketplaceMode } from "./MarketplaceMode";

// Brand glyphs are real, full-colour marks — render them on a light tile.
const PLAIN_BG: Record<string, string | undefined> = {};

// Tools with a dedicated brand glyph; everything else uses an industry monogram.
const BRAND_LOGOS = new Set([
  "slack", "notion", "linear", "github", "figma", "gmail", "drive", "calendar",
  "hubspot", "zendesk", "intercom", "jira", "stripe", "quickbooks",
]);

// `fluid` fills the grid cell on the View-All page; otherwise fixed-width rail card.
export function InterconnectorCard({ item, fluid = false }: { item: Interconnector; fluid?: boolean }) {
  const { mode, requireSignup, purchase, viewItem } = useMarketplaceMode();
  const isPublic = mode === "public";
  const hasBrand = BRAND_LOGOS.has(item.logo);

  const onPurchase = () =>
    isPublic
      ? requireSignup()
      : purchase({
          id: item.id,
          name: item.name,
          description: item.description,
          type: "interconnectors",
          typeLabel: "Interconnector",
          pricePerYear: item.pricePerYear,
        });

  return (
    <article
      onClick={() => viewItem({ type: "interconnectors", id: item.id })}
      className={cn("flex cursor-pointer flex-col gap-2 rounded-[12px] border border-border bg-white p-3.5 transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]", fluid ? "w-full" : "w-[200px] shrink-0")}
    >
      <div className="flex items-start justify-between gap-2">
        {hasBrand ? (
          <div
            className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] border border-border"
            style={{ background: PLAIN_BG[item.logo] ?? "#FAFAFE" }}
          >
            <BrandIcon logo={item.logo} className="h-[22px] w-[22px]" />
          </div>
        ) : (
          <div
            className={cn(
              "grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] font-heading text-[16px] font-bold",
              INDUSTRY_TONE[item.industry],
            )}
          >
            {item.name[0]}
          </div>
        )}
        {item.verified && <VerifiedBadge compact />}
      </div>

      <div>
        <h3 className="truncate text-[13px] font-bold tracking-[-0.2px] text-dark">{item.name}</h3>
        <p className="mt-0.5 text-[10px] font-medium text-gray-5">by {item.builder}</p>
        <span
          className={cn(
            "mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em]",
            INDUSTRY_TONE[item.industry],
          )}
        >
          {item.industry}
        </span>
      </div>

      <p className="flex-1 text-[11px] leading-[1.45] text-gray-4">{item.description}</p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="min-w-0 font-inter text-[15px] font-extrabold tracking-[-0.3px] text-dark">
          ${item.pricePerYear}
          <small className="text-[11px] font-medium tracking-normal text-gray-4">/yr</small>
        </span>
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
      </div>
    </article>
  );
}
