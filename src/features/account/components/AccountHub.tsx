import Image from "next/image";
import Link from "next/link";
import { Archive, ArrowLeft, ChevronRight, CreditCard, Gauge, LogOut, Rocket } from "lucide-react";
import { SARA } from "@/features/shared/data/personas";
import { cn } from "@/lib/utils";

const EMAIL = "sara.gordic@gmail.com";

// Account hub — a menu you choose from (settings, billing, help, sign out)
// rather than one long expanded page. The bottom-nav Account tab lands here;
// each row opens its own detail page.
export function AccountHub() {
  return (
    <div className="mx-auto max-w-[680px]">
      <Link
        href="/my-twyns"
        className="mb-6 inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-2 hover:border-violet hover:text-violet"
      >
        <ArrowLeft size={13} /> Back
      </Link>

      <header className="mb-7">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-[-0.6px] text-dark">
          Account
        </h1>
        <p className="mt-1.5 text-[13.5px] text-gray-3">
          Manage your profile, billing, and more.
        </p>
      </header>

      <div className="overflow-hidden rounded-[18px] border-[1.5px] border-border bg-white">
        {/* Profile summary → settings */}
        <Link
          href="/account/settings"
          className="flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-bg-input"
        >
          <Image
            src={SARA.avatar}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-[13px] bg-violet-mid object-cover object-top"
          />
          <span className="min-w-0 flex-1">
            <span className="block font-heading text-[16px] font-semibold tracking-[-0.2px] text-dark">
              Account settings
            </span>
            <span className="mt-0.5 block truncate text-[12.5px] text-gray-3">{EMAIL}</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-gray-5" />
        </Link>

        <HubRow href="/my-archive" icon={Archive} label="My Archive" desc="Things set aside by a plan change, or by you. Restore any time." />
        <HubRow href="/top-up" icon={Gauge} label="Usage & credits" desc="See this month's usage and top up credits." />
        <HubRow href="/plans" icon={Rocket} label="Plans" desc="Your current plan and upgrade options." />
        <HubRow href="/billing" icon={CreditCard} label="Billing" desc="Payment method, billing details, and invoices." />
      </div>

      <Link
        href="/"
        className="mt-5 flex min-h-[52px] items-center gap-2.5 rounded-[14px] border-[1.5px] border-border bg-white px-5 text-[14px] font-semibold text-error transition-colors hover:border-error"
      >
        <LogOut size={17} /> Sign out
      </Link>
    </div>
  );
}

function HubRow({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: typeof CreditCard;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-3.5 border-t border-border px-5 py-4 transition-colors hover:bg-bg-input")}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] bg-violet-light text-violet">
        <Icon size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-[16px] font-semibold tracking-[-0.2px] text-dark">
          {label}
        </span>
        <span className="mt-0.5 block text-[12.5px] text-gray-3">{desc}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-gray-5" />
    </Link>
  );
}
