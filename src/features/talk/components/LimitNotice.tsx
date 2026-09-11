import Link from "next/link";
import { Gauge, Clock, RefreshCw, ArrowUpRight, Plus, type LucideIcon } from "lucide-react";

// Shown in the studio chat when the account can no longer send. Two block
// reasons — spent credits, or the subscription is over — and the subscription
// case reads differently depending on whether the account was on a free trial
// or a paid plan (a trial is just a form of subscription). Nothing auto-recovers.
export type LimitKind = "credits" | "subscription";
export type LimitPlan = "trial" | "paid";

type Variant = {
  divider: string;
  icon: LucideIcon;
  title: string;
  body: React.ReactNode;
  cta: string;
  href: string;
  topUp?: boolean; // show the credits-only "Top up" secondary
};

const strong = (s: string) => <span className="font-semibold text-gray-2">{s}</span>;

function variantFor(kind: LimitKind, plan: LimitPlan): Variant {
  if (kind === "credits") {
    return {
      divider: "You've reached your credit limit.",
      icon: Gauge,
      title: "You're out of credits",
      body: (
        <>
          To keep talking to your twyns, {strong("upgrade your plan")} for more, or{" "}
          {strong("top up")} with a one-off pack.
        </>
      ),
      cta: "Upgrade plan",
      href: "/plans",
      topUp: true,
    };
  }
  if (plan === "paid") {
    return {
      divider: "Your subscription has ended.",
      icon: RefreshCw,
      title: "Your subscription is over",
      body: (
        <>
          Your plan has lapsed. Reactivate to pick up right where you left off — your twyns,
          avatars, and knowledge are all still here.
        </>
      ),
      cta: "Reactivate plan",
      href: "/plans",
    };
  }
  return {
    divider: "Your 15-day free trial has ended.",
    icon: Clock,
    title: "Your free trial is over",
    body: (
      <>Thanks for trying Twynity. Choose a plan to keep your twyns and pick up right where you left off.</>
    ),
    cta: "Choose a plan",
    href: "/plans",
  };
}

export function LimitNotice({ kind, plan = "trial" }: { kind: LimitKind; plan?: LimitPlan }) {
  const v = variantFor(kind, plan);
  const Icon = v.icon;
  return (
    <div className="mx-auto w-full max-w-[768px] px-7 pb-3 pt-1">
      {/* Divider line with centered status text */}
      <div className="mb-3 flex items-center gap-3 text-[12px] leading-[1.4] text-gray-4">
        <span className="hidden h-px flex-1 bg-border @[480px]:block" />
        <span className="inline-flex items-center gap-1.5 text-center">
          <Icon size={13} className="shrink-0" />
          {v.divider}
        </span>
        <span className="hidden h-px flex-1 bg-border @[480px]:block" />
      </div>

      {/* Card: message + the way(s) forward */}
      <div className="rounded-[14px] border border-border bg-white p-4">
        <div className="flex items-start gap-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-light text-violet">
            <Icon size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-bold tracking-[-0.2px] text-dark">{v.title}</div>
            <div className="mt-0.5 text-[12px] leading-[1.45] text-gray-4">{v.body}</div>
          </div>
        </div>

        {/* CTAs — stack on narrow, sit side by side once there's room. Top-up is a
            credits-only path; a subscription ends into a plan choice. */}
        <div className="mt-3.5 flex flex-col gap-2 @[420px]:flex-row @[420px]:justify-end">
          {v.topUp && (
            <Link
              href="/top-up"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-[12.5px] font-bold text-gray-2 transition-colors hover:border-violet hover:text-violet"
            >
              <Plus size={14} /> Top up credits
            </Link>
          )}
          <Link
            href={v.href}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-violet px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-violet-h"
          >
            {v.cta} <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
