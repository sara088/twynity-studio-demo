"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field } from "@/features/shared/components/Field";
import { PillButton } from "@/features/shared/components/PillButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputCls =
  "h-11 rounded-input border-border bg-white px-[14px] text-[14px] placeholder:text-gray-6";

// Simple "talk to sales" message form for the Teams plan. Mocked: a valid
// submission shows a thank-you state (no backend).
export function ContactSalesModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setMessage("");
      setSubmitted(false);
      setSent(false);
    }
  }, [open]);

  const nameErr = name.trim() ? "" : "Enter your name.";
  const emailErr = EMAIL_RE.test(email.trim()) ? "" : "Enter a valid work email.";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (nameErr || emailErr) return;
    setSent(true);
    toast.success("Message sent — we'll be in touch.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] rounded-card p-7">
        {sent ? (
          <div className="py-2 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-[14px] bg-violet-light text-violet">
              <CheckCircle2 size={24} />
            </div>
            <DialogTitle className="font-heading text-[20px] font-semibold tracking-[-0.4px] text-dark">
              Thanks — we&apos;ll be in touch.
            </DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-[320px] text-[13.5px] leading-[1.55] text-gray-3">
              Our team will reach out at{" "}
              <strong className="font-semibold text-dark">{email}</strong> about the Teams plan.
            </DialogDescription>
            <PillButton className="mt-6" onClick={() => onOpenChange(false)}>
              Done
            </PillButton>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-heading text-[19px] font-semibold tracking-[-0.4px] text-dark">
                Talk to sales
              </DialogTitle>
              <DialogDescription className="text-[13px] text-gray-3">
                Tell us about your team and we&apos;ll set up a Teams plan with you.
              </DialogDescription>
            </DialogHeader>

            <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
              <Field label="Full name" htmlFor="cs-name">
                <Input
                  id="cs-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  aria-invalid={submitted && Boolean(nameErr)}
                  className={inputCls}
                />
                {submitted && nameErr && <Err>{nameErr}</Err>}
              </Field>

              <Field label="Work email" htmlFor="cs-email">
                <Input
                  id="cs-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  aria-invalid={submitted && Boolean(emailErr)}
                  className={inputCls}
                />
                {submitted && emailErr && <Err>{emailErr}</Err>}
              </Field>

              <div>
                <label htmlFor="cs-msg" className="mb-1.5 block text-[13px] font-semibold text-dark">
                  Message <span className="font-normal text-gray-4">(optional)</span>
                </label>
                <textarea
                  id="cs-msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What are you looking to build?"
                  className="min-h-[96px] w-full resize-y rounded-input border border-border bg-white px-[14px] py-3 text-[14px] leading-[1.5] text-dark outline-none placeholder:text-gray-6 focus:border-violet"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-1">
                <PillButton type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </PillButton>
                <PillButton type="submit" size="sm">
                  Send message
                </PillButton>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11.5px] font-medium text-error">{children}</p>;
}
