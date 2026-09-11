"use client";

// ─────────────────────────────────────────────────────────────────────────
// The demo CRM — one source of truth behind every MCP app.
//
// This stands in for what `frappe-crm-mcp` would return. The apps don't hold
// state of their own: the board, the gate and the lead capture all read this,
// so advancing a deal in the gate moves its card on the board, and converting
// a lead puts a new card in Identified. That coherence is the point — four
// apps over one dataset, not four demos.
//
// Deliberately in-memory rather than the usual localStorage store (see
// shared/lib/tier.ts): a demo should start from a known state every reload,
// and it keeps SSR hydration out of the picture entirely.
// ─────────────────────────────────────────────────────────────────────────

import { useSyncExternalStore } from "react";

export type StageId =
  | "identified" | "qualified" | "discovery" | "demo"
  | "design" | "proposal" | "commercial";

export interface Stage {
  value: StageId;
  label: string;
  /** Default probability — Bernie's configured pipeline. */
  probability: number;
}

export const STAGES: Stage[] = [
  { value: "identified", label: "Identified", probability: 5 },
  { value: "qualified", label: "Qualified", probability: 15 },
  { value: "discovery", label: "Discovery", probability: 25 },
  { value: "demo", label: "Capability Demo", probability: 35 },
  { value: "design", label: "Solution Design", probability: 50 },
  { value: "proposal", label: "Proposal", probability: 65 },
  { value: "commercial", label: "Commercial Neg.", probability: 80 },
];

export const SERVICE_LINES = ["EAIW", "AISC", "ITWC", "TADS"] as const;
export type ServiceLine = (typeof SERVICE_LINES)[number];

/** Stage-rot limit in days, per service line. Playbook §5. */
export const ROT_LIMIT: Record<ServiceLine, number> = {
  AISC: 10, EAIW: 15, ITWC: 20, TADS: 15,
};

export interface Deal {
  id: string;
  name: string;
  account: string;
  stage: StageId;
  value: number | null;
  line: ServiceLine;
  /** Days in the current stage. */
  days: number;
  owner: string;
}

export type CriterionState = "done" | "drafted" | "todo";

export interface Criterion {
  id: string;
  label: string;
  value?: string;
  state: CriterionState;
  /** Where the twyn found it — intra-Frappe only. */
  source?: string;
  tag: string;
  /** Only a person can satisfy this; the twyn must not fill it. */
  humanOnly?: boolean;
}

export interface LeadState {
  owner: string | null;
  duplicate: "unresolved" | "linked" | "separate";
  created: boolean;
  converted: boolean;
}

export interface CrmState {
  deals: Deal[];
  /** Exit criteria for the deal's *current* stage, keyed by deal id. */
  criteria: Record<string, Criterion[]>;
  drafts: Record<string, { body: string; meta: string }>;
  lead: LeadState;
}

export const OWNERS = ["Bernie Adjei", "Nana Owusu", "Admin User"];

// ── Seed ────────────────────────────────────────────────────────────────
const SEED_DEALS: Deal[] = [
  { id: "d-ecobank", name: "AI Compliance Monitor", account: "EcoBank Ghana",
    stage: "identified", value: null, line: "AISC", days: 2, owner: "Bernie Adjei" },
  { id: "d-techvision", name: "AI Strategy Engagement", account: "TechVision Ltd",
    stage: "qualified", value: 120000, line: "AISC", days: 14, owner: "Bernie Adjei" },
  { id: "d-stanbic", name: "Data Operations Review", account: "Stanbic Bank",
    stage: "qualified", value: 60000, line: "AISC", days: 5, owner: "Nana Owusu" },
  { id: "d-volta", name: "Operations Intelligence Twyn", account: "Volta River Authority",
    stage: "discovery", value: null, line: "EAIW", days: 7, owner: "Bernie Adjei" },
  { id: "d-meridian", name: "Clinical Decision Support", account: "Meridian Health Systems",
    stage: "proposal", value: null, line: "ITWC", days: 3, owner: "Nana Owusu" },
  { id: "d-nexus", name: "AI Document Processing", account: "Nexus Corp International",
    stage: "commercial", value: null, line: "EAIW", days: 1, owner: "Bernie Adjei" },
];

// TechVision is the worked example — four criteria the twyn found in Frappe's
// own call logs and contact records, one it drafted, one only a person can do.
const TECHVISION_CRITERIA: Criterion[] = [
  { id: "c-problem", label: "Business problem captured",
    value: "“Manual document review costs $2M/yr”", state: "done",
    source: "from your call log, 14 Aug", tag: "Filled" },
  { id: "c-buyer", label: "Economic buyer identified",
    value: "Kwame Asante · Chief Data Officer", state: "done",
    source: "from the contact record", tag: "Filled" },
  { id: "c-budget", label: "Budget status recorded", value: "Budget being sought",
    state: "done", source: "from your call log, 22 Aug", tag: "Filled" },
  { id: "c-value", label: "Estimated value entered", value: "$120,000 USD",
    state: "done", tag: "On record" },
  { id: "c-timeline", label: "Timeline driver recorded",
    value: "Drafted below — needs your approval", state: "drafted", tag: "Drafted" },
  { id: "c-interaction", label: "Two-way interaction logged",
    value: "Only you can log this — a call or a meeting. Emails don't count.",
    state: "todo", tag: "Needs you", humanOnly: true },
];

/** Every other deal gets a plausible gate for its stage, so any card opens. */
function genericCriteria(deal: Deal): Criterion[] {
  return [
    { id: "g-problem", label: "Business problem captured",
      value: deal.value ? "Captured in discovery notes" : "Nothing on record yet",
      state: deal.value ? "done" : "todo",
      source: deal.value ? "from your call log" : undefined,
      tag: deal.value ? "Filled" : "Needs you" },
    { id: "g-buyer", label: "Economic buyer identified",
      value: "Named on the account", state: "done",
      source: "from the contact record", tag: "Filled" },
    { id: "g-value", label: "Estimated value entered",
      value: deal.value ? `$${deal.value.toLocaleString("en-US")} USD` : "No value entered",
      state: deal.value ? "done" : "todo", tag: deal.value ? "On record" : "Needs you" },
    { id: "g-interaction", label: "Two-way interaction logged",
      value: "Only you can log this — a call or a meeting.",
      state: "todo", tag: "Needs you", humanOnly: true },
  ];
}

function seed(): CrmState {
  const criteria: Record<string, Criterion[]> = {};
  for (const d of SEED_DEALS) {
    criteria[d.id] =
      d.id === "d-techvision" ? TECHVISION_CRITERIA.map((c) => ({ ...c })) : genericCriteria(d);
  }
  return {
    deals: SEED_DEALS.map((d) => ({ ...d })),
    criteria,
    drafts: {
      "d-techvision": {
        body: "“Regulatory review lands in Q1 and Kwame wants the compliance workload cut before it does. He named the January board as the forcing date.”",
        meta: "Composed from two call logs, 14 and 22 August. Nothing is written to the deal until you approve it.",
      },
    },
    lead: { owner: null, duplicate: "unresolved", created: false, converted: false },
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

/** Subscribe a component to the demo CRM. */
export function useCrm(): CrmState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const getCrm = () => state;

// ── Derived ─────────────────────────────────────────────────────────────
export const rotLimit = (d: Deal) => ROT_LIMIT[d.line];
export const isRotten = (d: Deal) => d.days > rotLimit(d);
export const stageOf = (id: StageId) => STAGES.find((s) => s.value === id)!;

export function pipelineTotals(deals: Deal[]) {
  const total = deals.reduce((n, d) => n + (d.value ?? 0), 0);
  const weighted = Math.round(
    deals.reduce((n, d) => n + (d.value ?? 0) * (stageOf(d.stage).probability / 100), 0)
  );
  return { total, weighted, flagged: deals.filter(isRotten).length, open: deals.length };
}

export function gateReady(criteria: Criterion[]) {
  return criteria.every((c) => c.state === "done");
}

/** The stage a deal would advance to, or null at the end of the pipeline. */
export function nextStage(deal: Deal): Stage | null {
  const i = STAGES.findIndex((s) => s.value === deal.stage);
  return i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1] : null;
}

// ── Mutations — what the "write" tools do ───────────────────────────────

/** Approve a drafted criterion. Draft-and-propose: only a person does this. */
export function approveDraft(dealId: string) {
  const criteria = state.criteria[dealId];
  if (!criteria) return;
  set({
    ...state,
    criteria: {
      ...state.criteria,
      [dealId]: criteria.map((c) =>
        c.state === "drafted"
          ? { ...c, state: "done", tag: "Approved", value: "Approved by you just now" }
          : c
      ),
    },
  });
}

/** Log the two-way interaction only a person can log. */
export function logInteraction(dealId: string) {
  const criteria = state.criteria[dealId];
  if (!criteria) return;
  set({
    ...state,
    criteria: {
      ...state.criteria,
      [dealId]: criteria.map((c) =>
        c.humanOnly
          ? { ...c, state: "done", tag: "Logged",
              value: "Discovery call logged by you just now" }
          : c
      ),
    },
  });
}

/** Fill a criterion the twyn couldn't infer (generic gates). */
export function satisfyCriterion(dealId: string, criterionId: string) {
  const criteria = state.criteria[dealId];
  if (!criteria) return;
  set({
    ...state,
    criteria: {
      ...state.criteria,
      [dealId]: criteria.map((c) =>
        c.id === criterionId
          ? { ...c, state: "done", tag: "Filled", value: "Recorded by you just now" }
          : c
      ),
    },
  });
}

/**
 * Advance a deal. Refuses unless every criterion is met — the gate is enforced
 * here, not only in the button's disabled state.
 */
export function advanceDeal(dealId: string): Stage | null {
  const deal = state.deals.find((d) => d.id === dealId);
  const criteria = state.criteria[dealId];
  if (!deal || !criteria || !gateReady(criteria)) return null;
  const next = nextStage(deal);
  if (!next) return null;
  const moved: Deal = { ...deal, stage: next.value, days: 0 };
  set({
    ...state,
    deals: state.deals.map((d) => (d.id === dealId ? moved : d)),
    // A new stage means a new gate.
    criteria: { ...state.criteria, [dealId]: genericCriteria(moved) },
  });
  return next;
}

export function resolveDuplicate(choice: "linked" | "separate") {
  set({ ...state, lead: { ...state.lead, duplicate: choice } });
}

export function assignLeadOwner(owner: string) {
  set({ ...state, lead: { ...state.lead, owner } });
}

export function createLead() {
  if (!state.lead.owner) return false;
  set({ ...state, lead: { ...state.lead, created: true } });
  return true;
}

/**
 * Convert the lead to an opportunity at Stage 1 — the mockup's own rule:
 * "On status → Qualified, show Convert Lead which creates Account + Contact +
 * Opportunity at Stage: Identified."
 */
export function convertLead(): Deal | null {
  if (!state.lead.created || state.lead.converted) return null;
  const deal: Deal = {
    id: "d-ashanti",
    name: "Document Processing — compliance",
    account:
      state.lead.duplicate === "linked" ? "Ashanti Gold Ltd" : "Ashanti Gold Refinery",
    stage: "identified",
    value: null,
    line: "EAIW",
    days: 0,
    owner: state.lead.owner ?? "Bernie Adjei",
  };
  set({
    ...state,
    deals: [...state.deals, deal],
    criteria: { ...state.criteria, [deal.id]: genericCriteria(deal) },
    lead: { ...state.lead, converted: true },
  });
  return deal;
}

/** Back to the seeded pipeline — so a demo always starts from the same place. */
export function resetCrm() {
  set(seed());
}
