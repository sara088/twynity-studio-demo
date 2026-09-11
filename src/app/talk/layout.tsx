import { SupplySidebar } from "@/features/shared/components/SupplySidebar";
import { SupplyBottomNav } from "@/features/shared/components/SupplyBottomNav";

export default function TalkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-bg-page">
      <SupplySidebar />
      {/* Reserve the sidebar's 64px only at lg (where it shows); on mobile the
          bottom nav takes over, so leave room for it instead. */}
      <div className="flex h-full flex-col overflow-hidden pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-0 lg:pl-16">
        {children}
      </div>
      <SupplyBottomNav />
    </div>
  );
}
