"use client";

// ─────────────────────────────────────────────────────────────────────────
// The demo CRM — one source of truth behind every app in the Canvas.
//
// This stands in for what a Frappe CRM MCP server would return. The apps hold
// no state of their own: the board, the deal record and the lead capture all
// read this, so dragging a card updates the twyn's summary and the record
// behind it. Three views, one dataset — not three demos.
//
// Deliberately in-memory rather than the usual localStorage store (see
// shared/lib/tier.ts): a demo should start from a known state every reload,
// and it keeps SSR hydration out of the picture entirely.
// ─────────────────────────────────────────────────────────────────────────

import { useSyncExternalStore } from "react";

/** The sales journey as Lee actually runs it. */
export type StageId =
  | "called" | "meeting" | "demo" | "contract" | "closed" | "onboarded";

export interface Stage {
  value: StageId;
  label: string;
  /** What "done" means for this column — shown under the heading. */
  meaning: string;
  probability: number;
}

export const STAGES: Stage[] = [
  { value: "called",    label: "Called",     meaning: "first contact made", probability: 10 },
  { value: "meeting",   label: "Meeting",    meaning: "first meeting done", probability: 30 },
  { value: "demo",      label: "Demo",       meaning: "they've seen it",    probability: 50 },
  { value: "contract",  label: "Contract",   meaning: "sent, awaiting sig", probability: 75 },
  { value: "closed",    label: "Closed won", meaning: "signed",             probability: 100 },
  { value: "onboarded", label: "Onboarded",  meaning: "up and running",     probability: 100 },
];

export const stageOf = (id: StageId) => STAGES.find((s) => s.value === id)!;

export const TRADES = ["Plumbing", "Electrical", "HVAC", "Roofing", "Landscaping"] as const;
export type Trade = (typeof TRADES)[number];

/** Days without contact before a deal counts as gone quiet. */
export const STALE_AFTER = 7;

export interface Deal {
  id: string;
  company: string;
  contact: string;
  phone: string;
  stage: StageId;
  value: number | null;
  trade: Trade;
  /** Days since anything was logged against it. */
  days: number;
  owner: string;
}

export type ActivityKind = "call" | "meeting" | "demo" | "contract" | "note";

export interface Activity {
  id: string;
  dealId: string;
  kind: ActivityKind;
  text: string;
  when: string;
}

export interface LeadState {
  owner: string | null;
  created: boolean;
}

export interface CrmState {
  deals: Deal[];
  activity: Activity[];
  lead: LeadState;
}

export const OWNERS = ["Lee Carter", "Nolan Reed", "Dana Whitfield"];

// ── Seed ────────────────────────────────────────────────────────────────
const SEED_DEALS: Deal[] = [
  { id: "d-bobs", company: "Bob's Plumbing", contact: "Bob Ferraro",
    phone: "(415) 555-0142", stage: "called", value: 4800, trade: "Plumbing",
    days: 9, owner: "Lee Carter" },
  { id: "d-halvorsen", company: "Halvorsen Electric", contact: "Ingrid Halvorsen",
    phone: "(415) 555-0188", stage: "meeting", value: 7200, trade: "Electrical",
    days: 2, owner: "Lee Carter" },
  { id: "d-cascade", company: "Cascade Heating & Air", contact: "Marcus Oyelaran",
    phone: "(503) 555-0119", stage: "meeting", value: 12000, trade: "HVAC",
    days: 4, owner: "Dana Whitfield" },
  { id: "d-ridgeline", company: "Ridgeline Roofing", contact: "Tom Beaudry",
    phone: "(503) 555-0177", stage: "demo", value: 9600, trade: "Roofing",
    days: 1, owner: "Lee Carter" },
  { id: "d-verdant", company: "Verdant Grounds", contact: "Priya Raman",
    phone: "(415) 555-0164", stage: "contract", value: 15400, trade: "Landscaping",
    days: 3, owner: "Lee Carter" },
  { id: "d-pipeworks", company: "Pipeworks Co.", contact: "Sal Mendes",
    phone: "(206) 555-0130", stage: "closed", value: 6300, trade: "Plumbing",
    days: 6, owner: "Dana Whitfield" },
];

const SEED_ACTIVITY: Activity[] = [
  { id: "a1", dealId: "d-bobs", kind: "call", when: "2 Sep",
    text: "Cold call. Bob picked up — runs six vans, still books jobs on paper. Asked me to call back after the holiday." },
  { id: "a2", dealId: "d-halvorsen", kind: "call", when: "6 Sep",
    text: "Ingrid called us. Found us through the Cascade referral." },
  { id: "a3", dealId: "d-halvorsen", kind: "meeting", when: "9 Sep",
    text: "First meeting. Twelve sparkies, scheduling is the pain — double-booked two jobs last month." },
  { id: "a4", dealId: "d-cascade", kind: "meeting", when: "7 Sep",
    text: "Marcus wants his dispatchers off the whiteboard before winter." },
  { id: "a5", dealId: "d-ridgeline", kind: "demo", when: "10 Sep",
    text: "Demo went well. Tom's question was whether it works offline on a roof — it does." },
  { id: "a6", dealId: "d-verdant", kind: "contract", when: "8 Sep",
    text: "Contract sent. Priya said she'd sign once her partner reviews it." },
  { id: "a7", dealId: "d-pipeworks", kind: "contract", when: "5 Sep",
    text: "Signed. Sal wants onboarding before the end of the month." },
];

function seed(): CrmState {
  return {
    deals: SEED_DEALS.map((d) => ({ ...d })),
    activity: SEED_ACTIVITY.map((a) => ({ ...a })),
    lead: { owner: null, created: false },
  };
}

// ── Store ───────────────────────────────────────────────────────────────
let state: CrmState = seed();
const listeners = new Set<() => void>();

function set(next: CrmState) {
  state = next;
  listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getSnapshot = () => state;

export function useCrm(): CrmState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const getCrm = () => state;

// ── Derived ─────────────────────────────────────────────────────────────
export const isStale = (d: Deal) =>
  d.days > STALE_AFTER && d.stage !== "closed" && d.stage !== "onboarded";

export function totals(deals: Deal[]) {
  const live = deals.filter((d) => d.stage !== "onboarded");
  return {
    open: live.length,
    total: live.reduce((n, d) => n + (d.value ?? 0), 0),
    weighted: Math.round(
      live.reduce((n, d) => n + (d.value ?? 0) * (stageOf(d.stage).probability / 100), 0)
    ),
    stale: deals.filter(isStale).length,
  };
}

export const activityFor = (s: CrmState, dealId: string) =>
  s.activity.filter((a) => a.dealId === dealId);

// ── Mutations ───────────────────────────────────────────────────────────

/**
 * Move a deal to a stage. Logs the move and resets the staleness clock, so
 * dragging a card is a real event rather than just a visual change.
 */
export function moveDeal(dealId: string, to: StageId): Stage | null {
  const deal = state.deals.find((d) => d.id === dealId);
  if (!deal || deal.stage === to) return null;
  const stage = stageOf(to);
  set({
    ...state,
    deals: state.deals.map((d) => (d.id === dealId ? { ...d, stage: to, days: 0 } : d)),
    activity: [
      { id: `a-${Date.now()}`, dealId, when: "just now",
        kind: to === "contract" ? "contract" : to === "demo" ? "demo" : "note",
        text: `Moved to ${stage.label} — ${stage.meaning}.` },
      ...state.activity,
    ],
  });
  return stage;
}

/** Log a call, meeting or note against a deal. Resets staleness. */
export function logActivity(dealId: string, kind: ActivityKind, text: string) {
  if (!state.deals.some((d) => d.id === dealId)) return;
  set({
    ...state,
    deals: state.deals.map((d) => (d.id === dealId ? { ...d, days: 0 } : d)),
    activity: [
      { id: `a-${Date.now()}`, dealId, kind, when: "just now", text },
      ...state.activity,
    ],
  });
}

export function assignLeadOwner(owner: string) {
  set({ ...state, lead: { ...state.lead, owner } });
}

/** Create the captured lead as a deal in Called. */
export function createLead(): Deal | null {
  if (!state.lead.owner || state.lead.created) return null;
  const deal: Deal = {
    id: "d-summit", company: "Summit Mechanical", contact: "Dee Kowalski",
    phone: "(206) 555-0198", stage: "called", value: 5200, trade: "HVAC",
    days: 0, owner: state.lead.owner,
  };
  set({
    ...state,
    deals: [...state.deals, deal],
    activity: [
      { id: `a-${Date.now()}`, dealId: deal.id, kind: "call", when: "just now",
        text: "Cold call logged from the conversation. Dee asked for a callback Thursday." },
      ...state.activity,
    ],
    lead: { ...state.lead, created: true },
  });
  return deal;
}

/** Back to the seeded pipeline, so a demo always starts the same way. */
export function resetCrm() {
  set(seed());
}
