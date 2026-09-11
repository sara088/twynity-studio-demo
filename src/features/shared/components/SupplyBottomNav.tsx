"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Network, Box, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLimit } from "../hooks/useLimit";

// Primary mobile/tablet navigation — a thumb-reachable bottom tab bar. Shown
// below `lg`, where the hover-expand sidebar can't work on touch; the sidebar
// takes over at `lg+`. Mirrors the sidebar's primary destinations (the "soon"
// items are omitted to keep tabs to the reachable core).
const TABS = [
  { href: "/my-twyns", label: "Twyns", icon: Users },
  { href: "/teams", label: "Teams", icon: Network },
  { href: "/assets", label: "Workshop", icon: Box },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/account", label: "Account", icon: User },
];

export function SupplyBottomNav() {
  const pathname = usePathname();
  const limit = useLimit();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex items-stretch">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
          // Account is where billing/upgrade lives — flag it when blocked.
          const alert = limit !== null && t.href === "/account";
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 pb-1.5 pt-2 text-[11px] font-semibold transition-colors",
                  active ? "text-violet" : "text-gray-3",
                )}
              >
                <span className="relative">
                  <Icon size={21} strokeWidth={2} />
                  {alert && (
                    <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-error ring-2 ring-white" />
                  )}
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
