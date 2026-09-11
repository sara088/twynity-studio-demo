import { USAGE_SUMMARY } from "../data/mock-data";

export function YourCreditsPanel() {
  const { used, total, resetsOn, topUpUsed, topUpTotal } = USAGE_SUMMARY;
  const pct = Math.min(100, Math.round((used / total) * 100));
  const topUpPct = topUpTotal > 0 ? Math.min(100, Math.round((topUpUsed / topUpTotal) * 100)) : 0;

  // Separate buckets, shown as clean labeled rows (see spend from each).
  const rows = [
    { label: "Plan credits", sub: `Resets ${resetsOn}`, used, total, pct },
    { label: "Top-up credits", sub: "Doesn’t reset", used: topUpUsed, total: topUpTotal, pct: topUpPct },
  ];

  return (
    <section className="rounded-[18px] border-[1.5px] border-border bg-white p-6">
      <h2 className="font-heading text-[18px] font-semibold tracking-[-0.3px] text-dark">Your credits</h2>
      <p className="mt-1 text-[12.5px] text-gray-3">
        Time you spend talking to your own twyns — split by where the credits come from.
      </p>

      <div className="mt-6 space-y-6">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-4 sm:gap-6">
            <div className="w-[140px] shrink-0 sm:w-[180px]">
              <div className="text-[14px] font-semibold text-dark">{r.label}</div>
              <div className="mt-0.5 text-[12px] leading-[1.4] text-gray-4">{r.sub}</div>
            </div>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-input">
              <div
                className="h-full rounded-full bg-violet transition-[width] duration-300 ease-out"
                style={{ width: `${r.pct}%` }}
              />
            </div>
            <div className="w-[78px] shrink-0 text-right">
              <div className="text-[13px] font-semibold text-gray-2 tabular-nums">{r.pct}% used</div>
              <div className="text-[11px] text-gray-5 tabular-nums">
                {r.used}/{r.total}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
