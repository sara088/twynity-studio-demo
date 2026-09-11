// Subscription tiers and entitlements. Custom avatars/voices use an expensive
// third-party service, so they're gated above the Free Trial. Generation is
// one-time per slot — spending a custom-avatar slot can't be refunded by
// deleting it. Mirrors the purchases/payment stores: localStorage + same-tab
// broadcast, so prototype views react to tier changes immediately.

export type TierId = "free-trial" | "basic" | "standard" | "pro" | "teams";

export interface Tier {
  id: TierId;
  name: string;
  /** Plan window in days (Free Trial is time-limited). */
  durationDays: number;
  /** One-time custom-avatar generations included (0 = stock only). */
  customAvatars: number;
  customVoices: number;
  /** Stock avatars selectable on this tier. */
  stockAvatars: number;
  /** Twynity Team seats. */
  teamSeats: number;
  /** Team-workflow count — Teams only ("3 team workflows" on the plans page). */
  workflows: number;
  trial?: boolean;

  // ─── Active-asset capacity (used by the downgrade flow) ───────────────────
  // What a tier can hold *at once*, as opposed to the one-time generation
  // allowances above. Exceeding these is what forces an archive selection when
  // moving down a tier.

  /**
   * Max active twyns. Mirrors the avatar allowance on the plans page
   * (customAvatars + stockAvatars) — a twyn occupies one avatar slot.
   */
  maxTwyns: number;
  /** Knowledge storage in MB — the plans page's "500 MB knowledge storage". */
  knowledgeMb: number;
  /**
   * Max active workflows.
   *
   * NOTE FOR DEVS: this number is *not* on the plans page — the page only says
   * "Cross-tool workflows" (a capability, no count), and `workflows` above is
   * the Teams-only team-workflow count. These are placeholders scaled off the
   * tier ladder; swap in the real caps when product confirms them.
   */
  maxWorkflows: number;
}

// Source of truth — matches the tiers matrix.
export const TIERS: Record<TierId, Tier> = {
  "free-trial": { id: "free-trial", name: "Free Trial", durationDays: 15, customAvatars: 0, customVoices: 0, stockAvatars: 1, teamSeats: 0, workflows: 0, trial: true, maxTwyns: 1, knowledgeMb: 100, maxWorkflows: 0 },
  basic: { id: "basic", name: "Basic", durationDays: 30, customAvatars: 1, customVoices: 1, stockAvatars: 3, teamSeats: 0, workflows: 0, maxTwyns: 4, knowledgeMb: 500, maxWorkflows: 3 },
  standard: { id: "standard", name: "Standard", durationDays: 30, customAvatars: 3, customVoices: 3, stockAvatars: 5, teamSeats: 0, workflows: 0, maxTwyns: 8, knowledgeMb: 1024, maxWorkflows: 6 },
  pro: { id: "pro", name: "Pro", durationDays: 30, customAvatars: 5, customVoices: 5, stockAvatars: 10, teamSeats: 0, workflows: 0, maxTwyns: 15, knowledgeMb: 3072, maxWorkflows: 12 },
  teams: { id: "teams", name: "Teams", durationDays: 30, customAvatars: 5, customVoices: 5, stockAvatars: 10, teamSeats: 3, workflows: 3, maxTwyns: 15, knowledgeMb: 10240, maxWorkflows: 20 },
};

/** Tier ladder, cheapest → richest. Anything earlier is a downgrade. */
export const TIER_ORDER: TierId[] = ["free-trial", "basic", "standard", "pro", "teams"];

/** Is `to` a lower tier than `from`? */
export function isDowngrade(from: TierId, to: TierId): boolean {
  return TIER_ORDER.indexOf(to) < TIER_ORDER.indexOf(from);
}

/**
 * Can the workspace move to `to` on its own?
 *
 * A trial is entry-only. Once a plan has been paid for, the trial is not a
 * destination you can return to — it's a one-time introduction, and treating it
 * as a downgrade target would hand every paid tier a free exit. Someone who
 * wants to stop paying cancels the subscription, which is a different flow with
 * different consequences (access ends, nothing is retained on a plan).
 */
export function canSwitchTo(from: TierId, to: TierId): boolean {
  if (from === to) return false;
  return !TIERS[to].trial;
}

/** The cheapest tier a workspace can move down to. Undefined = already lowest. */
export function lowestSwitchTarget(from: TierId): TierId | undefined {
  return TIER_ORDER.find((t) => isDowngrade(from, t) && canSwitchTo(from, t));
}

export const DEFAULT_TIER: TierId = "free-trial";

/** Does this tier include any custom-avatar generations? */
export function hasCustomAvatars(id: TierId): boolean {
  return TIERS[id].customAvatars > 0;
}

// Comp / access codes → the tier they unlock (prototype). "Paying" users go
// through Stripe instead; codes are for people we want to give access to.
const PROMO_CODES: Record<string, TierId> = {
  GOLD: "basic",
  BASIC: "basic",
  STANDARD: "standard",
  PRO: "pro",
  TEAMS: "teams",
};

/** Resolve a promo/access code to the tier it grants, or null if empty. Known
 * codes map to a specific tier; for the prototype, any other non-empty code is
 * accepted and grants Basic so testers can use whatever they type. */
export function tierForPromo(code: string): TierId | null {
  const trimmed = code.trim();
  if (!trimmed) return null;
  return PROMO_CODES[trimmed.toUpperCase()] ?? "basic";
}

// ─── Current-tier store (prototype) ─────────────────────────────────────────
const KEY = "twynity_tier";
const EVENT = "twynity:tier-changed";

// ── Dev / demo URL conventions ──────────────────────────────────────────────
// The `?tier=` query param previews a tier directly (wins over stored state),
// so the two flows are loadable by URL:
//
//   FREE TRIAL  ?tier=free   → no custom avatar. The studio shows a static
//                              PHOTO avatar + a "Make it move" upgrade pill.
//   BASIC       ?tier=basic  → custom avatar (also ?tier=paid, or any promo
//               (?tier=paid)   code). The studio shows the PROCESSING ("your
//                              avatar is being built") view — what you get right
//                              after upgrading. It settles into the moving
//                              avatar once the (demo) training window elapses.
//   (also ?tier=standard|pro|teams for the higher tiers)
//
// Studio extra: `?avatar=processing` also forces the "being built" view on any
// tier. Upgrading in-studio ("Make it move" → record/upload a video → pay) runs
// the real processing flow and switches the stored tier to Basic.
function tierFromParam(): TierId | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("tier");
  if (!raw) return null;
  if (raw === "paid") return "basic";
  if (raw === "free") return "free-trial";
  return (Object.keys(TIERS) as TierId[]).includes(raw as TierId) ? (raw as TierId) : null;
}

export function getTierId(): TierId {
  const fromParam = tierFromParam();
  if (fromParam) return fromParam;
  if (typeof window === "undefined") return DEFAULT_TIER;
  try {
    const raw = window.localStorage.getItem(KEY) as TierId | null;
    return raw && raw in TIERS ? raw : DEFAULT_TIER;
  } catch {
    return DEFAULT_TIER;
  }
}

export function getTier(): Tier {
  return TIERS[getTierId()];
}

export function setTierId(id: TierId) {
  try {
    window.localStorage.setItem(KEY, id);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function isTierId(v: string): v is TierId {
  return v in TIERS;
}

/**
 * Drop the `?tier=` preview param.
 *
 * The param deliberately outranks stored state so a tier can be previewed by
 * URL — but that also means a real plan change made while previewing would be
 * invisible, since the param keeps winning. Any flow that actually changes the
 * plan calls this so the new tier takes effect.
 */
export function clearTierPreview() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("tier")) return;
    url.searchParams.delete("tier");
    window.history.replaceState({}, "", url.toString());
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function onTierChanged(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
