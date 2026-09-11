// Downgrade capacity + archive model.
//
// Moving to a cheaper tier can leave a workspace holding more than the new tier
// allows. Rather than deleting the excess, the user picks what stays active and
// what gets archived — archived assets keep their data and come back when the
// workspace moves up again.
//
// Timing: a downgrade takes effect at the END of the current billing period, so
// nothing is archived at the moment of choosing. The selection is stored
// alongside the pending downgrade and applied on the switch date; until then the
// user keeps everything and can cancel the switch.
//
// Stores follow the same shape as the other prototype stores (teams, purchases):
// localStorage + a same-tab event so views react immediately.

import { TIERS, type Tier, type TierId } from "@/features/shared/lib/tier";
import { TWYNS } from "@/features/my-twyns/data/mock-data";

// ─── Asset model ────────────────────────────────────────────────────────────

export type AssetKind = "twyn" | "knowledge" | "workflow";

export interface Asset {
  id: string;
  kind: AssetKind;
  name: string;
  /** Secondary line — role, owning twyn, trigger… */
  meta: string;
  /** Knowledge only: size in MB. Other kinds count as 1 unit each. */
  sizeMb?: number;
}

/** "2.4 MB" / "18 KB" / "44 MB" → MB as a number. */
export function parseSizeMb(label: string): number {
  const m = /^([\d.]+)\s*(KB|MB|GB)$/i.exec(label.trim());
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = m[2].toUpperCase();
  if (unit === "KB") return n / 1024;
  if (unit === "GB") return n * 1024;
  return n;
}

export function formatMb(mb: number): string {
  if (mb <= 0) return "0 MB";
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`;
  if (mb < 1) return `${Math.round(mb * 1024)} KB`;
  return `${mb % 1 === 0 ? mb : mb.toFixed(1)} MB`;
}

/** "1 twyn" / "2 twyns" — singular nouns for the count-based categories. */
export function pluralize(n: number, singular: string): string {
  return `${n} ${singular}${n === 1 ? "" : "s"}`;
}

const SINGULAR: Record<AssetKind, string> = {
  twyn: "twyn",
  knowledge: "knowledge pack",
  workflow: "workflow",
};

/**
 * How much still has to go, named — for places that mix categories together
 * ("archive 2 twyns and 139.5 MB of knowledge").
 */
export function overLabel(b: Budget): string {
  return b.bySize ? `${formatMb(b.over)} of knowledge` : pluralize(b.over, SINGULAR[b.kind]);
}

/**
 * The bare amount, for places already inside one category — repeating the
 * category name there reads as a stutter ("archive 139.5 MB of knowledge more").
 */
export function overAmount(b: Budget): string {
  return b.bySize ? formatMb(b.over) : String(b.over);
}

/**
 * Active workflows.
 *
 * NOTE FOR DEVS: the Workflows feature isn't on `design` yet — the workshop
 * catalog here has capabilities / skills / interconnectors / knowledge only.
 * This placeholder list keeps the third category demonstrable end-to-end; when
 * Workflows ship, replace the body with the real catalog and delete the mock.
 */
function workflowAssets(): Asset[] {
  return [
    { id: "wf-morning-brief", kind: "workflow", name: "Morning Brief", meta: "Daily · 8:00" },
    { id: "wf-inbox-triage", kind: "workflow", name: "Inbox triage", meta: "On new mail" },
    { id: "wf-weekly-report", kind: "workflow", name: "Weekly report", meta: "Fridays · 16:00" },
    { id: "wf-lead-research", kind: "workflow", name: "Lead research", meta: "Manual" },
    { id: "wf-meeting-recap", kind: "workflow", name: "Meeting recap", meta: "After each call" },
  ];
}

function twynAssets(): Asset[] {
  return TWYNS.map((t) => ({ id: t.id, kind: "twyn" as const, name: t.name, meta: t.role }));
}

/** Knowledge packs, flattened off the twyns that own them, with real sizes. */
function knowledgeAssets(): Asset[] {
  const out: Asset[] = [];
  for (const t of TWYNS) {
    for (const k of t.knowledge ?? []) {
      out.push({
        id: `${t.id}:${k.name}`,
        kind: "knowledge",
        name: k.name,
        meta: `${t.name} · ${k.size}`,
        sizeMb: parseSizeMb(k.size),
      });
    }
  }
  return out;
}

export function allAssets(): Asset[] {
  return [...twynAssets(), ...knowledgeAssets(), ...workflowAssets()];
}

// ─── Capacity ───────────────────────────────────────────────────────────────

export interface Budget {
  kind: AssetKind;
  label: string;
  /** True when this category is measured in MB rather than a count. */
  bySize: boolean;
  /** What the target tier allows (units or MB). */
  limit: number;
  /** What the current selection uses (units or MB). */
  used: number;
  /** How much must still be archived to fit. 0 = fits. */
  over: number;
}

export function limitFor(tier: Tier, kind: AssetKind): number {
  if (kind === "twyn") return tier.maxTwyns;
  if (kind === "workflow") return tier.maxWorkflows;
  return tier.knowledgeMb;
}

const LABELS: Record<AssetKind, string> = {
  twyn: "Twyns",
  knowledge: "Knowledge packs",
  workflow: "Workflows",
};

export const KIND_ORDER: AssetKind[] = ["twyn", "knowledge", "workflow"];

/** Usage of one category, counting only the assets the user is keeping. */
function usageFor(assets: Asset[], kind: AssetKind, archived: Set<string>): number {
  const kept = assets.filter((a) => a.kind === kind && !archived.has(a.id));
  if (kind === "knowledge") return kept.reduce((n, a) => n + (a.sizeMb ?? 0), 0);
  return kept.length;
}

/**
 * Budgets for every category under `targetTier`, given what's currently marked
 * for archiving. Pass an empty set to see the raw overage before any selection.
 */
export function budgetsFor(
  assets: Asset[],
  targetTier: Tier,
  archived: Set<string> = new Set(),
): Budget[] {
  return KIND_ORDER.map((kind) => {
    const limit = limitFor(targetTier, kind);
    const used = usageFor(assets, kind, archived);
    // Round MB comparisons to avoid a 0.001 overage blocking the button.
    const over = Math.max(0, Math.round((used - limit) * 100) / 100);
    return { kind, label: LABELS[kind], bySize: kind === "knowledge", limit, used, over };
  });
}

/** Does everything fit without archiving anything? (Scenario 1) */
export function fitsWithoutArchiving(assets: Asset[], targetTier: Tier): boolean {
  return budgetsFor(assets, targetTier).every((b) => b.over === 0);
}

/** Is the current selection enough to complete the downgrade? (Scenario 3) */
export function selectionSatisfies(
  assets: Asset[],
  targetTier: Tier,
  archived: Set<string>,
): boolean {
  return budgetsFor(assets, targetTier, archived).every((b) => b.over === 0);
}

/** What the user has explicitly said about an asset. Untouched assets have none. */
export type Decision = "keep" | "archive";

export interface Selection {
  /** Everything that will be archived — the user's choices plus auto-fill. */
  archived: Set<string>;
  /** The subset the system chose, so the UI can explain why they're crossed out. */
  auto: Set<string>;
}

/**
 * Resolve the user's decisions into a full selection.
 *
 * The user shouldn't have to do the arithmetic: whatever they've explicitly
 * decided is honoured, and the system fills the rest from assets they haven't
 * touched until each category fits. So keeping something that was auto-archived
 * pushes the next untouched asset out instead of dead-ending on an over-limit
 * error.
 *
 * Explicit decisions are never overridden — if the user keeps so much that no
 * untouched assets are left to compensate, the selection simply doesn't fit and
 * the UI asks them to give something up.
 *
 * Auto-fill order is "last first", which maps to oldest in the mock data; the
 * real implementation should order by least-recently-used.
 */
export function resolveSelection(
  assets: Asset[],
  targetTier: Tier,
  decisions: Record<string, Decision>,
): Selection {
  const archived = new Set(
    Object.entries(decisions)
      .filter(([, d]) => d === "archive")
      .map(([id]) => id),
  );
  const auto = new Set<string>();

  for (const kind of KIND_ORDER) {
    const untouched = assets.filter((a) => a.kind === kind && !decisions[a.id]).reverse();
    for (const a of untouched) {
      const b = budgetsFor(assets, targetTier, archived).find((x) => x.kind === kind)!;
      if (b.over === 0) break;
      archived.add(a.id);
      auto.add(a.id);
    }
  }
  return { archived, auto };
}

// ─── Billing period ─────────────────────────────────────────────────────────

/**
 * When the current period ends — the date a downgrade takes effect.
 * Fixed rather than computed so server and client render the same string
 * (a live `new Date()` here would cause a hydration mismatch).
 */
export const PERIOD_END_LABEL = "12 September 2026";

// ─── Pending-downgrade store ────────────────────────────────────────────────

export interface PendingDowngrade {
  to: TierId;
  /** Display date the switch applies. */
  effectiveOn: string;
  /** Asset ids that will be archived on that date. */
  archive: string[];
}

const KEY = "twynity_pending_downgrade";
const EVENT = "twynity:downgrade-changed";

export function getPendingDowngrade(): PendingDowngrade | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingDowngrade) : null;
  } catch {
    return null;
  }
}

export function scheduleDowngrade(to: TierId, archive: string[]) {
  try {
    const p: PendingDowngrade = { to, effectiveOn: PERIOD_END_LABEL, archive };
    window.localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function cancelDowngrade() {
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function onDowngradeChanged(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function tierName(id: TierId): string {
  return TIERS[id].name;
}
