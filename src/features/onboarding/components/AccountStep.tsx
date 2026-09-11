"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PillButton } from "@/features/shared/components/PillButton";
import { Field } from "@/features/shared/components/Field";
import { PolicyLink } from "./PolicyLink";
import { cn } from "@/lib/utils";

export type Account = { name: string; email: string; password: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return EMAIL_RE.test(email.trim());
}

// 0–4: length, upper+lower mix, a digit, a symbol. Shown only as a hint —
// validity just requires 8+ characters.
function strengthOf(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length < 8) score = Math.min(score, 1);
  const label = score <= 1 ? "Weak" : score <= 3 ? "Medium" : "Strong";
  const bar = score <= 1 ? "bg-error" : score <= 3 ? "bg-amber-text" : "bg-success";
  const text = score <= 1 ? "text-error" : score <= 3 ? "text-amber-text" : "text-success";
  return { score, label, bar, text };
}

// Step 2 — collect account details, validate, then hand off to email
// verification. Values live in the parent so they survive a "use a different
// email" round-trip back from the verify step.
export function AccountStep({
  value,
  onChange,
  onBack,
  onSubmit,
}: {
  value: Account;
  onChange: (next: Account) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const { name, email, password } = value;
  const errors = {
    name: name.trim() ? "" : "Enter your full name.",
    email: isValidEmail(email) ? "" : "Enter a valid email address.",
    password: password.length >= 8 ? "" : "Use at least 8 characters.",
  };
  const valid = !errors.name && !errors.email && !errors.password && agreed;
  const show = (k: keyof typeof errors) => (touched[k] || submitted) && errors[k];

  const set = (k: keyof Account) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [k]: e.target.value });
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));

  const strength = strengthOf(password);

  return (
    <form
      className="animate-[onb-fade_200ms_var(--ease-soft)]"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
        if (valid) onSubmit();
      }}
    >
      <div className="mb-[18px] inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px] text-violet">
        <span className="h-[8px] w-[8px] rounded-full bg-violet animate-status-pulse" />
        One last thing
      </div>
      <h1 className="mb-[10px] font-heading text-[32px] font-semibold leading-[1.15] tracking-[-0.7px] text-dark">
        Save your twyn.
      </h1>
      <p className="mb-9 text-[15px] leading-[1.6] text-gray-3">
        Create your account to save your twyn and bring it to life — then it&apos;s
        waiting for you in the studio.
      </p>

      <div className="space-y-5">
        <Field label="Full name" htmlFor="name">
          <Input
            id="name"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Your full name"
            value={name}
            onChange={set("name")}
            onBlur={blur("name")}
            aria-invalid={Boolean(show("name"))}
            className="h-[50px] rounded-input border-border bg-white px-4 text-[14.5px] placeholder:text-gray-6"
          />
          {show("name") && <FieldError>{errors.name}</FieldError>}
        </Field>

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={set("email")}
            onBlur={blur("email")}
            aria-invalid={Boolean(show("email"))}
            className="h-[50px] rounded-input border-border bg-white px-4 text-[14.5px] placeholder:text-gray-6"
          />
          {show("email") && <FieldError>{errors.email}</FieldError>}
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          hint={
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="inline-flex items-center gap-1 font-semibold text-gray-3 transition-colors hover:text-violet"
            >
              {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
              {showPw ? "Hide" : "Show"}
            </button>
          }
        >
          <Input
            id="password"
            type={showPw ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={set("password")}
            onBlur={blur("password")}
            aria-invalid={Boolean(show("password"))}
            className="h-[50px] rounded-input border-border bg-white px-4 text-[14.5px] placeholder:text-gray-6"
          />
          {password && (
            <div className="mt-2 flex items-center gap-2.5">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i < strength.score ? strength.bar : "bg-border",
                    )}
                  />
                ))}
              </div>
              <span className={cn("w-[52px] shrink-0 text-right text-[11.5px] font-semibold", strength.text)}>
                {strength.label}
              </span>
            </div>
          )}
          {show("password") && <FieldError>{errors.password}</FieldError>}
        </Field>
      </div>

      <label className="mt-8 flex cursor-pointer items-start gap-[10px] text-[13px] leading-[1.5] text-gray-2">
        <Checkbox
          checked={agreed}
          onCheckedChange={(v) => {
            setAgreed(v === true);
            setTouched((t) => ({ ...t, agreed: true }));
          }}
          className="mt-[2px] size-[18px] border-border bg-white data-[state=checked]:border-violet data-[state=checked]:bg-violet"
        />
        <span>
          I agree to the <PolicyLink policy="terms">Terms of Service</PolicyLink> and{" "}
          <PolicyLink policy="privacy">Privacy Policy</PolicyLink>
        </span>
      </label>
      {submitted && !agreed && (
        <FieldError>Please accept the Terms to continue.</FieldError>
      )}

      <div className="mt-7 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-[14px] font-medium text-gray-3 transition-colors hover:text-dark"
        >
          ← Back
        </button>
        <PillButton type="submit" disabled={!valid}>
          Create account
          <span className="transition-transform duration-150 group-hover:translate-x-[3px]">→</span>
        </PillButton>
      </div>
    </form>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[12px] font-medium text-error">{children}</p>;
}
