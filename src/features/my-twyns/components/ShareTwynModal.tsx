"use client";

import Image from "next/image";
import { useState } from "react";
import { X, Gift, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import type { Twyn } from "../types";

function XLogo() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinLogo() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76zm13.5 12.27h-3v-5.6c0-3.37-4-3.12-4 0v5.6h-3v-11h3v1.77c1.4-2.59 7-2.78 7 2.48v6.75z" />
    </svg>
  );
}

export function ShareTwynModal({
  open,
  onOpenChange,
  twyn,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  twyn: Twyn;
}) {
  const [copied, setCopied] = useState(false);
  const link = `https://twynity.com/t/${twyn.id}`;

  const copy = () => {
    navigator.clipboard?.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const social =
    "flex h-[38px] flex-1 items-center justify-center gap-[7px] rounded-input border border-border bg-white text-[12px] font-semibold text-gray-2 transition-colors hover:border-violet hover:text-violet";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="max-w-[480px] gap-0 overflow-hidden rounded-card p-0 shadow-[0_24px_64px_rgba(15,15,30,0.24)]"
      >
        {/* Video preview */}
        <div className="relative h-[200px] w-full overflow-hidden bg-dark">
          <video src="/assets/sara_studio.mp4" autoPlay muted loop playsInline className="h-full w-full object-cover" />
          <div className="absolute bottom-3 left-[14px] flex items-center gap-2 rounded-chip border border-white/10 bg-dark/60 py-[5px] pl-[6px] pr-3 text-[11.5px] font-semibold text-white backdrop-blur-[10px]">
            <Image src={twyn.portrait} alt="" width={20} height={20} className="h-5 w-5 rounded-full object-cover object-top" />
            {twyn.name}
          </div>
        </div>

        {/* Body */}
        <div className="px-[26px] pb-6 pt-[22px]">
          <div className="mb-[18px] flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="mb-1 font-heading text-[19px] font-semibold leading-[1.15] tracking-[-0.4px] text-dark">
                Share your link
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-[1.45] text-gray-3">
                Your personal referral link — share it anywhere.
              </DialogDescription>
            </div>
            <DialogClose
              aria-label="Close"
              className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[8px] bg-bg-input text-gray-3 outline-none transition-colors hover:bg-border hover:text-dark focus-visible:ring-2 focus-visible:ring-violet/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <X size={14} strokeWidth={2.2} />
            </DialogClose>
          </div>

          {/* Referral banner */}
          <div className="mb-[18px] flex items-center gap-3 rounded-input border border-violet/15 bg-gradient-to-br from-violet-light to-soft-blue px-4 py-[14px]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-violet text-white">
              <Gift size={18} />
            </span>
            <p className="text-[13.5px] font-semibold leading-[1.45] text-dark">
              Earn <span className="text-violet">+<span className="font-sans">10</span> bonus credits</span> for every person who signs up through your link
            </p>
          </div>

          {/* Copy-link row */}
          <div className="mb-[14px] flex gap-2">
            <input
              readOnly
              value={link}
              className="h-10 min-w-0 flex-1 rounded-input border-[1.5px] border-border bg-bg-input px-3 text-[12.5px] text-dark outline-none focus:border-violet"
            />
            <button
              type="button"
              onClick={copy}
              className={`h-10 min-w-[90px] rounded-input px-4 text-[13px] font-bold text-white transition-colors ${
                copied ? "bg-mint-text" : "bg-violet hover:bg-violet-h"
              }`}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Social — share the twyn's link */}
          <div className="flex gap-2">
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`}
              target="_blank"
              rel="noreferrer"
              className={social}
            >
              <LinkedinLogo /> LinkedIn
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`Meet ${twyn.name} on Twynity`)}`}
              target="_blank"
              rel="noreferrer"
              className={social}
            >
              <XLogo /> X
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(`Meet ${twyn.name} on Twynity`)}&body=${encodeURIComponent(link)}`}
              className={social}
            >
              <Mail size={13} /> Email
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
