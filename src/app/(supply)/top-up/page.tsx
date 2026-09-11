import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { YourCreditsPanel } from "@/features/top-up/components/YourCreditsPanel";
import { BuyCredits } from "@/features/top-up/components/BuyCredits";

export default function TopUpPage() {
  return (
    <div className="mx-auto max-w-[960px]">
      <Link
        href="/my-twyns"
        className="mb-6 inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-white px-3 py-1.5 text-[12.5px] font-semibold text-gray-2 hover:border-violet hover:text-violet"
      >
        <ArrowLeft size={13} /> Back
      </Link>

      <header className="mb-7">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-[-0.6px] text-dark">
          Usage &amp; credits
        </h1>
        <p className="mt-1.5 text-[13.5px] text-gray-3">
          See how many AI credits you&apos;ve used this month and top up any time.
        </p>
      </header>

      <div className="space-y-5">
        <YourCreditsPanel />
        <BuyCredits />
      </div>

      <p className="mt-6 text-[12.5px] text-gray-4">
        Want more credits every month and team features?{" "}
        <Link href="/plans" className="font-semibold text-violet hover:underline">
          Compare plans
        </Link>
        .
      </p>
    </div>
  );
}
