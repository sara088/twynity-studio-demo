"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

export interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  soon?: boolean;
  match?: string;
}

export function SidebarNavItem({
  href,
  label,
  icon: Icon,
  soon,
  match,
}: SidebarNavItemProps) {
  const pathname = usePathname();
  const m = match ?? href;
  const active = !soon && (pathname === m || pathname.startsWith(`${m}/`));

  const inner = (
    <>
      <Icon
        className={cn(
          "h-[15px] w-[15px] shrink-0 stroke-[2]",
          active ? "text-white" : "text-gray-3"
        )}
      />
      <span className="truncate">{label}</span>
      {soon && (
        <span className="ml-auto rounded-full border border-border bg-input-bg px-1.5 py-[2px] text-[9px] font-bold uppercase leading-tight tracking-[0.06em] text-gray-5">
          Soon
        </span>
      )}
    </>
  );

  if (soon) {
    return (
      <div
        title="Coming soon"
        className="mb-0.5 flex cursor-not-allowed items-center gap-2.5 rounded-[9px] px-3 py-[9px] text-[13px] font-medium text-gray-3 opacity-55"
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "mb-0.5 flex items-center gap-2.5 rounded-[9px] px-3 py-[9px] text-[13px] font-medium transition-colors duration-150",
        active
          ? "bg-violet font-semibold text-white"
          : "text-gray-3 hover:bg-input-bg hover:text-dark"
      )}
    >
      {inner}
    </Link>
  );
}
