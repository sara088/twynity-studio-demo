"use client";

import Link from "next/link";
import { Logo } from "@/features/shared/components/Logo";
import { pillClass } from "@/features/shared/components/PillButton";

// Public (logged-out) topbar — replaces the supply sidebar/topbar. Logo left,
// "Sign in" + "Create your twyn" right. Search lives in the page itself (the
// hero on the home, the in-page filter on category pages), not the header.
export function PublicMarketplaceHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-4 border-b border-border bg-white/90 px-6 backdrop-blur">
      <Logo href="/" height={26} />

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-btn px-3 py-2 text-[13px] font-semibold text-gray-2 transition-colors hover:text-violet"
        >
          Sign in
        </Link>
        <Link href="/onboarding" className={pillClass("primary", "sm")}>
          Create your twyn
        </Link>
      </div>
    </header>
  );
}
