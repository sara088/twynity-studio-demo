"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, Loader2, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GmailLogo, AzureLogo } from "@/features/edit-twyn/components/LoadoutCard";
import {
  PROVIDERS,
  OAUTH_MESSAGE,
  type OAuthResult,
  type Provider,
} from "../data/connect";

export type { Provider };

// Twynity-branded connect modal: explains what access is granted and that it's
// secure, then "Continue with …" opens the provider's real sign-in in a new tab
// (the /oauth route). That tab posts the result back here.
export function ConnectDialog({
  provider,
  onCancel,
  onConnect,
}: {
  provider: Provider | null;
  onCancel: () => void;
  onConnect: (provider: Provider) => void;
}) {
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    setWaiting(false);
  }, [provider]);

  // Listen for the OAuth tab's result.
  useEffect(() => {
    if (!provider) return;
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as OAuthResult | undefined;
      if (!d || d.source !== OAUTH_MESSAGE || d.provider !== provider) return;
      if (d.status === "connected") onConnect(provider);
      else setWaiting(false);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [provider, onConnect]);

  if (!provider) return null;
  const cfg = PROVIDERS[provider];
  const Glyph = cfg.brand === "google" ? GmailLogo : AzureLogo;

  const openProvider = () => {
    setWaiting(true);
    window.open(`/oauth/${provider}`, "_blank");
  };

  return (
    <Dialog open={provider !== null} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-[440px] gap-0 p-0">
        <DialogHeader className="flex-row items-center gap-3 space-y-0 border-b border-border p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border border-border bg-white [&>svg]:h-[24px] [&>svg]:w-[24px]">
            <Glyph />
          </span>
          <div className="min-w-0">
            <DialogTitle className="font-heading text-[17px] font-semibold tracking-[-0.3px] text-dark">
              Connect {cfg.serviceName}
            </DialogTitle>
            <DialogDescription className="text-[12.5px] text-gray-4">
              Secure OAuth — Twynity never sees your password.
            </DialogDescription>
          </div>
        </DialogHeader>

        {waiting ? (
          <div className="flex flex-col items-center gap-3 px-6 py-9 text-center">
            <Loader2 size={22} className="animate-spin text-violet" />
            <div className="text-[14px] font-semibold text-dark">
              Waiting for {cfg.providerName}…
            </div>
            <p className="max-w-[300px] text-[12.5px] leading-relaxed text-gray-4">
              Finish signing in to {cfg.providerName} in the new tab. We&apos;ll connect
              automatically when you&apos;re done.
            </p>
            <button
              type="button"
              onClick={openProvider}
              className="text-[12.5px] font-semibold text-violet hover:underline"
            >
              Didn&apos;t open? Reopen the tab
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-5">
            <ul className="space-y-2">
              {cfg.modalPoints.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-[12.5px] leading-snug text-gray-2">
                  <Check size={15} className="mt-0.5 shrink-0 text-violet" strokeWidth={2.5} />
                  {s}
                </li>
              ))}
            </ul>
            <p className="flex items-center gap-1.5 text-[11.5px] text-gray-5">
              <Shield size={12} /> You can disconnect any time.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button variant="outline" size="md" onClick={onCancel}>
            Cancel
          </Button>
          {!waiting && (
            <Button size="md" onClick={openProvider}>
              <ExternalLink size={15} /> Continue with {cfg.providerName}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
