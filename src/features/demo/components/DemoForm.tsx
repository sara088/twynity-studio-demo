"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/features/shared/components/Field";

const REASONS = [
  "See a live demo",
  "Try Twynity with my use case",
  "Get early access",
  "Explore partnership",
  "Just exploring",
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputCls =
  "h-12 rounded-input border-border bg-white px-4 text-[14.5px] placeholder:text-gray-5";

type FormState = {
  name: string;
  email: string;
  title: string;
  company: string;
  country: string;
  industry: string;
  goal: string;
};

// "See Twynity in action" — the org/enterprise demo-request form. Every org CTA
// on the landing page routes here. Mocked: a valid submission shows a thank-you
// confirmation (no backend).
export function DemoForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    title: "",
    company: "",
    country: "",
    industry: "",
    goal: "",
  });
  const [reasons, setReasons] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (r: string) =>
    setReasons((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]));

  const nameErr = form.name.trim() ? "" : "Enter your name.";
  const emailErr = EMAIL_RE.test(form.email.trim()) ? "" : "Enter a valid work email.";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (nameErr || emailErr) return;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-[520px] text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-[16px] bg-violet-light text-violet">
          <CheckCircle2 size={28} />
        </div>
        <h1 className="font-heading text-[32px] font-semibold tracking-[-0.8px] text-dark">
          Thanks — we&apos;ll be in touch.
        </h1>
        <p className="mx-auto mt-3 max-w-[420px] text-[15px] leading-[1.6] text-gray-3">
          We&apos;ll follow up at{" "}
          <strong className="font-semibold text-dark">{form.email}</strong> to schedule your demo.
          Keep an eye on your inbox.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex h-[48px] items-center rounded-btn border-[1.5px] border-border bg-white px-6 text-[14px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <header className="text-center">
        <h1 className="font-heading text-[clamp(40px,6vw,60px)] font-semibold leading-[1.05] tracking-[-1.8px] text-dark">
          See Twynity in{" "}
          <span className="bg-gradient-to-r from-dark to-violet bg-clip-text text-transparent">
            action
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-[460px] text-[16px] leading-[1.55] text-gray-3">
          Tell us a bit about you and your goals. We&apos;ll follow up at your work email to
          schedule time.
        </p>
      </header>

      <form
        onSubmit={submit}
        noValidate
        className="mt-9 rounded-card border border-border bg-white p-7 shadow-[0_18px_50px_rgba(15,15,30,0.06)] sm:p-9"
      >
        <div className="space-y-5">
          <Field label="Full name" htmlFor="d-name">
            <Input
              id="d-name"
              value={form.name}
              onChange={set("name")}
              placeholder="Your full name"
              aria-invalid={submitted && Boolean(nameErr)}
              className={inputCls}
            />
            {submitted && nameErr && <Err>{nameErr}</Err>}
          </Field>

          <Field label="Work email" htmlFor="d-email">
            <Input
              id="d-email"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@company.com"
              aria-invalid={submitted && Boolean(emailErr)}
              className={inputCls}
            />
            {submitted && emailErr && <Err>{emailErr}</Err>}
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Job title" htmlFor="d-title">
              <Input id="d-title" value={form.title} onChange={set("title")} placeholder="Your role" className={inputCls} />
            </Field>
            <Field label="Company" htmlFor="d-company">
              <Input id="d-company" value={form.company} onChange={set("company")} placeholder="Company name" className={inputCls} />
            </Field>
            <Field label="Country" htmlFor="d-country">
              <Input id="d-country" value={form.country} onChange={set("country")} placeholder="Country or region" className={inputCls} />
            </Field>
            <Field label="Industry" htmlFor="d-industry">
              <Input id="d-industry" value={form.industry} onChange={set("industry")} placeholder="e.g. Technology, Healthcare" className={inputCls} />
            </Field>
          </div>
        </div>

        <div className="mt-7">
          <div className="mb-3 text-[13.5px] font-semibold text-dark">
            What brings you here? <span className="font-normal text-gray-4">Select all that apply.</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {REASONS.map((r) => (
              <label key={r} className="flex cursor-pointer items-center gap-2.5 text-[14px] text-gray-2">
                <Checkbox
                  checked={reasons.includes(r)}
                  onCheckedChange={() => toggle(r)}
                  className="size-[18px] border-border bg-white data-[state=checked]:border-violet data-[state=checked]:bg-violet"
                />
                {r}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-7">
          <label htmlFor="d-goal" className="mb-1.5 block text-[13.5px] font-semibold text-dark">
            What would you like to build or automate with Twynity?
          </label>
          <textarea
            id="d-goal"
            value={form.goal}
            onChange={set("goal")}
            placeholder="e.g. meeting assistant, internal ops, customer support, etc."
            className="min-h-[110px] w-full resize-y rounded-input border border-border bg-white px-4 py-3 text-[14.5px] leading-[1.5] text-dark outline-none placeholder:text-gray-5 focus:border-violet"
          />
        </div>

        <button
          type="submit"
          className="mt-8 inline-flex h-[52px] w-full items-center justify-center rounded-btn bg-violet text-[15px] font-bold text-white transition-[background,transform] duration-150 hover:-translate-y-px hover:bg-violet-h"
        >
          Book a demo
        </button>
      </form>
    </div>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-[12px] font-medium text-error">{children}</p>;
}
