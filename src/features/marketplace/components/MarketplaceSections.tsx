"use client";

import { useState } from "react";
import { MarketplaceHero } from "./MarketplaceHero";
import { HorizontalRow } from "./HorizontalRow";
import { StarterPackCard } from "./StarterPackCard";
import { SkillCard } from "./SkillCard";
import { InterconnectorCard } from "./InterconnectorCard";
import { useMarketplaceMode } from "./MarketplaceMode";
import {
  STARTER_PACKS,
  SKILLS,
  INTERCONNECTORS,
  type StarterPack,
  type SkillItem,
  type Interconnector,
} from "../data/mock-data";

// The marketplace body — a focal hero search over Netflix-style browse rails.
// Typing in the hero filters every rail live; empty rails drop out. Each "View
// All" opens that category's filterable page. Mode-aware CTAs live on the cards.
export function MarketplaceSections() {
  const { mode } = useMarketplaceMode();
  const suffix = mode === "public" ? "?public" : "";
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const matchPack = (p: StarterPack) =>
    !q ||
    p.name.toLowerCase().includes(q) ||
    p.outcome.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    p.industry.toLowerCase().includes(q);
  const matchItem = (x: SkillItem | Interconnector) =>
    !q ||
    x.name.toLowerCase().includes(q) ||
    x.description.toLowerCase().includes(q) ||
    x.industry.toLowerCase().includes(q);

  const packs = STARTER_PACKS.filter(matchPack);
  const interconnectors = INTERCONNECTORS.filter(matchItem);
  const skills = SKILLS.filter(matchItem);
  const noResults =
    searching && !packs.length && !interconnectors.length && !skills.length;

  return (
    <>
      <MarketplaceHero query={query} onQueryChange={setQuery} />

      {noResults ? (
        <div className="grid place-items-center gap-1.5 rounded-card border border-dashed border-border bg-bg-input/40 py-16 text-center">
          <p className="text-[13.5px] font-semibold text-dark">
            No matches for “{query.trim()}”
          </p>
          <p className="text-[12.5px] text-gray-4">
            Try a different term, or{" "}
            <button
              type="button"
              onClick={() => setQuery("")}
              className="font-semibold text-violet hover:underline"
            >
              browse everything
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          {packs.length > 0 && (
            <HorizontalRow
              title="Starter Packs"
              caption="Pre-packaged bundles of skills & interconnectors to achieve an outcome"
              viewAllHref={`/marketplace/starter-packs${suffix}`}
            >
              {packs.map((p) => (
                <StarterPackCard key={p.id} pack={p} />
              ))}
            </HorizontalRow>
          )}

          {interconnectors.length > 0 && (
            <HorizontalRow
              title="Interconnectors"
              caption="MCP tools for Customer Service, Technology, Finance & Healthcare"
              viewAllHref={`/marketplace/interconnectors${suffix}`}
            >
              {interconnectors.map((i) => (
                <InterconnectorCard key={i.id} item={i} />
              ))}
            </HorizontalRow>
          )}

          {skills.length > 0 && (
            <HorizontalRow
              title="Skills"
              caption="Targeted micro-upgrades - stack them to specialise your Twyn"
              viewAllHref={`/marketplace/skills${suffix}`}
            >
              {skills.map((s) => (
                <SkillCard key={s.id} skill={s} />
              ))}
            </HorizontalRow>
          )}

          {/* Community twyns — collapsed, grayed coming-soon teaser. Hidden while
              searching to keep results focused. */}
          {!searching && (
            <section className="mb-10">
              <div className="flex items-center gap-2.5 rounded-card border border-dashed border-border bg-bg-input/40 px-5 py-4">
                <h2 className="font-heading text-[17px] font-semibold tracking-[-0.3px] text-gray-4">
                  Twyns from the community
                </h2>
                <span className="rounded-full border border-gray-6 bg-white px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-gray-5">
                  Soon
                </span>
                <p className="ml-1 hidden text-[12.5px] text-gray-5 sm:block">
                  Hire twyns published by others — coming soon.
                </p>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
