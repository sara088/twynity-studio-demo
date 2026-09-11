"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getArchive,
  getServerArchive,
  onArchiveChanged,
  type ArchiveEntry,
} from "../lib/archive";

/**
 * The archive, reactive to writes from anywhere in the app.
 *
 * `useSyncExternalStore` is the right shape for a localStorage-backed store:
 * it takes the server snapshot during SSR and hydration, then swaps to the real
 * one — no effect, no synchronous setState, no hydration mismatch. `getArchive`
 * caches against the raw string so the snapshot stays referentially stable
 * between writes.
 */
export function useArchive(): { entries: ArchiveEntry[]; ids: Set<string> } {
  const entries = useSyncExternalStore(onArchiveChanged, getArchive, getServerArchive);
  const ids = useMemo(() => new Set(entries.map((e) => e.id)), [entries]);
  return { entries, ids };
}
