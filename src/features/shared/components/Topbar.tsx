"use client";

import Link from "next/link";
import { Bell, ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { SearchInput } from "./SearchInput";
import { AccountMenu } from "./AccountMenu";
import { Logo } from "./Logo";

// Product topbar (supply pages): search + notifications + account dropdown.
// On a twyn editor route (/my-twyns/[id]) it shows an "All twyns" back-link.
export function Topbar({ searchPlaceholder }: { searchPlaceholder?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const onNotifications = pathname === "/notifications";
  const isWorkshop = pathname === "/assets";
  // Marketplace pages carry their own search (focal hero search on the home,
  // in-page filter on category pages), so the topbar search is dropped across
  // the whole marketplace.
  const isMarketplace = pathname.startsWith("/marketplace");
  const isEditTwyn = /^\/my-twyns\/[^/]+$/.test(pathname);
  const placeholder =
    searchPlaceholder ??
    (isEditTwyn
      ? "Search capabilities, skills, memories…"
      : isWorkshop
        ? "Search workshop…"
        : isMarketplace
          ? "Search the marketplace…"
          : "Search your twyns…");

  function handleSearch(next: string) {
    if (!isWorkshop) return;
    window.dispatchEvent(new CustomEvent("twynity:workshop-search", { detail: next }));
  }

  return (
    <header className="flex h-[58px] shrink-0 items-center gap-2.5 border-b border-border bg-white px-4 lg:gap-[14px] lg:px-[26px]">
      {/* Brand on mobile (the sidebar that normally carries it is hidden < lg).
          Icon-only on phones; wordmark returns on small tablets. */}
      <Logo
        href="/my-twyns"
        height={26}
        className="shrink-0 lg:hidden"
        wordmarkClassName="hidden sm:inline"
      />
      {isEditTwyn && (
        <Link
          href="/my-twyns"
          className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-gray-3 transition-colors hover:text-dark"
        >
          <ArrowLeft size={15} /> All twyns
        </Link>
      )}
      {/* No search on the twyn editor — it has no list to filter.
          Hidden on phones (it squeezes to nothing); revisited in the pages phase. */}
      {!isEditTwyn && !isMarketplace && (
        <SearchInput placeholder={placeholder} onChange={handleSearch} className="hidden max-w-[480px] flex-1 sm:block" />
      )}
      <div className="flex-1" />
      <div className="flex items-center gap-[7px]">
        {onNotifications ? (
          // Already on notifications — clicking the bell closes and returns you.
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Close notifications"
            className="relative grid h-11 w-11 place-items-center rounded-[9px] border border-violet bg-violet text-white transition-colors lg:h-9 lg:w-9"
          >
            <Bell size={15} />
          </button>
        ) : (
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative grid h-11 w-11 place-items-center rounded-[9px] border border-border text-gray-3 transition-colors hover:border-violet hover:text-violet lg:h-9 lg:w-9"
          >
            <Bell size={15} />
            <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-violet px-1 text-[9px] font-bold text-white">
              5
            </span>
          </Link>
        )}
        {/* Avatar dropdown is desktop-only — on mobile the Account bottom-tab
            (→ the account hub) owns profile/billing/sign-out. */}
        <div className="hidden lg:block">
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
