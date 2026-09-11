"use client";

import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function CreateTwynFirstModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[460px] rounded-[22px] border-border bg-white p-8 text-center"
      >
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-[16px] bg-violet-light text-violet">
          <Users size={22} strokeWidth={1.8} />
        </div>

        <DialogTitle className="font-heading text-[22px] font-bold tracking-[-0.4px] text-dark">
          Create your twyn first
        </DialogTitle>
        <DialogDescription className="mx-auto mt-2.5 max-w-[340px] text-[13.5px] leading-[1.6] text-gray-3">
          Build your twyn in under 2 minutes, then come back to equip it with
          capabilities, skills, and tools from the marketplace.
        </DialogDescription>

        <Link
          href="/onboarding/identity"
          onClick={() => onOpenChange(false)}
          className="mt-7 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-violet text-[14px] font-bold text-white shadow-[0_10px_28px_rgba(108,92,231,0.35)] hover:bg-violet-hover"
        >
          Get started <ArrowRight size={15} />
        </Link>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="mt-4 inline-block text-[13px] font-semibold text-gray-4 hover:text-dark"
        >
          Just browsing
        </button>
      </DialogContent>
    </Dialog>
  );
}
