export function SpendCard({
  amount = 8_410,
  cap = 25_000,
}: {
  amount?: number;
  cap?: number;
}) {
  const pct = Math.min(100, Math.round((amount / cap) * 100));
  return (
    <div className="mb-2.5 rounded-[10px] border-[1.5px] border-border bg-input-bg px-3 py-3">
      <div className="mb-2 block">
        <div className="mb-1 font-heading text-[9.5px] font-semibold uppercase tracking-[0.14em] text-gray-5">
          Spend MTD
        </div>
        <div className="font-sans text-[18px] font-bold leading-none tracking-[-0.4px] text-dark tabular-nums">
          ${amount.toLocaleString()}
          <span className="font-medium text-gray-4">
            /${cap.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mb-2 h-[5px] overflow-hidden rounded-[3px] bg-border">
        <div
          className="h-full rounded-[3px] bg-violet transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[10.5px] text-gray-4">
        <span>Q4 budget</span>
        <a href="#" className="font-bold text-violet hover:underline">
          Manage
        </a>
      </div>
    </div>
  );
}
