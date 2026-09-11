"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { POLICIES, type PolicyKey } from "../data/policies";

// Inline link that opens the matching policy in a popup. Rendered as a button so
// it works inside a <label> (consent/terms) without toggling the checkbox.
export function PolicyLink({
  policy,
  children,
}: {
  policy: PolicyKey;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const doc = POLICIES[policy];

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="font-semibold text-violet underline-offset-2 transition-colors hover:text-violet-h hover:underline"
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[84vh] max-w-[560px] gap-0 overflow-hidden rounded-card p-0">
          <div className="border-b border-border px-7 py-5">
            <DialogTitle className="font-heading text-[19px] font-semibold tracking-[-0.4px] text-dark">
              {doc.title}
            </DialogTitle>
            <DialogDescription className="mt-1 text-[12.5px] text-gray-4">
              {doc.updated} · Placeholder copy for the prototype.
            </DialogDescription>
          </div>

          <div className="scrollbar-thin max-h-[62vh] space-y-5 overflow-y-auto px-7 py-6">
            {doc.sections.map((s) => (
              <section key={s.heading}>
                <h3 className="mb-1.5 font-heading text-[14px] font-semibold tracking-[-0.2px] text-dark">
                  {s.heading}
                </h3>
                <p className="text-[13px] leading-[1.6] text-gray-3">{s.body}</p>
              </section>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
