// The archive: what a workspace holds but isn't running.
//
// A tier caps what's ACTIVE, never what's stored. Anything over the cap is set
// aside here — it keeps its data, stops counting against the plan, and comes
// back when there's room. Nothing in the plan flows deletes; deletion is an
// explicit act on the archive page and nowhere else.
//
// This module owns the archived/active split. `downgrade.ts` owns the catalog
// and the budget maths and knows nothing about archiving, so the dependency
// runs one way only (archive → downgrade) and there's no import cycle.
//
// Store shape matches the other prototype stores (tier, pending downgrade):
// localStorage + a same-tab event, SSR-safe — empty on the server, synced in a
// mount effect.

import { TIERS, setTierId, type Tier, type TierId } from "@/features/shared/lib/tier";
import { TWYNS } from "@/features/my-twyns/data/mock-data";
import {
  allAssets,
  budgetsFor,
  cancelDowngrade,
  getPendingDowngrade,
  KIND_ORDER,
  resolveSelection,
  type Asset,
  type AssetKind,
  type Budget,
  type PendingDowngrade,
} from "@/features/top-up/lib/downgrade";

/** Why an item is in the archive. Shown on the row — six months on, "what is
 *  this doing here?" is the first thing anyone asks. */
export type ArchiveReason = "downgrade" | "manual";

export interface ArchiveEntry {
  id: string;
  /** Display date, e.g. "12 September 2026". */
  archivedAt: string;
  reason: ArchiveReason;
  /** Downgrades only — the tier that caused it, for the row's subtitle. */
  tier?: TierId;
}

const KEY = "twynity_archive";
const EVENT = "twynity:archive-changed";

// ─── Store ──────────────────────────────────────────────────────────────────

/** Stable empty snapshot — a fresh [] each call would loop useSyncExternalStore. */
const EMPTY: ArchiveEntry[] = [];

// Parsed value cached against the raw string, so repeated reads return the same
// reference until something actually writes. Required for useSyncExternalStore,
// and cheaper everywhere else.
let cachedRaw: string | null = null;
let cached: ArchiveEntry[] = EMPTY;

export function getArchive(): ArchiveEntry[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cachedRaw) return cached;
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedRaw = raw;
    cached = Array.isArray(parsed) ? (parsed as ArchiveEntry[]) : EMPTY;
    return cached;
  } catch {
    return EMPTY;
  }
}

/** Server snapshot for useSyncExternalStore — nothing is archived on the server. */
export function getServerArchive(): ArchiveEntry[] {
  return EMPTY;
}

export function getArchivedIds(): Set<string> {
  return new Set(getArchive().map((e) => e.id));
}

function write(entries: ArchiveEntry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function onArchiveChanged(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

// ─── Cascade ────────────────────────────────────────────────────────────────

/**
 * Knowledge pack ids owned by a twyn.
 *
 * Packs are keyed `${twynId}:${packName}` and budgeted in their own category,
 * so without this an archived twyn's packs would keep eating the knowledge
 * allowance while nothing could read them.
 */
export function knowledgeOwnedBy(twynId: string): string[] {
  const twyn = TWYNS.find((t) => t.id === twynId);
  return (twyn?.knowledge ?? []).map((k) => `${twynId}:${k.name}`);
}

/**
 * Expand a selection to everything that must move with it.
 *
 * Archiving a twyn takes its knowledge along; restoring one offers the packs
 * back the same way. Applied on both sides so the two states stay coherent.
 */
export function withCascade(ids: Iterable<string>): string[] {
  const out = new Set<string>();
  for (const id of ids) {
    out.add(id);
    // Twyn ids carry no separator; knowledge ids do. Only twyns cascade.
    if (!id.includes(":")) for (const k of knowledgeOwnedBy(id)) out.add(k);
  }
  return [...out];
}

// ─── Mutations ──────────────────────────────────────────────────────────────

/**
 * "18 August 2026" — the day an item was archived.
 *
 * Safe to compute from the clock because archiving only ever happens in an
 * event handler, never during render; the stored string is what gets rendered,
 * so there's no server/client mismatch to worry about.
 */
export function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function archiveIds(
  ids: Iterable<string>,
  reason: ArchiveReason,
  opts: { at?: string; tier?: TierId } = {},
) {
  const at = opts.at ?? todayLabel();
  const existing = getArchive();
  const known = new Set(existing.map((e) => e.id));
  const added = withCascade(ids)
    .filter((id) => !known.has(id))
    .map((id) => ({ id, archivedAt: at, reason, tier: opts.tier }));
  if (added.length === 0) return;
  write([...existing, ...added]);
}

/** Bring items back into the active workspace. */
export function restoreIds(ids: Iterable<string>) {
  const drop = new Set(withCascade(ids));
  const next = getArchive().filter((e) => !drop.has(e.id));
  write(next);
}

/**
 * Permanent deletion — the only path in the whole lifecycle that destroys
 * anything. Cascades too: a twyn's packs can't outlive it.
 */
export function deleteIds(ids: Iterable<string>) {
  const drop = new Set(withCascade(ids));
  write(getArchive().filter((e) => !drop.has(e.id)));
}

export function clearArchive() {
  write([]);
}

// ─── Active / archived split ────────────────────────────────────────────────

/**
 * The catalog minus anything archived.
 *
 * Every capacity calculation runs on this, never on `allAssets()`. Budgeting
 * the raw catalog would count archived items against the cap a second time and
 * ask the user to archive things that are already gone.
 */
export function activeAssets(archived: Set<string> = getArchivedIds()): Asset[] {
  return allAssets().filter((a) => !archived.has(a.id));
}

export function archivedAssets(archived: Set<string> = getArchivedIds()): Asset[] {
  return allAssets().filter((a) => archived.has(a.id));
}

// ─── Headroom ───────────────────────────────────────────────────────────────

/** A category's spare capacity — the inverse of the downgrade page's overage. */
export interface Headroom extends Budget {
  /** How much more this category can take. 0 = full. */
  room: number;
}

/**
 * Room under `tier` given what's active, optionally counting a set of archived
 * items as though they were already restored — that's how the restore meters
 * move as the user selects.
 */
export function headroomFor(
  tier: Tier,
  archived: Set<string> = getArchivedIds(),
  restoring: Set<string> = new Set(),
): Headroom[] {
  const active = allAssets().filter((a) => !archived.has(a.id) || restoring.has(a.id));
  return budgetsFor(active, tier).map((b) => ({
    ...b,
    room: Math.max(0, Math.round((b.limit - b.used) * 100) / 100),
  }));
}

/** Does this restore selection fit the tier? */
export function restoreFits(
  tier: Tier,
  archived: Set<string>,
  restoring: Set<string>,
): boolean {
  return headroomFor(tier, archived, restoring).every((b) => b.over === 0);
}

/**
 * What to pre-select when the archive opens in restore mode.
 *
 * Most recently archived first, taking whatever fits — the mirror of the
 * downgrade page's oldest-first auto-fill. A suggestion, never applied on its
 * own: on the way down the user made a considered choice about what mattered,
 * and for knowledge there's no determinate answer anyway (524 MB of room
 * against 1,900 MB waiting has many valid selections).
 */
export function suggestRestore(tierId: TierId, archived: Set<string> = getArchivedIds()): Set<string> {
  const tier = TIERS[tierId];
  const entries = getArchive();
  const order = new Map(entries.map((e, i) => [e.id, i]));
  const picked = new Set<string>();

  for (const kind of KIND_ORDER) {
    const candidates = archivedAssets(archived)
      .filter((a) => a.kind === kind)
      // Newest archived first — later entries were archived later.
      .sort((a, b) => (order.get(b.id) ?? 0) - (order.get(a.id) ?? 0));
    for (const a of candidates) {
      const next = new Set(picked).add(a.id);
      if (restoreFits(tier, archived, next)) picked.add(a.id);
    }
  }
  return picked;
}

// ─── Labels ─────────────────────────────────────────────────────────────────

const KIND_LABEL: Record<AssetKind, string> = {
  twyn: "Twyns",
  knowledge: "Knowledge packs",
  workflow: "Workflows",
};

export function kindLabel(kind: AssetKind): string {
  return KIND_LABEL[kind];
}

/** "12 September 2026 · switched to Basic" / "…· archived by you" */
export function reasonLabel(entry: ArchiveEntry): string {
  const why =
    entry.reason === "downgrade"
      ? `switched to ${entry.tier ? TIERS[entry.tier].name : "a smaller plan"}`
      : "archived by you";
  return `${entry.archivedAt} · ${why}`;
}

// ─── Applying a scheduled downgrade ─────────────────────────────────────────

/**
 * Move a pending downgrade's selection into the archive and switch the tier.
 *
 * In production this fires on the effective date. The selection is recomputed
 * rather than replayed: anything created — or restored — since it was made
 * would otherwise leave the workspace over the new cap. Explicit choices are
 * honoured, and auto-fill extends them.
 */
export function applyPendingDowngrade(): PendingDowngrade | null {
  const pending = getPendingDowngrade();
  if (!pending) return null;

  const target = TIERS[pending.to];
  const archived = getArchivedIds();
  const decisions: Record<string, "keep" | "archive"> = {};
  for (const id of pending.archive) decisions[id] = "archive";
  const { archived: resolved } = resolveSelection(activeAssets(archived), target, decisions);

  archiveIds(resolved, "downgrade", { at: pending.effectiveOn, tier: pending.to });
  setTierId(pending.to);
  cancelDowngrade();
  return pending;
}
