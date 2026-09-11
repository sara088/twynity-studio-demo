import { BgWash } from "@/features/landing/components/BgWash";
import { MarketingTopbar } from "@/features/landing/components/MarketingTopbar";
import { MarketingFooter } from "@/features/landing/components/MarketingFooter";
import { DemoForm } from "@/features/demo/components/DemoForm";

export default function DemoPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BgWash />
      <MarketingTopbar variant="supply" />
      <main className="relative z-10 px-6 pb-[100px] pt-[120px]">
        <DemoForm />
      </main>
      <MarketingFooter />
    </div>
  );
}
