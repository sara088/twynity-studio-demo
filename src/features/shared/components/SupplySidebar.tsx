"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Users,
  Network,
  Box,
  Workflow,
  Store,
  Handshake,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UsageCard } from "./UsageCard";
import { useLimit } from "../hooks/useLimit";
import { SARA } from "../data/personas";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Users;
  soon?: boolean;
};

// Per 99-shared-components.md. "Workshop" routes to /assets.
const NAV: NavItem[] = [
  { href: "/my-twyns", label: "My Twyns", icon: Users },
  { href: "/teams", label: "Teams", icon: Network },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/assets", label: "Workshop", icon: Box },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/engagements", label: "Engagements", icon: Handshake, soon: true },
  { href: "/messages", label: "Messages", icon: MessageSquare, soon: true },
  { href: "/earnings", label: "Earnings", icon: DollarSign, soon: true },
];

// Collapsed icon-rail (64px) that expands to 248px on hover. Absolutely
// positioned and overlays the content (the layout reserves 64px) so hovering
// never reflows the page. Labels + Soon pills fade/slide in on hover.
export function SupplySidebar() {
  const pathname = usePathname();
  const limit = useLimit();

  return (
    <aside className="group/sb absolute bottom-0 left-0 top-0 z-50 hidden w-16 flex-col overflow-hidden border-r border-border bg-white transition-[width,box-shadow] duration-[380ms] ease-soft will-change-[width] hover:w-[248px] hover:shadow-[4px_0_20px_rgba(15,15,30,0.10)] lg:flex">
      {/* Logo — signed-in, so it leads to My Twyns (not the landing page). */}
      <span
        aria-label="Twynity"
        className="flex cursor-default items-center gap-[11px] border-b border-border px-[18px] pb-[18px] pt-[22px]"
      >
        <Image src="/assets/twynity-logo.svg" alt="" width={28} height={28} className="h-7 w-7 shrink-0" priority />
        <span className="-translate-x-1 whitespace-nowrap font-heading text-[17px] font-bold tracking-[-0.4px] text-dark opacity-0 transition-[opacity,transform] duration-200 ease-soft group-hover/sb:translate-x-0 group-hover/sb:opacity-100 group-hover/sb:delay-[80ms]">
          Twynity
        </span>
      </span>

      {/* Nav */}
      <nav className="scrollbar-none flex-1 overflow-y-auto p-[10px]">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = !item.soon && (pathname === item.href || pathname.startsWith(`${item.href}/`));
          const cls = cn(
            "mb-0.5 flex items-center gap-[14px] overflow-hidden whitespace-nowrap rounded-[9px] px-[18px] py-[9px] text-[13px] font-medium transition-[background,color] duration-[120ms]",
            active
              ? "bg-violet font-semibold"
              : item.soon
                ? "cursor-not-allowed opacity-55"
                : "hover:bg-bg-input",
          );
          const iconCls = cn("shrink-0", active ? "text-white" : "text-gray-3");
          const labelCls = cn(
            "-translate-x-1 opacity-0 transition-[opacity,transform] duration-200 ease-soft group-hover/sb:translate-x-0 group-hover/sb:opacity-100 group-hover/sb:delay-[100ms]",
            active ? "text-white" : "text-gray-3",
          );
          const inner = (
            <>
              <Icon size={15} strokeWidth={2} className={iconCls} />
              <span className={labelCls}>{item.label}</span>
              {item.soon && (
                <span className="ml-auto -translate-x-1 rounded-chip border border-border bg-bg-input px-[6px] py-[2px] text-[9px] font-bold uppercase leading-[1.2] tracking-[0.06em] text-gray-5 opacity-0 transition-[opacity,transform] duration-200 ease-soft group-hover/sb:translate-x-0 group-hover/sb:opacity-100 group-hover/sb:delay-[100ms]">
                  Soon
                </span>
              )}
            </>
          );
          // Demo build: the rail shows where the product goes without going
          // there. Every item is inert, so a client walkthrough can't wander
          // out of the studio into a half-finished page.
          return (
            <div
              key={item.href}
              className={cn(cls, "cursor-default")}
              aria-disabled
              title={item.soon ? "Coming soon" : undefined}
            >
              {inner}
            </div>
          );
        })}
      </nav>

      {/* Collapsed rail: a small alert dot so a blocked account (out of credits
          / trial over) is visible without expanding. Fades out on hover, where
          the full usage card below takes over. */}
      {limit && (
        <div
          className="flex justify-center pb-2.5 transition-opacity duration-200 ease-soft group-hover/sb:opacity-0"
          aria-hidden
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-error/10">
            <span className="h-2 w-2 rounded-full bg-error ring-2 ring-error/20" />
          </span>
        </div>
      )}

      {/* Bottom — fades in on hover (hidden when collapsed) */}
      <div className="pointer-events-none opacity-0 transition-opacity duration-200 ease-soft group-hover/sb:pointer-events-auto group-hover/sb:opacity-100 group-hover/sb:delay-[100ms]">
        <div className="w-[248px] border-t border-border px-[13px] pb-2.5 pt-[14px]">
          {/* Static creator info — no persona switching (supply only). */}
          <div className="mb-2 flex items-center gap-2 px-1">
            <Image
              src={SARA.avatar}
              alt=""
              width={30}
              height={30}
              className="h-[30px] w-[30px] shrink-0 rounded-full bg-violet-mid object-cover object-top"
            />
            <span>
              <span className="block text-[12px] font-bold leading-tight text-dark">{SARA.name}</span>
              <span className="block text-[10px] text-gray-5">{SARA.role}</span>
            </span>
          </div>
          <UsageCard />
        </div>
      </div>
    </aside>
  );
}
