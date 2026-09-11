import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Rss } from "lucide-react";
import { BgWash } from "@/features/landing/components/BgWash";
import { MarketingTopbar } from "@/features/landing/components/MarketingTopbar";
import { MarketingFooter } from "@/features/landing/components/MarketingFooter";
import { ChangelogView } from "@/features/releases/components/ChangelogView";
import { RELEASES, getLatestFeatured } from "@/features/releases/data/releases";

export const metadata: Metadata = {
  title: "Changelog · Twynity",
  description: "Everything new, improved, and fixed in Twynity — newest first.",
};

// Public changelog — every release, newest first. The curated highlights for
// the latest featured release live at /whats-new.
export default function ChangelogPage() {
  const featured = getLatestFeatured();
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <BgWash />
      <MarketingTopbar variant="supply" />
      <main className="relative z-10 mx-auto w-full max-w-[1120px] flex-1 px-6 pb-28 pt-[130px] sm:px-10">
        <header className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-[640px]">
            <h1 className="font-heading text-[34px] font-bold leading-[1.1] tracking-[-0.8px] text-dark sm:text-[42px]">
              Changelog
            </h1>
            <p className="mt-4 text-[15px] leading-[1.6] text-gray-3">
              Everything new, improved, and fixed in Twynity — newest first.{" "}
              <Link
                href={`/whats-new/${featured.slug}`}
                className="inline-flex items-center gap-0.5 font-semibold text-violet hover:text-violet-h"
              >
                See the latest highlights <ArrowUpRight size={14} strokeWidth={2.5} />
              </Link>
            </p>
          </div>
          {/* Subscribe via RSS — the standard way to follow a changelog. */}
          <a
            href="/changelog/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
          >
            <Rss size={14} /> Subscribe
          </a>
        </header>

        <ChangelogView releases={RELEASES} />
      </main>
      <MarketingFooter />
    </div>
  );
}
