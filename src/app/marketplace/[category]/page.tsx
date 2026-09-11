import { notFound } from "next/navigation";
import type { MarketplaceCategory } from "@/features/marketplace/components/CategoryView";
import { MarketplaceEntry } from "../MarketplaceEntry";

const VALID: MarketplaceCategory[] = ["starter-packs", "skills", "interconnectors"];

// Static export: enumerate the categories at build time.
export function generateStaticParams() {
  return VALID.map((category) => ({ category }));
}

export default async function MarketplaceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!VALID.includes(category as MarketplaceCategory)) notFound();
  return <MarketplaceEntry category={category as MarketplaceCategory} />;
}
