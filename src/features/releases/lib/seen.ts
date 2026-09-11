"use client";

import { useEffect, useState } from "react";
import { getLatestFeatured } from "../data/releases";

// Two flags, version-keyed:
//   toast-seen — the one-time toast has been shown & dismissed (any dismiss),
//                so it doesn't nag on every load.
//   read       — the user actually opened the What's-new page. Drives the
//                unread badge, which persists through a "Later" dismiss until
//                they read it (standard Intercom/Beamer behaviour).
const TOAST_KEY = "twynity_whatsnew_toast_seen";
const READ_KEY = "twynity_whatsnew_read";
const EVENT = "twynity:release-read";

function get(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function set(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function getToastSeen(): string | null {
  return get(TOAST_KEY);
}

/** Dismissing the toast ("Later" / ✕) — stops it re-showing, but stays unread. */
export function markToastSeen(version: string) {
  set(TOAST_KEY, version);
}

/** Reading the What's-new page — clears the unread badge (and the toast). */
export function markReleaseRead(version: string) {
  set(READ_KEY, version);
  set(TOAST_KEY, version);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

/** True while the latest featured release hasn't been read — drives the badge. */
export function useUnreadRelease(): boolean {
  const latest = getLatestFeatured().version;
  const [unread, setUnread] = useState(false);
  useEffect(() => {
    const check = () => setUnread(get(READ_KEY) !== latest);
    check();
    window.addEventListener(EVENT, check);
    window.addEventListener("storage", check); // cross-tab
    return () => {
      window.removeEventListener(EVENT, check);
      window.removeEventListener("storage", check);
    };
  }, [latest]);
  return unread;
}
