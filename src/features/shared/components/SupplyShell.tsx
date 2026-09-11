"use client";

import { usePathname } from "next/navigation";
import { SupplySidebar } from "./SupplySidebar";
import { SupplyBottomNav } from "./SupplyBottomNav";
import { Topbar } from "./Topbar";
import { ReleaseToast } from "@/features/releases/components/ReleaseToast";

// The signed-in product chrome. Desktop (lg+): hover-expand sidebar + topbar.
// Mobile/tablet (< lg): the sidebar is hidden and a bottom tab bar takes over;
// content gets tighter padding and bottom clearance for the fixed nav.
//
// Immersive routes (the team group chat) drop the topbar + page padding and run
// full-bleed like the studio — the view supplies its own slim header.
export function SupplyShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = /^\/teams\/[^/]+\/chat\/?$/.test(pathname);

  return (
    <div className="relative flex h-dvh w-screen overflow-hidden">
      <SupplySidebar />
      {/* Reserve the collapsed sidebar's 64px (lg only); it expands over content on hover. */}
      <div className="hidden w-16 shrink-0 lg:block" aria-hidden />
      <div className="flex flex-1 flex-col overflow-hidden bg-bg-content">
        {!immersive && <Topbar />}
        {immersive ? (
          <div className="min-h-0 flex-1 overflow-hidden pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-0">
            {children}
          </div>
        ) : (
          <div className="scrollbar-thin flex-1 overflow-y-auto px-4 pb-24 pt-5 lg:px-7 lg:pb-12 lg:pt-[26px]">
            {children}
          </div>
        )}
      </div>
      <SupplyBottomNav />
      {/* One-time "what's new" announcement for the latest release. */}
      <ReleaseToast />
    </div>
  );
}
