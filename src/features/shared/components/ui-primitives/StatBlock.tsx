import { cn } from "@/lib/utils";

export function StatBlock({
  label,
  value,
  unit,
  accent,
  className,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <div className="mb-1 font-heading text-[9.5px] font-semibold uppercase tracking-[0.14em] text-gray-5">
        {label}
      </div>
      <div
        className={cn(
          "inline-flex items-baseline gap-[3px] text-[17px] font-semibold leading-none tracking-[-0.4px] tabular-nums",
          accent ? "text-violet" : "text-dark"
        )}
      >
        {value}
        {unit && (
          <span className="text-[11px] font-medium text-gray-4">{unit}</span>
        )}
      </div>
    </div>
  );
}
