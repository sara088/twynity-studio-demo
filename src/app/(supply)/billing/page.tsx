import Link from "next/link";
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react";
import { PaymentMethodCard } from "@/features/top-up/components/PaymentMethodCard";
import { InvoicesCard } from "@/features/top-up/components/InvoicesCard";

export default function BillingPage() {
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
          Billing
        </h1>
        <p className="mt-1.5 text-[13.5px] text-gray-3">
          Payments are handled by Stripe. Your charge history lives here.
        </p>
      </header>

      <div className="space-y-5">
        <PaymentMethodCard />
        <InvoicesCard />
      </div>

      {/* Cross-link back to plans */}
      <Link
        href="/plans"
        className="mt-6 flex items-center gap-3.5 rounded-[14px] border border-border bg-white px-5 py-4 transition-colors hover:border-violet"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-violet-light text-violet">
          <Rocket size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-bold text-dark">Plans</span>
          <span className="mt-0.5 block text-[12px] text-gray-4">
            See your current plan and compare upgrades.
          </span>
        </span>
        <ArrowRight size={16} className="shrink-0 text-gray-5" />
      </Link>
    </div>
  );
}
