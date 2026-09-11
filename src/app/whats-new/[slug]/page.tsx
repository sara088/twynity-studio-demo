import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BgWash } from "@/features/landing/components/BgWash";
import { MarketingTopbar } from "@/features/landing/components/MarketingTopbar";
import { MarketingFooter } from "@/features/landing/components/MarketingFooter";
import { WhatsNewView } from "@/features/releases/components/WhatsNewView";
import { MarkReleaseRead } from "@/features/releases/components/MarkReleaseRead";
import { getFeatured, getReleaseBySlug } from "@/features/releases/data/releases";

// Curated highlights for a specific featured release. Only featured releases
// (the ones with highlights) get a What's-new page; everything else lives in
// the changelog.
export function generateStaticParams() {
  return getFeatured().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const release = getReleaseBySlug(slug);
  if (!release) return { title: "What's new · Twynity" };
  return { title: `${release.title} · What's new · Twynity`, description: release.summary };
}

export default async function WhatsNewSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const release = getReleaseBySlug(slug);
  if (!release || !release.featured) notFound();

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
