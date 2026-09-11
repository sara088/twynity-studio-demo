// Per-twyn avatar processing state. Recording your own video trains a video
// avatar, which takes ~4–5 hours and can fail quality checks (bad lighting,
// hair in the way, too much movement). This store tracks each twyn's state
// (localStorage, broadcast same-tab like the purchases/payment stores).
//
// Prototype note: real training is hours, but for a clickable demo the state
// auto-settles after DEMO_MS so the ready / failed → notification flow is
// witnessable. To showcase the failed state, the FIRST attempt fails and a redo
// succeeds; existing twyns (no record) are simply "ready".

import { toast } from "sonner";

const KEY = "twynity_avatar_processing";
const EVENT = "twynity:avatar-changed";

// Real-world estimate shown to the user.
export const AVATAR_ETA_LABEL = "about 4–5 hours";
// How long the prototype keeps a twyn "processing" before it settles.
const DEMO_MS = 30_000;

// Short, actionable failure reasons (quality checks the pipeline runs).
const FAIL_REASONS = [
  "Your hair was covering part of your face — tuck it back and redo.",
  "The video was too dark — find brighter, even lighting and redo.",
  "There was too much movement — sit still, look at the camera, and redo.",
];

export type AvatarState = "ready" | "processing" | "failed";
export type AvatarStatus = {
  state: AvatarState;
  /** 0–1 progress through the (demo) processing window. */
  progress: number;
  reason?: string;
};

type Rec = {
  startedAt: number;
  outcome: "ready" | "failed";
  reason?: string;
  attempt: number;
  notified?: boolean;
};

type Store = Record<string, Rec>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as Store;
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function getAvatarStatus(twynId: string): AvatarStatus {
  const rec = read()[twynId];
  if (!rec) return { state: "ready", progress: 1 };
  const elapsed = Date.now() - rec.startedAt;
  if (elapsed < DEMO_MS) {
    return { state: "processing", progress: Math.min(1, Math.max(0, elapsed / DEMO_MS)) };
  }
  if (rec.outcome === "failed") return { state: "failed", progress: 1, reason: rec.reason };
  return { state: "ready", progress: 1 };
}

// Start (or restart, after a failure) avatar processing for a twyn.
export function startAvatarProcessing(twynId: string) {
  const store = read();
  const attempt = (store[twynId]?.attempt ?? 0) + 1;
  // Demo: first attempt fails so the failed state is shown; a redo succeeds.
  const fail = attempt === 1;
  store[twynId] = {
    startedAt: Date.now(),
    outcome: fail ? "failed" : "ready",
    reason: fail ? FAIL_REASONS[(attempt - 1) % FAIL_REASONS.length] : undefined,
    attempt,
  };
  write(store);
}

// Called once the (demo) window elapses. Success clears the record and notifies;
// failure keeps the record (so the failed state + reason persist for a redo) and
// notifies once. Idempotent.
export function settleAvatar(twynId: string, twynName?: string) {
  const store = read();
  const rec = store[twynId];
  if (!rec || Date.now() - rec.startedAt < DEMO_MS) return;
  const who = twynName ?? "Your";
  if (rec.outcome === "ready") {
    delete store[twynId];
    write(store);
    toast.success(`${who} avatar is ready`, {
      description: "Video is live in the studio — start a face-to-face conversation.",
    });
  } else if (!rec.notified) {
    rec.notified = true;
    store[twynId] = rec;
    write(store);
    toast.error(`${who} avatar couldn't be processed`, { description: rec.reason });
  }
}

// Delete a twyn's custom avatar — drops any processing/failed/ready record so it
// reverts to a clean state everywhere that reads the store.
export function clearAvatarProcessing(twynId: string) {
  const store = read();
  if (store[twynId]) {
    delete store[twynId];
    write(store);
  }
}

/** Subscribe to avatar-state changes (same-tab). Returns an unsubscribe fn. */
export function onAvatarChanged(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export { DEMO_MS as AVATAR_DEMO_MS };
