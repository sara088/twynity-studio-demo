import { BgWash } from "@/features/landing/components/BgWash";
import { MarketingTopbar } from "@/features/landing/components/MarketingTopbar";
import { Hero } from "@/features/landing/components/Hero";
import { PathsSection } from "@/features/landing/components/PathsSection";
import { VideoSection } from "@/features/landing/components/VideoSection";
import { FourClicksSection } from "@/features/landing/components/FourClicksSection";
import { HumanInLoopSection } from "@/features/landing/components/HumanInLoopSection";
import { OrgsSection } from "@/features/landing/components/OrgsSection";
import { WaitlistSection } from "@/features/landing/components/WaitlistSection";
import { MarketingFooter } from "@/features/landing/components/MarketingFooter";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BgWash />
      <MarketingTopbar variant="supply" />
      <main>
        <Hero />
        <PathsSection />
        <VideoSection />
        <FourClicksSection />
        <HumanInLoopSection />
        <OrgsSection />
        <WaitlistSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
