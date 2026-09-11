import Link from "next/link";
import { ArrowLeft, ArrowRight, Receipt } from "lucide-react";
import { CurrentPlanCard } from "@/features/top-up/components/CurrentPlanCard";
import { PlansSection } from "@/features/top-up/components/PlansSection";

export default function PlansPage() {
  return (
    <div className="mx-auto max-w-[960px]">
      <Link
        href="/account"
        className="mb-6 inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-2 hover:border-violet hover:text-violet"
      >
        <ArrowLeft size={13} /> Back
      </Link>

      <header className="mb-7">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-[-0.6px] text-dark">
          Plans
        </h1>
        <p className="mt-1.5 text-[13.5px] text-gray-3">
          Your current plan, and how the others compare.
        </p>
      </header>

      <h2 className="mb-4 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-gray-5">
        Compare plans
      </h2>
      <PlansSection />

      <h2 className="mb-4 mt-10 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-gray-5">
        Your current plan
      </h2>
      <CurrentPlanCard />

      {/* Cross-link to the dedicated billing page */}
      <Link
        href="/billing"
        className="mt-6 flex items-center gap-3.5 rounded-[14px] border border-border bg-white px-5 py-4 transition-colors hover:border-violet"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-violet-light text-violet">
          <Receipt size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-bold text-dark">Billing &amp; invoices</span>
          <span className="mt-0.5 block text-[12px] text-gray-4">
            Payment method, billing details, and past charges.
          </span>
        </span>
        <ArrowRight size={16} className="shrink-0 text-gray-5" />
      </Link>
    </div>
  );
}
