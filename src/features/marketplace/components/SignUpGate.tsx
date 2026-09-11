"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { pillClass } from "@/features/shared/components/PillButton";

// Public mode: any add / purchase / hire action opens this gate first.
export function SignUpGate({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] text-center">
        <DialogHeader className="items-center">
          <span className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-violet-light text-violet">
            <Sparkles size={22} />
          </span>
          <DialogTitle className="font-heading text-[20px] font-semibold tracking-[-0.4px] text-dark">
            Create your twyn first
          </DialogTitle>
          <DialogDescription className="text-[13px] leading-[1.55] text-gray-3">
            You need a twyn to add skills, connect tools, or hire from the
            community. It takes under four clicks — your first twyn is free.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3 flex flex-col items-center gap-2">
          <Link
            href="/onboarding"
            className={pillClass("primary", "md", "w-full")}
          >
            Get started
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-gray-4"
          >
            Keep browsing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
