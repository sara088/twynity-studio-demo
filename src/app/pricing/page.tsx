import { BgWash } from "@/features/landing/components/BgWash";
import { MarketingTopbar } from "@/features/landing/components/MarketingTopbar";
import { MarketingFooter } from "@/features/landing/components/MarketingFooter";
import { PlansSection } from "@/features/top-up/components/PlansSection";

// Public pricing page for the marketing site (no app chrome, no sign-in needed).
// Reuses the same PlansSection as the in-app /plans page, in "public" mode —
// so the plans stay in sync — with CTAs that start the free signup.
export default function PricingPage() {
  return (
    // Flex column + flex-1 main so the footer sits at the bottom of the viewport
    // even when the content is short (no footer riding up mid-page).
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <BgWash />
      <MarketingTopbar variant="supply" />
      {/* pt clears the 64px fixed topbar AND leaves breathing room (matches Hero). */}
      <main className="relative z-10 mx-auto w-full max-w-[1120px] flex-1 px-6 pb-28 pt-[130px] sm:px-10">
        <header className="mb-12 text-center">
          <h1 className="font-heading text-[34px] font-bold leading-[1.1] tracking-[-0.8px] text-dark sm:text-[44px]">
            Pick the plan that fits
          </h1>
          <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-[1.6] text-gray-3">
            Start free for 15 days — your twyn talks in your voice from day one. Upgrade only when
            you&apos;re ready; no paywall to get going.
          </p>
        </header>

        <PlansSection variant="public" />
      </main>
      <MarketingFooter />
    </div>
  );
}
