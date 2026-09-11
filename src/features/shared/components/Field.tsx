import type { ReactNode } from "react";

// Design-system form field: a label tightly coupled to its control (6px gap),
// so groups read as units. Stack Fields with `space-y-5` (20px) on the parent
// for the larger between-group rhythm. Use this for every form across the app.
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13.5px] font-semibold text-dark">
          {label}
        </label>
        {hint ? <span className="text-[12px] text-gray-4">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}
