"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, MailCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "@/features/shared/components/Field";
import { PillButton } from "@/features/shared/components/PillButton";
import { Logo } from "@/features/shared/components/Logo";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmail = (v: string) => EMAIL_RE.test(v.trim());
const inputCls =
  "h-[50px] rounded-input border-border bg-white px-4 text-[14.5px] placeholder:text-gray-6";

type Mode = "signin" | "forgot";

// Returning-user sign-in, with a lightweight forgot-password mode inline (no
// extra route). Mocked: a valid-format email + any password signs in to the
// studio; reset just shows the "link sent" state, mirroring the email-change
// verification flow on the account page.
export function LoginView() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const emailErr = isEmail(email) ? "" : "Enter a valid email address.";
  const pwErr = password.length > 0 ? "" : "Enter your password.";

  const signIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (emailErr || pwErr) return;
    router.push("/my-twyns");
  };

  const sendReset = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (emailErr) return;
    setSentTo(email.trim());
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setSubmitted(false);
    setSentTo(null);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-bg-page">
      <header className="flex h-[60px] shrink-0 items-center border-b border-border bg-bg-page px-7">
        <Logo height={28} />
      </header>

      <main className="flex flex-1 overflow-hidden">
        <section className="flex flex-1 items-center justify-center overflow-y-auto bg-bg-page px-6 py-12 sm:px-14">
          <div className="w-full max-w-[420px]">
            {mode === "signin" ? (
              <form noValidate onSubmit={signIn} className="animate-[onb-fade_200ms_var(--ease-soft)]">
                <Eyebrow>Welcome back</Eyebrow>
                <Heading>Sign in to Twynity.</Heading>
                <Sub>Pick up where you left off — your twyns are waiting in the studio.</Sub>

                <div className="space-y-5">
                  <Field label="Email" htmlFor="login-email">
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={submitted && Boolean(emailErr)}
                      className={inputCls}
                    />
                    {submitted && emailErr && <FieldError>{emailErr}</FieldError>}
                  </Field>

                  <Field
                    label="Password"
                    htmlFor="login-pw"
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
                      id="login-pw"
                      type={showPw ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={submitted && Boolean(pwErr)}
                      className={inputCls}
                    />
                    {submitted && pwErr && <FieldError>{pwErr}</FieldError>}
                  </Field>
                </div>

                <div className="mt-3 text-right">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-[13px] font-semibold text-violet transition-colors hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <PillButton type="submit" className="mt-7 w-full">
                  Sign in
                  <span className="transition-transform duration-150 group-hover:translate-x-[3px]">→</span>
                </PillButton>

                <p className="mt-6 text-center text-[13.5px] text-gray-3">
                  New to Twynity?{" "}
                  <Link href="/onboarding" className="font-semibold text-violet hover:underline">
                    Create your twyn
                  </Link>
                </p>
              </form>
            ) : sentTo ? (
              <div className="animate-[onb-fade_200ms_var(--ease-soft)]">
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-[14px] bg-violet-light text-violet">
                  <MailCheck size={22} />
                </div>
                <Heading>Check your inbox.</Heading>
                <Sub>
                  We sent a password reset link to{" "}
                  <strong className="font-semibold text-dark">{sentTo}</strong>. Click it to set a new password.
                </Sub>
                <div className="flex items-center gap-4 text-[13px]">
                  <button
                    type="button"
                    onClick={() => setSentTo(null)}
                    className="font-semibold text-violet transition-colors hover:underline"
                  >
                    Resend link
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="inline-flex items-center gap-1 font-semibold text-gray-4 transition-colors hover:text-dark"
                  >
                    <ArrowLeft size={13} /> Back to sign in
                  </button>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={sendReset} className="animate-[onb-fade_200ms_var(--ease-soft)]">
                <Eyebrow>Reset password</Eyebrow>
                <Heading>Forgot your password?</Heading>
                <Sub>Enter your account email and we&apos;ll send you a link to set a new one.</Sub>

                <Field label="Email" htmlFor="reset-email">
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={submitted && Boolean(emailErr)}
                    className={inputCls}
                  />
                  {submitted && emailErr && <FieldError>{emailErr}</FieldError>}
                </Field>

                <PillButton type="submit" className="mt-6 w-full">
                  Send reset link
                </PillButton>

                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="mt-6 inline-flex w-full items-center justify-center gap-1 text-[13.5px] font-semibold text-gray-4 transition-colors hover:text-dark"
                >
                  <ArrowLeft size={13} /> Back to sign in
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px] text-violet">
      <span className="h-[8px] w-[8px] rounded-full bg-violet animate-status-pulse" />
      {children}
    </div>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <h1 className="mb-2.5 font-heading text-[32px] font-semibold leading-[1.15] tracking-[-0.7px] text-dark">
      {children}
    </h1>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return <p className="mb-9 text-[15px] leading-[1.6] text-gray-3">{children}</p>;
}

function FieldError({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-[12px] font-medium text-error">{children}</p>;
}
