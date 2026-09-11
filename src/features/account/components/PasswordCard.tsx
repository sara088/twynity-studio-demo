"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "@/features/shared/components/Field";
import { PillButton } from "@/features/shared/components/PillButton";
import { BillingCard } from "@/features/top-up/components/BillingCard";
import { cn } from "@/lib/utils";
import { PW_RULES, meetsComplexity, strengthOf } from "../lib/password";

const inputCls =
  "h-11 rounded-input border-border bg-white px-[14px] pr-11 text-[14px] placeholder:text-gray-6";

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  invalid,
  autoComplete,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  invalid?: boolean;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        className={cn(inputCls, invalid && "border-error focus-visible:border-error")}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-5 hover:text-gray-2"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

// Change-password section — current password, a new password that must meet the
// complexity rules, and a matching confirmation. All mocked (no backend): a valid
// submission shows a success state and clears the form.
export function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(false);

  const strength = strengthOf(next);
  const complexOk = meetsComplexity(next);
  const matchOk = confirm.length > 0 && confirm === next;
  const sameAsOld = next.length > 0 && next === current;
  const valid = current.length > 0 && complexOk && matchOk && !sameAsOld;

  const submit = () => {
    setTouched(true);
    if (!valid) return;
    setDone(true);
    setCurrent("");
    setNext("");
    setConfirm("");
    setTouched(false);
    window.setTimeout(() => setDone(false), 2800);
  };

  return (
    <BillingCard title="Password" description="Update the password you use to sign in.">
      <div className="mt-5 max-w-[420px] space-y-4">
        <Field label="Current password" htmlFor="pw-current">
          <PasswordInput
            id="pw-current"
            value={current}
            onChange={setCurrent}
            placeholder="Enter current password"
            autoComplete="current-password"
            invalid={touched && current.length === 0}
          />
        </Field>

        <Field label="New password" htmlFor="pw-new">
          <PasswordInput
            id="pw-new"
            value={next}
            onChange={(v) => setNext(v)}
            placeholder="Create a new password"
            autoComplete="new-password"
            invalid={touched && !complexOk}
          />
        </Field>

        {/* Strength meter */}
        {next.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn("h-1 flex-1 rounded-full transition-colors", i < strength.score ? strength.bar : "bg-border")}
                />
              ))}
            </div>
            <span className={cn("w-[52px] shrink-0 text-right text-[11.5px] font-semibold", strength.text)}>
              {strength.label}
            </span>
          </div>
        )}

        {/* Rules checklist */}
        <ul className="grid gap-1.5">
          {PW_RULES.map((r) => {
            const ok = r.test(next);
            return (
              <li key={r.id} className="flex items-center gap-2 text-[12px]">
                <span
                  className={cn(
                    "grid h-4 w-4 shrink-0 place-items-center rounded-full border transition-colors",
                    ok ? "border-success bg-success text-white" : "border-border text-transparent",
                  )}
                >
                  <Check size={11} strokeWidth={3} />
                </span>
                <span className={cn(ok ? "text-gray-2" : "text-gray-4")}>
                  {r.label}
                  {!r.required && <span className="text-gray-5"> · optional</span>}
                </span>
              </li>
            );
          })}
        </ul>

        <Field label="Confirm new password" htmlFor="pw-confirm">
          <PasswordInput
            id="pw-confirm"
            value={confirm}
            onChange={setConfirm}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            invalid={confirm.length > 0 && !matchOk}
          />
        </Field>
        {confirm.length > 0 && !matchOk && (
          <p className="text-[12px] font-medium text-error">Passwords don&apos;t match.</p>
        )}
        {sameAsOld && (
          <p className="text-[12px] font-medium text-error">Choose a password different from your current one.</p>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
        <PillButton size="sm" onClick={submit} disabled={!valid}>
          <ShieldCheck size={15} /> Update password
        </PillButton>
        {done && (
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-success">
            <Check size={14} /> Password updated
          </span>
        )}
      </div>
    </BillingCard>
  );
}
