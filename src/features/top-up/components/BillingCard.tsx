import type { ReactNode } from "react";

// Shared shell for the billing blocks — same surface as YourCreditsPanel so the
// page reads as one consistent stack of cards.
export function BillingCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-[18px] border-[1.5px] border-border bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-[18px] font-semibold tracking-[-0.3px] text-dark">
            {title}
          </h2>
          {description && <p className="mt-1 text-[12.5px] text-gray-3">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

// Label / value row used inside the billing details card.
export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="shrink-0 text-[12.5px] font-medium text-gray-4">{label}</span>
      <span className="min-w-0 text-right text-[13px] font-semibold text-dark">{value}</span>
    </div>
  );
}
