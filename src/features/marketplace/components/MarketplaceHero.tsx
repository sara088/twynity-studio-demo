"use client";

import Image from "next/image";
import { Search, X } from "lucide-react";

// Quick-search chips — each matches real catalog items so results appear.
const SUGGESTIONS = ["Slack", "SQL Querying", "Design Pack", "Sprint Planning", "Figma"];

// The marketplace home hero. The search is the focal action — type to filter the
// rails below across packs, skills & interconnectors.
export function MarketplaceHero({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (q: string) => void;
}) {
  return (
    <section className="mb-6 overflow-hidden rounded-[16px] bg-violet-light px-6 py-7 lg:mb-[34px] lg:flex lg:h-[320px] lg:items-stretch lg:px-0 lg:py-0 lg:pl-11 lg:pt-[44px]">
      <div className="z-10 flex flex-col justify-center lg:flex-[0_0_520px] lg:pb-9 lg:pr-8">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-violet">
          Make your twyn more capable
        </div>
        <h1 className="mb-4 font-heading text-[clamp(24px,6.2vw,34px)] font-semibold leading-[1.1] tracking-[-1.2px] text-dark">
          What should your twyn{" "}
          <span className="text-violet">be able to do?</span>
        </h1>

        {/* Focal search */}
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-5"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search skills, tools & starter packs…"
            aria-label="Search the marketplace"
            className="h-12 w-full rounded-full border border-border bg-white pl-11 pr-10 text-[14px] text-dark shadow-[0_4px_18px_rgba(15,15,30,0.07)] outline-none transition-colors placeholder:text-gray-5 focus:border-violet"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-gray-5 transition-colors hover:bg-bg-input hover:text-dark"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Quick searches */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11.5px] font-medium text-gray-4">Try</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onQueryChange(s)}
              className="rounded-full border border-violet/25 bg-white/70 px-2.5 py-1 text-[11.5px] font-semibold text-violet transition-colors hover:bg-white"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Decorative artwork — hidden on phones to give the search full width. */}
      <div className="relative hidden min-w-0 flex-1 lg:block">
        <Image
          src="/hero1.png"
          alt="Twyns"
          width={1240}
          height={507}
          sizes="calc(100vw - 864px)"
          className="absolute bottom-0 right-0 h-full w-auto max-w-full object-contain object-right-bottom"
          priority
        />
      </div>
    </section>
  );
}
