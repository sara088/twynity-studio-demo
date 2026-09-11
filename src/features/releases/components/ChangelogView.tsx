import Link from "next/link";
import { ArrowUpRight, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatDate,
  formatDateShort,
  type Change,
  type ChangeType,
  type Release,
} from "../data/releases";

// Category label styling — New = violet, Improved = amber, Fixed = neutral.
const CAT: Record<ChangeType, { label: string; cls: string }> = {
  new: { label: "New", cls: "text-violet" },
  improved: { label: "Improved", cls: "text-amber-text" },
  fixed: { label: "Fixed", cls: "text-gray-5" },
};
const CAT_ORDER: ChangeType[] = ["new", "improved", "fixed"];

// The full, reverse-chronological changelog. Timeline layout: date + version on
// the left, categorized changes in the middle, a sticky "Latest releases" jump
// list on the right (desktop).
export function ChangelogView({ releases }: { releases: Release[] }) {
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_260px] lg:gap-14">
      <div>
        {releases.map((r, i) => (
          <ReleaseEntry key={r.version} release={r} first={i === 0} />
        ))}
      </div>

      {/* Latest releases — sticky jump list (desktop only). */}
      <aside className="hidden lg:block">
        <div className="sticky top-[110px] rounded-card border border-border bg-white p-5">
          <h2 className="mb-4 font-heading text-[14px] font-bold tracking-[-0.2px] text-dark">
            Latest releases
          </h2>
          <ul className="-mx-2">
            {releases.map((r) => (
              <li key={r.version}>
                <a
                  href={`#${r.slug}`}
                  className="flex items-baseline justify-between gap-3 rounded-[8px] px-2 py-2 transition-colors hover:bg-bg-input"
                >
                  <span className="min-w-0 truncate text-[12.5px] text-gray-2">{r.title}</span>
                  <span className="shrink-0 font-sans text-[11px] tabular-nums text-gray-5">
                    {formatDateShort(r.date)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function ReleaseEntry({ release, first }: { release: Release; first: boolean }) {
  return (
    <article
      id={release.slug}
      className={cn(
        "grid scroll-mt-[110px] gap-5 border-border py-10 lg:grid-cols-[160px_1fr] lg:gap-10",
        !first && "border-t",
        first && "pt-2",
      )}
    >
      {/* Left rail — date + version tag + product area */}
      <div className="lg:pt-1">
        <div className="font-sans text-[13px] font-semibold tabular-nums text-violet">
          {formatDate(release.date)}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-block rounded-[6px] border border-border bg-bg-input/60 px-2 py-0.5 font-sans text-[11px] font-semibold tabular-nums text-gray-3">
            v{release.version}
          </span>
          <span className="inline-block rounded-full bg-violet-light px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-violet">
            {release.theme}
          </span>
        </div>
      </div>

      {/* Content — title (with permalink) + categorized changes */}
      <div className="min-w-0">
        <h2 className="group/t flex items-start gap-2 font-heading text-[21px] font-bold leading-[1.2] tracking-[-0.4px] text-dark sm:text-[23px]">
          <span>{release.title}</span>
          <a
            href={`#${release.slug}`}
            aria-label="Link to this release"
            className="mt-1.5 shrink-0 text-gray-5 opacity-0 transition-opacity hover:text-violet group-hover/t:opacity-100"
          >
            <Link2 size={16} />
          </a>
        </h2>

        {CAT_ORDER.map((type) => {
          const items = release.changes.filter((c) => c.type === type);
          if (!items.length) return null;
          return <ChangeGroup key={type} type={type} items={items} />;
        })}

        {release.featured && (
          <Link
            href={`/whats-new/${release.slug}`}
            className="mt-5 inline-flex items-center gap-1 text-[13px] font-bold text-violet transition-colors hover:text-violet-h"
          >
            See the highlights <ArrowUpRight size={14} strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </article>
  );
}

function ChangeGroup({ type, items }: { type: ChangeType; items: Change[] }) {
  const cat = CAT[type];
  return (
    <div className="mt-6 first:mt-5">
      <div className={cn("mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em]", cat.cls)}>
        {cat.label}
      </div>
      <ul className="space-y-2.5">
        {items.map((c) => (
          <li key={c.text} className="flex gap-2.5 text-[13.5px] leading-[1.55] text-gray-2">
            <span className={cn("mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full", type === "new" ? "bg-violet" : type === "improved" ? "bg-amber-text" : "bg-gray-5")} />
            <span>{c.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
