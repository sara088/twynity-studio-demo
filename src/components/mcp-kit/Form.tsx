import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────
// Form primitives — for the "needs input" path (a parameter or a choice the
// app requires before it can act). Field wraps a labelled control; Input and
// Select are tokenised controls. Keep forms short: ask only for what's needed.
// ─────────────────────────────────────────────────────────────────────────

function Form({ className, ...props }: React.ComponentProps<"form">) {
  return (
    <form
      data-slot="mcp-form"
      className={cn("space-y-3.5", className)}
      {...props}
    />
  );
}

function Field({
  className,
  label,
  hint,
  children,
}: {
  className?: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div data-slot="mcp-field" className={cn("space-y-1.5", className)}>
      <label className="block text-[12.5px] font-semibold text-gray-2">
        {label}
      </label>
      {children}
      {hint != null && <p className="text-[11.5px] text-gray-4">{hint}</p>}
    </div>
  );
}

const controlClasses =
  "w-full rounded-input border border-border bg-bg-input px-3 py-2 text-[13px] text-dark outline-none transition-colors placeholder:text-gray-5 focus:border-violet focus:bg-white";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="mcp-input"
      className={cn(controlClasses, className)}
      {...props}
    />
  );
}

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="mcp-select"
      className={cn(controlClasses, "appearance-none", className)}
      {...props}
    />
  );
}

export { Form, Field, Input, Select };
