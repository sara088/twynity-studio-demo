"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INDUSTRY_TONE } from "@/features/shared/data/industries";
import type { SkillItem } from "../data/mock-data";
import { VerifiedBadge } from "./VerifiedBadge";
import { useMarketplaceMode } from "./MarketplaceMode";

// Same layout as InterconnectorCard — a square icon tile (generic lucide glyph),
// title, provider, industry chip, description, price + Purchase. `fluid` fills the
// grid cell on the View-All page; otherwise fixed-width rail card.
export function SkillCard({ skill, fluid = false }: { skill: SkillItem; fluid?: boolean }) {
  const { mode, requireSignup, purchase, viewItem } = useMarketplaceMode();
  const isPublic = mode === "public";
  const Icon = skill.icon;
  const onPurchase = () =>
    isPublic
      ? requireSignup()
      : purchase({
          id: skill.id,
          name: skill.name,
          description: skill.description,
          type: "skills",
          typeLabel: "Skill",
          pricePerYear: skill.pricePerYear,
        });
  return (
    <article
      onClick={() => viewItem({ type: "skills", id: skill.id })}
      className={cn(
        "flex cursor-pointer flex-col gap-2 rounded-[12px] border border-border bg-white p-3.5 transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]",
        fluid ? "w-full" : "w-[200px] shrink-0",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px]",
            INDUSTRY_TONE[skill.industry],
          )}
        >
          <Icon size={20} strokeWidth={1.9} />
        </div>
        {skill.verified && <VerifiedBadge compact />}
      </div>

      <div>
        <h3 className="truncate text-[13px] font-bold tracking-[-0.2px] text-dark">{skill.name}</h3>
        <p className="mt-0.5 text-[10px] font-medium text-gray-5">by {skill.builder}</p>
        <span
          className={cn(
            "mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em]",
            INDUSTRY_TONE[skill.industry],
          )}
        >
          {skill.industry}
        </span>
      </div>

      <p className="flex-1 text-[11px] leading-[1.45] text-gray-4">{skill.description}</p>

      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="min-w-0 font-inter text-[15px] font-extrabold tracking-[-0.3px] text-dark">
          ${skill.pricePerYear}
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
