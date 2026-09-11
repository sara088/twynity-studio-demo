"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, UserRound } from "lucide-react";
import { Logo } from "@/features/shared/components/Logo";
import { PROVIDERS, type Account, type Brand, type Provider } from "../data/connect";

// The provider's own OAuth pages, shown in the new tab opened from the connect
// modal. Mimics Google / Microsoft (their branding) — sign in there, then it
// reports the result back to Twynity. onDone is called with the outcome.
type Step = "loading" | "choose" | "consent" | "completing";

export function OAuthScreen({
  provider,
  onDone,
}: {
  provider: Provider;
  onDone: (status: "connected" | "cancelled") => void;
}) {
  const [step, setStep] = useState<Step>("loading");
  const [account, setAccount] = useState<Account | null>(null);
  const cfg = PROVIDERS[provider];
  const ProviderMark = cfg.brand === "google" ? GoogleG : MicrosoftMark;

  // Brief "signing in to provider" splash on load, then the account chooser.
  useEffect(() => {
    const t = setTimeout(() => setStep("choose"), 900);
    return () => clearTimeout(t);
  }, []);

  // After consent, a brief "back to Twynity" splash, then report success.
  useEffect(() => {
    if (step !== "completing") return;
    const t = setTimeout(() => onDone("connected"), 1200);
    return () => clearTimeout(t);
  }, [step, onDone]);

  return (
    <div className="flex min-h-screen flex-col items-center" style={{ background: cfg.bg }}>
      {step === "loading" && (
        <LoadingScreen to={cfg.providerName} mark={<ProviderMark size={40} />} />
      )}
      {step === "completing" && <LoadingScreen to="Twynity" mark={<Logo height={30} />} />}

      {step === "choose" && (
        <ProviderCard brand={cfg.brand} mark={<ProviderMark size={26} />}>
          <h1 className="text-[24px] font-normal leading-tight text-[#202124]">
            {cfg.brand === "google" ? "Choose an account" : "Pick an account"}
          </h1>
          <p className="mt-1.5 text-[14px] text-[#5f6368]">
            to continue to <span className="font-medium text-[#3c4043]">Twynity</span>
          </p>

          <div className="mt-6 -mx-2 divide-y divide-[#ecedef] border-y border-[#ecedef]">
            {cfg.accounts.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => {
                  setAccount(a);
                  setStep("consent");
                }}
                className="flex w-full items-center gap-3.5 px-2 py-3 text-left transition-colors hover:bg-black/[0.03]"
              >
                <Avatar name={a.name} accent={cfg.accent} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-[#3c4043]">{a.name}</span>
                  <span className="block truncate text-[13px] text-[#5f6368]">{a.email}</span>
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setAccount(cfg.accounts[0]);
                setStep("consent");
              }}
              className="flex w-full items-center gap-3.5 px-2 py-3.5 text-left transition-colors hover:bg-black/[0.03]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1f3f4] text-[#5f6368]">
                <UserRound size={18} />
              </span>
              <span className="text-[14px] font-medium text-[#3c4043]">Use another account</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onDone("cancelled")}
            className="mt-6 self-start text-[13px] font-medium"
            style={{ color: cfg.accent }}
          >
            Cancel
          </button>
        </ProviderCard>
      )}

      {step === "consent" && account && (
        <ProviderCard brand={cfg.brand} mark={<ProviderMark size={26} />}>
          <h1 className="text-[21px] font-normal leading-snug text-[#202124]">
            Twynity wants to access your {cfg.providerName} Account
          </h1>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#dadce0] py-1 pl-1 pr-3">
            <Avatar name={account.name} accent={cfg.accent} size={24} />
            <span className="text-[13px] text-[#3c4043]">{account.email}</span>
          </div>

          <p className="mt-6 text-[14px] text-[#3c4043]">This will allow Twynity to:</p>
          <ul className="mt-3 space-y-3">
            {cfg.consentScopes.map((s) => (
              <li key={s} className="flex items-start gap-3 text-[13.5px] leading-snug text-[#3c4043]">
                <Check size={17} strokeWidth={2} className="mt-px shrink-0" style={{ color: cfg.accent }} />
                {s}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[12.5px] leading-relaxed text-[#5f6368]">
            Make sure you trust Twynity. You can remove this access any time in your{" "}
            {cfg.providerName} account settings.
          </p>

          <div className="mt-7 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onDone("cancelled")}
              className="rounded-[6px] px-4 py-2 text-[14px] font-medium"
              style={{ color: cfg.accent }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setStep("completing")}
              className="rounded-[6px] px-5 py-2 text-[14px] font-medium text-white"
              style={{ background: cfg.accent }}
            >
              Allow
            </button>
          </div>
        </ProviderCard>
      )}
    </div>
  );
}

function LoadingScreen({ to, mark }: { to: string; mark: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5">
      <div className="grid h-16 w-16 place-items-center">{mark}</div>
      <div className="flex items-center gap-2 text-[14px] text-[#5f6368]">
        <Loader2 size={16} className="animate-spin" />
        Redirecting to {to}…
      </div>
    </div>
  );
}

function ProviderCard({
  brand,
  mark,
  children,
}: {
  brand: Brand;
  mark: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-5">
      <div
        className="w-full max-w-[420px] bg-white p-10 shadow-[0_1px_3px_rgba(60,64,67,0.18)]"
        style={{ borderRadius: brand === "google" ? 28 : 8, border: "1px solid #dadce0" }}
      >
        <div className="mb-5">{mark}</div>
        {children}
      </div>
    </div>
  );
}

function Avatar({ name, accent, size = 36 }: { name: string; accent: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-medium text-white"
      style={{ width: size, height: size, background: accent, fontSize: size * 0.42 }}
    >
      {name[0]}
    </span>
  );
}

function GoogleG({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 9.5c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 2.69 29.93 .5 24 .5 15.4.5 7.96 5.43 4.34 12.62l7.35 5.7C13.42 13.12 18.27 9.5 24 9.5z" />
    </svg>
  );
}

function MicrosoftMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 23 23" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}
