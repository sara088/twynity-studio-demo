"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { getLatestFeatured, formatDate } from "../data/releases";
import { getToastSeen, markToastSeen, markReleaseRead } from "../lib/seen";

// One-time in-app announcement for the latest featured release. Appears once
// (bottom-right on desktop, a bottom card on mobile). "Later" / ✕ stops it
// re-showing but keeps the release unread (the account-menu badge nudges); "See
// what's new" marks it read.
export function ReleaseToast() {
  const release = getLatestFeatured();
  const [show, setShow] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (getToastSeen() === release.version) return;
    const t = setTimeout(() => {
      setShow(true);
      requestAnimationFrame(() => setEntered(true));
    }, 900);
    return () => clearTimeout(t);
  }, [release.version]);

  const hide = () => {
    setEntered(false);
    setTimeout(() => setShow(false), 200);
  };
  const dismiss = () => {
    markToastSeen(release.version); // stays unread until they read it
    hide();
  };
  const open = () => {
    markReleaseRead(release.version); // they're viewing it
    hide();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[80] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[340px] print:hidden">
      <div
        className={cnEntered(entered)}
        role="dialog"
        aria-label={`What's new: ${release.title}`}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-violet">
            <span className="h-1.5 w-1.5 rounded-full bg-violet" /> {release.theme}
          </span>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="grid h-6 w-6 place-items-center rounded-[6px] text-gray-5 transition-colors hover:bg-bg-input hover:text-gray-2"
          >
            <X size={14} />
          </button>
        </div>

        <span className="grid h-11 w-11 place-items-center rounded-[13px] bg-violet-light text-violet">
          <Sparkles size={20} strokeWidth={1.9} />
        </span>
        <div className="mt-3 font-heading text-[16px] font-bold tracking-[-0.3px] text-dark">
          {release.title}
        </div>
        <p className="mt-1.5 text-[13px] leading-[1.5] text-gray-3">{release.summary}</p>
        <div className="mt-3 font-sans text-[11.5px] text-gray-5">{formatDate(release.date)}</div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href="/whats-new"
            onClick={open}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-violet px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-violet-h"
          >
            See what&apos;s new <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-3 transition-colors hover:border-violet hover:text-violet"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

function cnEntered(entered: boolean): string {
  return [
    "rounded-card border border-border bg-white p-5 shadow-[0_20px_50px_rgba(15,15,30,0.18)]",
    "transition-[opacity,transform] duration-200 ease-soft",
    entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
  ].join(" ");
}
