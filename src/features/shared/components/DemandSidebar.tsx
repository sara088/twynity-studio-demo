"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Building2,
  UserPlus,
  Compass,
  Heart,
  Activity,
  Inbox,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Building2;
  match?: string;
};

const NAV: NavItem[] = [
  { href: "/workforce",  label: "Workforce",  icon: Building2 },
  { href: "/hire",       label: "Hire",       icon: UserPlus, match: "/hire" },
  { href: "/discover",   label: "Discover",   icon: Compass },
  { href: "/shortlists", label: "Shortlists", icon: Heart },
  { href: "/activity",   label: "Activity",   icon: Activity },
  { href: "/inbox",      label: "Inbox",      icon: Inbox },
  { href: "/spend",      label: "Spend",      icon: Wallet },
];

export function DemandSidebar() {
  const pathname = usePathname();

  return (
    <aside className="group/sidebar flex h-full w-[60px] shrink-0 flex-col border-r border-border bg-white transition-[width] duration-200 ease-out hover:w-[200px]">

      {/* Logo */}
      <div className="flex items-center border-b border-border px-4 pb-[18px] pt-[22px]">
        <Link href="/" aria-label="Twynity" className="flex items-center gap-[9px]">
          <Image
            src="/assets/twynity-logo.svg"
            alt="Twynity"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0"
            priority
          />
          <span className="max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-200 ease-out group-hover/sidebar:max-w-[120px] font-heading text-[17px] font-bold tracking-[-0.4px] text-dark">
            Twynity
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col overflow-y-auto p-[10px] scrollbar-none">
        {NAV.map((item) => {
          const Icon = item.icon;
          const match = item.match ?? item.href;
          const active = pathname === match || pathname.startsWith(`${match}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-[10px] rounded-[9px] px-3 py-[9px] text-[13px] mb-0.5",
                "transition-[background,color] duration-[120ms]",
                active
                  ? "bg-violet font-semibold text-white"
                  : "font-medium text-gray-3 hover:bg-input-bg hover:text-dark"
              )}
            >
              <Icon size={15} strokeWidth={2} className="shrink-0" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap transition-[max-width] duration-200 ease-out group-hover/sidebar:max-w-[160px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
