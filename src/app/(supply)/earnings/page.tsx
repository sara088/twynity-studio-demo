import { PageHeader } from "@/features/shared/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { EARNINGS, EARNINGS_SUMMARY } from "@/features/earnings/data/mock-data";

const STATS = [
  { label: "MTD", key: "mtd" as const, accent: true },
  { label: "YTD", key: "ytd" as const },
  { label: "Pending", key: "pending" as const },
];

export default function EarningsPage() {
  return (
    <>
      <PageHeader
        title="Earnings"
        subtitle="Money your twyns made while you were doing other things."
        actions={
          <Button variant="outline" size="md">
            <Download size={14} />
            Export
          </Button>
        }
      />

      <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-[14px] border-[1.5px] border-border bg-white p-5"
          >
            <div className="mb-2 font-heading text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gray-5">
              {s.label}
            </div>
            <div
              className={`font-heading text-[28px] font-semibold leading-none tracking-[-0.6px] tabular-nums ${
                s.accent ? "text-violet" : "text-dark"
              }`}
            >
              ${EARNINGS_SUMMARY[s.key].toLocaleString()}
            </div>
          </div>
        ))}
        <div className="rounded-[14px] border-[1.5px] border-border bg-white p-5">
          <div className="mb-2 font-heading text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gray-5">
            Next payout
          </div>
          <div className="font-heading text-[18px] font-semibold tracking-[-0.3px] text-dark">
            {EARNINGS_SUMMARY.nextPayout}
          </div>
          <a
            href="#"
            className="mt-2 inline-block text-[11.5px] font-bold text-violet hover:underline"
          >
            Connect bank →
          </a>
        </div>
      </div>

      <h2 className="mb-3 font-heading text-[17px] font-semibold tracking-[-0.3px] text-dark">
        Recent activity
      </h2>
      <div className="overflow-hidden rounded-[14px] border-[1.5px] border-border bg-white">
        <div className="grid grid-cols-[140px_1fr_120px_140px] gap-4 border-b border-border bg-input-bg px-5 py-3 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-5">
          <div>Date</div>
          <div>Source</div>
          <div className="text-right">Credits</div>
          <div className="text-right">Amount</div>
        </div>
        {EARNINGS.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-[140px_1fr_120px_140px] items-center gap-4 border-b border-border px-5 py-3.5 last:border-b-0 hover:bg-input-bg/50"
          >
            <div className="text-[12.5px] text-gray-3 tabular-nums">{r.date}</div>
            <div className="text-[13px] text-dark">{r.source}</div>
            <div className="text-right text-[13px] text-gray-3 tabular-nums">
              {r.credits}
            </div>
            <div className="text-right text-[13px] font-bold text-violet tabular-nums">
              ${r.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
