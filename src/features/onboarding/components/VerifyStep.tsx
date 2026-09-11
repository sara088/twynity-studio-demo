"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PillButton } from "@/features/shared/components/PillButton";

const RESEND_COOLDOWN = 30; // seconds
const LEN = 6;
const SUCCESS_HOLD_MS = 1100;

// Step 3 — email verification via a 6-digit OTP. The code is typed back into
// this same screen (no leaving the tab), so the onboarding session stays intact.
// No real backend: any 6 digits verify, then we land in the studio.
export function VerifyStep({
  email,
  onChangeEmail,
  onVerified,
}: {
  email: string;
  onChangeEmail: () => void;
  onVerified: () => void;
}) {
  const [code, setCode] = useState<string[]>(Array(LEN).fill(""));
  const [status, setStatus] = useState<"input" | "verified">("input");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resentAt, setResentAt] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const done = useRef(false);

  // Resend cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  // Focus the first box on mount.
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const verify = () => {
    if (done.current) return;
    done.current = true;
    setStatus("verified");
    window.setTimeout(onVerified, SUCCESS_HOLD_MS);
  };

  // Auto-submit once all six digits are entered.
  useEffect(() => {
    if (code.every((c) => c !== "")) verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const setDigit = (i: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < LEN - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
    if (!text) return;
    e.preventDefault();
    const next = Array(LEN).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setCode(next);
    inputs.current[Math.min(text.length, LEN - 1)]?.focus();
  };

  const resend = () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN);
    setResentAt((n) => n + 1);
    setCode(Array(LEN).fill(""));
    inputs.current[0]?.focus();
  };

  const verified = status === "verified";

  return (
    <div className="animate-[onb-fade_200ms_var(--ease-soft)]">
      <div className="mb-[18px] inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px] text-violet">
        <span className="h-[8px] w-[8px] rounded-full bg-violet animate-status-pulse" />
        Almost there
      </div>

      <div
        className={cn(
          "mb-6 grid h-16 w-16 place-items-center rounded-[18px] transition-colors duration-300",
          verified ? "bg-success/12 text-success" : "bg-violet-light text-violet",
        )}
      >
        {verified ? <CheckCircle2 size={30} /> : <ShieldCheck size={28} />}
      </div>

      <h1 className="mb-[10px] font-heading text-[32px] font-semibold leading-[1.15] tracking-[-0.7px] text-dark">
        {verified ? "You're verified." : "Enter your code."}
      </h1>
      <p className="mb-8 text-[15px] leading-[1.6] text-gray-3">
        {verified ? (
          <>Taking you to the studio…</>
        ) : (
          <>
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-dark">{email || "your email"}</span>. Enter
            it below to verify your account.
          </>
        )}
      </p>

      {!verified && (
        <>
          {/* OTP boxes */}
          <div className="flex gap-2.5" onPaste={onPaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                aria-label={`Digit ${i + 1}`}
                className="h-14 w-12 rounded-input border-[1.5px] border-border bg-white text-center font-heading text-[22px] font-semibold text-dark outline-none transition-colors focus:border-violet"
              />
            ))}
          </div>

          <div className="mt-6">
            <PillButton
              type="button"
              onClick={verify}
              disabled={code.some((c) => c === "")}
              className="w-full"
            >
              Verify &amp; continue
            </PillButton>
          </div>

          <div className="mt-7 border-t border-border pt-5 text-[13.5px] text-gray-3">
            <p>
              Didn&apos;t get a code?{" "}
              {cooldown > 0 ? (
                <span className="text-gray-5">
                  Resend in 0:{String(cooldown).padStart(2, "0")}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={resend}
                  className="font-semibold text-violet transition-colors hover:text-violet-h"
                >
                  Resend code
                </button>
              )}
            </p>
            {resentAt > 0 && cooldown > 0 && (
              <p className="mt-1.5 text-[12.5px] font-medium text-success">
                New code sent — check your email.
              </p>
            )}
            <button
              type="button"
              onClick={onChangeEmail}
              className="mt-3 font-medium text-gray-3 underline-offset-2 transition-colors hover:text-dark hover:underline"
            >
              ← Use a different email
            </button>
          </div>
        </>
      )}
    </div>
  );
}
