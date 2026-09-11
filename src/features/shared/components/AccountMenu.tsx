"use client";

import Image from "next/image";
import Link from "next/link";
import { Archive, ChevronDown, User, CreditCard, LogOut, Compass, Rocket, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SARA } from "../data/personas";
import { useUnreadRelease } from "@/features/releases/lib/seen";

const EMAIL = "sara.gordic@gmail.com";
const ITEM = "cursor-pointer gap-2.5 rounded-[8px] px-2 py-2 text-[13px] text-gray-2 focus:bg-violet-light focus:text-dark";

// Account dropdown shown in the product topbar (shadcn DropdownMenu).
// `onTakeTour`, when provided, adds a "Take tour again" item (used on the talk page).
export function AccountMenu({ onTakeTour }: { onTakeTour?: () => void } = {}) {
  const unread = useUnreadRelease();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={unread ? "Account — what's new" : "Account"}
          className="group relative flex items-center gap-1.5 rounded-[10px] border border-border bg-white py-1 pl-1 pr-2 outline-none transition-colors hover:border-violet data-[state=open]:border-violet"
        >
          <Image src={SARA.avatar} alt="" width={28} height={28} className="h-7 w-7 rounded-md bg-violet-mid object-cover object-top" />
          <ChevronDown size={12} strokeWidth={2.5} className="text-gray-5 transition-transform group-data-[state=open]:rotate-180" />
          {unread && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-violet ring-2 ring-white" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-[240px] rounded-input border-border p-1.5 shadow-[0_12px_40px_rgba(15,15,30,0.14)]"
      >
        <div className="mb-1 flex items-center gap-2.5 border-b border-border px-2 pb-3 pt-2">
          <Image src={SARA.avatar} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-[8px] bg-violet-mid object-cover object-top" />
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold text-dark">{SARA.name}</div>
            <div className="truncate text-[11.5px] text-gray-4">{EMAIL}</div>
          </div>
        </div>

        <DropdownMenuItem asChild className={ITEM}>
          <Link href="/account/settings">
            <User size={15} /> Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={ITEM}>
          <Link href="/my-archive">
            <Archive size={15} /> My Archive
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={ITEM}>
          <Link href="/plans">
            <Rocket size={15} /> Plans
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={ITEM}>
          <Link href="/billing">
            <CreditCard size={15} /> Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={ITEM}>
          <Link href="/whats-new">
            <Sparkles size={15} /> What&apos;s new
            {unread && <span className="ml-auto h-2 w-2 rounded-full bg-violet" />}
          </Link>
        </DropdownMenuItem>
        {onTakeTour && (
          <DropdownMenuItem className={ITEM} onSelect={onTakeTour}>
            <Compass size={15} /> Take tour again
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="my-1 bg-border" />
        <DropdownMenuItem asChild className="cursor-pointer gap-2.5 rounded-[8px] px-2 py-2 text-[13px] text-error focus:bg-error/10 focus:text-error">
          <Link href="/">
            <LogOut size={15} /> Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
