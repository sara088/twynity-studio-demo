import type { Metadata } from "next";
import { BgWash } from "@/features/landing/components/BgWash";
import { MarketingTopbar } from "@/features/landing/components/MarketingTopbar";
import { MarketingFooter } from "@/features/landing/components/MarketingFooter";
import { WhatsNewView } from "@/features/releases/components/WhatsNewView";
import { MarkReleaseRead } from "@/features/releases/components/MarkReleaseRead";
import { getLatestFeatured } from "@/features/releases/data/releases";

export const metadata: Metadata = {
  title: "What's new · Twynity",
  description: getLatestFeatured().summary,
};

// Curated highlights for the latest featured release.
export default function WhatsNewPage() {
  const release = getLatestFeatured();
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <BgWash />
      <MarketingTopbar variant="supply" />
      <main className="relative z-10 mx-auto w-full max-w-[1000px] flex-1 px-6 pb-28 pt-[130px] sm:px-10">
        <MarkReleaseRead version={release.version} />
        <WhatsNewView release={release} />
      </main>
      <MarketingFooter />
    </div>
  );
}
