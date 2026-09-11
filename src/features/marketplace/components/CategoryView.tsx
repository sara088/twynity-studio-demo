"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination } from "@/features/shared/components/Pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { INDUSTRIES } from "@/features/shared/data/industries";
import { CARD_GRID } from "@/lib/grid";
import { useMarketplaceMode } from "./MarketplaceMode";
import { STARTER_PACKS, SKILLS, INTERCONNECTORS } from "../data/mock-data";
import { StarterPackCard } from "./StarterPackCard";
import { SkillCard } from "./SkillCard";
import { InterconnectorCard } from "./InterconnectorCard";

export type MarketplaceCategory = "starter-packs" | "skills" | "interconnectors";

const META: Record<MarketplaceCategory, { title: string; caption: string; noun: string; facetLabel: string }> = {
  "starter-packs": {
    title: "Starter Packs",
    caption: "Pre-packaged bundles of skills & interconnectors that achieve an outcome.",
    noun: "packs",
    facetLabel: "Focus",
  },
  skills: {
    title: "Skills",
    caption: "Targeted micro-upgrades to specialise your twyn.",
    noun: "skills",
    facetLabel: "Discipline",
  },
  interconnectors: {
    title: "Interconnectors",
    caption: "MCP tools your twyn can use, organised by industry.",
    noun: "tools",
    facetLabel: "Industry",
  },
};

type Sort = "price-asc" | "price-desc" | "name";
const SORTS: { id: Sort; label: string }[] = [
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name", label: "Name (A–Z)" },
];

const PAGE_SIZE = 12;

// The "View All" page for a marketplace category — a scalable catalogue: a sticky
// filter toolbar (search · facet chips · sort · live count) over a dense grid.
// For interconnectors the facets are the four industries (Customer Service,
// Technology, Finance, Healthcare); capabilities filter by focus, skills by
// discipline.
export function CategoryView({ category }: { category: MarketplaceCategory }) {
  const { mode } = useMarketplaceMode();
  const backHref = mode === "public" ? "/marketplace?public" : "/marketplace";
  const meta = META[category];

  const [facet, setFacet] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [query, setQuery] = useState("");
  // No default sort — items show in their curated order until the user picks one.
  const [sort, setSort] = useState<Sort | null>(null);
  const [page, setPage] = useState(1);
  const q = query.trim().toLowerCase();

  // Back to page 1 whenever the result set changes.
  useEffect(() => setPage(1), [facet, verifiedOnly, q, sort]);

  // One shared taxonomy across every category: filter by industry.
  const facets = INDUSTRIES as string[];

  const { count, cards } = useMemo(() => {
    const sortBy = <T extends { name: string; pricePerYear: number }>(arr: T[]) => {
      if (sort === "name") return [...arr].sort((a, b) => a.name.localeCompare(b.name));
      if (sort === "price-asc") return [...arr].sort((a, b) => a.pricePerYear - b.pricePerYear);
      if (sort === "price-desc") return [...arr].sort((a, b) => b.pricePerYear - a.pricePerYear);
      return arr;
    };
    const matches = (x: { name: string; description: string; industry: string; verified: boolean }) =>
      (facet === "All" || x.industry === facet) &&
      (!verifiedOnly || x.verified) &&
      (!q ||
        x.name.toLowerCase().includes(q) ||
        x.description.toLowerCase().includes(q) ||
        x.industry.toLowerCase().includes(q));

    if (category === "starter-packs") {
      const items = sortBy(STARTER_PACKS.filter(matches));
      return { count: items.length, cards: items.map((p) => <StarterPackCard key={p.id} pack={p} fluid />) };
    }
    if (category === "skills") {
      const items = sortBy(SKILLS.filter(matches));
      return { count: items.length, cards: items.map((s) => <SkillCard key={s.id} skill={s} fluid />) };
    }
    const items = sortBy(INTERCONNECTORS.filter(matches));
    return { count: items.length, cards: items.map((t) => <InterconnectorCard key={t.id} item={t} fluid />) };
  }, [category, facet, verifiedOnly, q, sort]);

  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageCards = cards.slice(start, start + PAGE_SIZE);

  return (
    <div className="mx-auto max-w-[1100px]">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-2 hover:border-violet hover:text-violet"
      >
        <ArrowLeft size={13} /> Marketplace
      </Link>

      <header className="mb-5">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-[-0.6px] text-dark">
          {meta.title}
        </h1>
        <p className="mt-1.5 text-[13.5px] text-gray-3">{meta.caption}</p>
      </header>

      {/* Sticky filter toolbar */}
      <div className="sticky top-0 z-10 -mx-1 mb-6 space-y-3 border-b border-border bg-white/75 px-1 pb-3 pt-2 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-[340px]">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-5" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${meta.noun}…`}
              className="h-10 w-full rounded-full border border-border bg-white pl-9 pr-3 text-[13px] text-dark outline-none transition-colors placeholder:text-gray-5 focus:border-violet"
            />
          </div>
          <span className="text-[12.5px] font-medium text-gray-4 tabular-nums">
            {count} {meta.noun}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Select value={sort ?? undefined} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="h-9 w-[170px] rounded-full border border-border bg-white px-3.5 text-[12.5px] font-semibold text-dark focus-visible:border-violet focus-visible:ring-0 [&>svg]:text-gray-5">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-[12.5px]">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Facet chips — the blue 4th-IR toggle filters to verified items and
            combines with the industry facet. */}
        <div className="scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto px-1">
          <button
            type="button"
            onClick={() => setVerifiedOnly((v) => !v)}
            aria-pressed={verifiedOnly}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
              verifiedOnly
                ? "bg-[#2563EB] text-white"
                : "border border-[#2563EB]/35 bg-white text-[#2563EB] hover:bg-[#EAF1FF]",
            )}
          >
            <BadgeCheck size={14} strokeWidth={2.4} /> 4th-IR verified
          </button>
          <span className="h-5 w-px shrink-0 self-center bg-border" aria-hidden />
          {["All", ...facets].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFacet(f)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                facet === f
                  ? "bg-violet text-white"
                  : "border border-border bg-white text-gray-3 hover:border-violet hover:text-violet",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {count > 0 ? (
        <>
          <div className={CARD_GRID}>{pageCards}</div>
          <div className="mt-9 flex flex-col items-center gap-2">
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
            <span className="text-[11.5px] text-gray-5 tabular-nums">
              Showing {start + 1}–{Math.min(start + PAGE_SIZE, count)} of {count} {meta.noun}
            </span>
          </div>
        </>
      ) : (
        <div className="grid place-items-center gap-1.5 rounded-card border border-dashed border-border bg-bg-input/40 py-16 text-center">
          <p className="text-[13px] font-semibold text-dark">No {meta.noun} match</p>
          <p className="text-[12.5px] text-gray-4">Try a different filter or search term.</p>
        </div>
      )}
    </div>
  );
}
