// ─────────────────────────────────────────────────────────────────────────
// Canvas apps — described, not built.
//
// A tool returns two things: its rows and a *description* of how to show them.
// The Canvas renders the description with Twynity's own components, so an app
// is native by construction — it never ships styling of its own.
//
// Two rules this file keeps:
//   1. `blocks` are static. Only `data()` changes between calls, exactly like a
//      real tool returning fresh structuredContent each invocation.
//   2. Interaction is declared, never coded. A control carries an *intent*
//      ("move this deal"); TalkView decides what that means. Nothing here knows
//      about React state, the Canvas, or the chat thread.
//
// Adding a fifth app means adding a descriptor below. Nothing else.
// ─────────────────────────────────────────────────────────────────────────

import {
  OWNERS, STAGES, activityFor, isStale, stageOf, totals, type CrmState,
} from "../lib/crm-store";

/** "$.path" reads the tool result; "{{ field }}" interpolates a row. */
export type Binding = string;

/** What a control asks the host to do. The renderer never performs these. */
export type Intent =
  | { kind: "rebind"; groupBy: string }
  | { kind: "open"; app: string; deal?: string }
  | {
      kind: "tool";
      op: "move" | "logCall" | "logMeeting" | "assignOwner" | "createLead" | "reset";
      deal?: Binding;
      value?: Binding;
    };

export interface ActionSpec {
  label: Binding;
  primary?: boolean;
  /** Data key that must be truthy for this action to be enabled. */
  enabledWhen?: string;
  /** Data key that must be truthy for this action to render at all. */
  when?: string;
  do?: Intent;
}

export interface FigureSpec {
  label: string;
  value: Binding;
  format?: "currency.usd";
  warnWhenSet?: boolean;
}

export interface CardSpec {
  title: Binding;
  subtitle: Binding;
  value?: { field: string; format?: "currency.usd"; emptyLabel?: string };
  chips?: Binding[];
}

export interface FieldSpec {
  label: string;
  value?: Binding;
  required?: boolean;
  source?: Binding;
  optional?: boolean;
  /** Renders a control instead of a value while `value` is empty. */
  choose?: { from: string; placeholder: string; op: Intent };
}

interface BaseBlock {
  /** Data key that must be truthy for the block to render. */
  when?: string;
}

export type Block = BaseBlock &
  (
    | { type: "figures"; items: FigureSpec[] }
    | {
        type: "board";
        data: string;
        groupBy: string;
        columnSets: Record<string, { value: string; label: string; meta?: Binding }[]>;
        rankBy: { field: string; direction?: "asc" | "desc" };
        card: CardSpec;
        flag?: { field: string; over: number; chip: Binding };
        onCardClick?: Intent;
        /** Dragging a card to another column emits this with `value` set to the
         *  target column. Omit it and the board is read-only. */
        onCardDrop?: Intent;
        emptyLabel?: string;
      }
    | { type: "fields"; label?: string; tone?: "read" | "inferred" | "needs"; items: FieldSpec[] }
    | { type: "timeline"; label?: string; data: string }
    | { type: "keyvalue"; label?: string; data: string }
    | { type: "notice"; tone: "good" | "warn"; text: Binding; actions?: ActionSpec[] }
  );

export interface AppDescriptor {
  id: string;
  /** May interpolate from data, e.g. "{{ company }}". */
  title: Binding;
  subtitle?: Binding;
  icon: "board" | "person" | "card" | "wrench";
  triggers: string[];
  /** What the twyn says. May interpolate from data. */
  reply: Binding;
  inline: Block[];
  canvas: Block[];
  actions?: ActionSpec[];
  footNote?: Binding;
  /** The tool result. Recomputed on every render — this is the live part. */
  data: (state: CrmState, params?: Record<string, string>) => Record<string, unknown>;
}

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

// ── 1 · The pipeline ────────────────────────────────────────────────────
const STAGE_COLUMNS = STAGES.map((s) => ({
  value: s.value,
  label: s.label,
  meta: s.meaning,
}));

const OWNER_COLUMNS = OWNERS.map((o) => ({
  value: o,
  label: o.split(" ")[0],
  meta: o.split(" ")[1],
}));

const PIPELINE: AppDescriptor = {
  id: "crm.pipeline",
  title: "Pipeline",
  subtitle: "{{ open }} live · {{ totalLabel }} · drag a card to move it",
  icon: "board",
  triggers: ["show me the pipeline", "show the pipeline", "my pipeline", "pipeline", "the board"],
  reply: "**{{ totalLabel }}** across {{ open }} live deals. {{ staleLine }}",
  inline: [
    { type: "figures", items: [
      { label: "Live", value: "$.totalLabel" },
      { label: "Weighted", value: "$.weighted", format: "currency.usd" },
      { label: "Gone quiet", value: "$.stale", warnWhenSet: true },
    ] },
  ],
  canvas: [
    { type: "board",
      data: "$.deals",
      groupBy: "stage",
      columnSets: { stage: STAGE_COLUMNS, owner: OWNER_COLUMNS },
      rankBy: { field: "value", direction: "desc" },
      card: {
        title: "{{ company }}",
        subtitle: "{{ contact }}",
        value: { field: "value", format: "currency.usd", emptyLabel: "No value yet" },
        chips: ["{{ trade }}", "{{ days }}d quiet"],
      },
      flag: { field: "days", over: 7, chip: "{{ days }} days quiet" },
      onCardClick: { kind: "open", app: "crm.deal" },
      onCardDrop: { kind: "tool", op: "move" },
      emptyLabel: "Nothing here",
    },
  ],
  actions: [
    { label: "Group by rep", do: { kind: "rebind", groupBy: "owner" } },
    { label: "Chase {{ staleName }}", primary: true, when: "stale",
      do: { kind: "open", app: "crm.deal", deal: "$.staleId" } },
  ],
  footNote: "Six stages, as Lee runs them · drag between columns to move a deal",
  data: (s) => {
    const t = totals(s.deals);
    const stalest = s.deals.filter(isStale).sort((a, b) => b.days - a.days)[0];
    return {
      ...t,
      totalLabel: money(t.total),
      deals: s.deals,
      staleId: stalest?.id ?? "",
      staleName: stalest ? stalest.company.split(" ")[0] : "",
      staleLine: stalest
        ? `${stalest.company} has gone quiet — ${stalest.days} days since anyone logged anything.`
        : "Nothing has gone quiet.",
    };
  },
};

// ── 2 · A deal record ───────────────────────────────────────────────────
const DEAL: AppDescriptor = {
  id: "crm.deal",
  title: "{{ company }}",
  subtitle: "{{ contact }} · {{ phone }} · {{ stageLabel }}",
  icon: "card",
  triggers: ["open bob", "bob's plumbing", "bobs plumbing", "show me bob"],
  reply: "{{ replyLine }}",
  inline: [
    { type: "figures", items: [
      { label: "Value", value: "$.valueLabel" },
      { label: "Stage", value: "$.stageLabel" },
      { label: "Quiet", value: "$.days" },
    ] },
  ],
  canvas: [
    { type: "notice", when: "stale", tone: "warn", text: "{{ staleLine }}" },
    { type: "keyvalue", label: "The account", data: "$.facts" },
    { type: "timeline", label: "What's happened", data: "$.activity" },
  ],
  actions: [
    { label: "Log a call", do: { kind: "tool", op: "logCall", deal: "$.dealId" } },
    { label: "Log a meeting", do: { kind: "tool", op: "logMeeting", deal: "$.dealId" } },
    { label: "Move to {{ nextLabel }}", primary: true, when: "hasNext",
      do: { kind: "tool", op: "move", deal: "$.dealId", value: "$.nextStage" } },
  ],
  footNote: "Everything here is logged against the deal in the CRM.",
  data: (s, params) => {
    const deal = s.deals.find((d) => d.id === params?.deal) ?? s.deals[0];
    const i = STAGES.findIndex((x) => x.value === deal.stage);
    const next = i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1] : null;
    const stale = isStale(deal);
    return {
      dealId: deal.id,
      company: deal.company,
      contact: deal.contact,
      phone: deal.phone,
      days: deal.days,
      stageLabel: stageOf(deal.stage).label,
      valueLabel: deal.value ? money(deal.value) : "—",
      nextStage: next?.value ?? "",
      nextLabel: next?.label ?? "",
      hasNext: !!next,
      stale,
      staleLine: `${deal.days} days since anyone logged anything. Lee's rule is seven.`,
      facts: [
        { k: "Contact", v: `${deal.contact} · ${deal.phone}` },
        { k: "Trade", v: deal.trade },
        { k: "Deal value", v: deal.value ? money(deal.value) : "Not set" },
        { k: "Stage", v: `${stageOf(deal.stage).label} — ${stageOf(deal.stage).meaning}` },
        { k: "Owner", v: deal.owner },
      ],
      activity: activityFor(s, deal.id),
      replyLine: stale
        ? `**${deal.company}** — ${stageOf(deal.stage).label}, and it's gone quiet for ${deal.days} days. Here's everything on it.`
        : `**${deal.company}** — ${stageOf(deal.stage).label}. Here's everything on it.`,
    };
  },
};

// ── 3 · Capture a lead from the conversation ────────────────────────────
const LEAD: AppDescriptor = {
  id: "crm.lead.capture",
  title: "New lead",
  subtitle: "{{ statusLine }}",
  icon: "person",
  triggers: ["log a call", "add a lead", "new lead", "log this call", "i called"],
  reply:
    "Got it — **Summit Mechanical**, Dee Kowalski. I pulled the details out of what you said. Pick an owner and I'll put it in the pipeline as Called.",
  inline: [
    { type: "figures", items: [
      { label: "Read", value: "$.read" },
      { label: "Inferred", value: "$.inferred" },
      { label: "Needs you", value: "$.missing", warnWhenSet: true },
    ] },
  ],
  canvas: [
    { type: "notice", when: "created", tone: "good",
      text: "Created — Summit Mechanical is on the board in Called." },
    { type: "fields", label: "What I heard", tone: "read", items: [
      { label: "Company", value: "Summit Mechanical", required: true },
      { label: "Contact", value: "Dee Kowalski", required: true },
      { label: "Phone", value: "(206) 555-0198", required: true },
      { label: "Trade", value: "HVAC", source: "from “heating and air”" },
    ] },
    { type: "fields", label: "What I worked out — check these", tone: "inferred", items: [
      { label: "Deal value", value: "$5,200", source: "guessed from their van count" },
      { label: "Next step", value: "Call back Thursday", source: "from “ring me Thursday”" },
    ] },
    { type: "fields", label: "Only you can answer this", tone: "needs", items: [
      { label: "Owner", required: true, value: "$.owner",
        choose: { from: "owners", placeholder: "Who's taking it?",
          op: { kind: "tool", op: "assignOwner" } } },
    ] },
  ],
  actions: [
    { label: "Discard", when: "notCreated" },
    { label: "Add to pipeline", primary: true, when: "notCreated", enabledWhen: "ready",
      do: { kind: "tool", op: "createLead" } },
    { label: "Open the board", primary: true, when: "created",
      do: { kind: "open", app: "crm.pipeline" } },
  ],
  footNote: "{{ footLine }}",
  data: (s) => {
    const { owner, created } = s.lead;
    return {
      read: 4, inferred: 2, missing: owner ? 0 : 1,
      owners: OWNERS,
      owner: owner ?? "",
      ready: !!owner,
      created,
      notCreated: !created,
      statusLine: created ? "Added to the pipeline" : "Nothing is saved until you add it",
      footLine: created
        ? "Logged as a call against the new deal."
        : owner
          ? "Ready to add."
          : "Pick an owner first",
    };
  },
};

// ── 4 · The same board, different work ──────────────────────────────────
// Proof the board isn't a sales screen: identical block, different rows. For a
// trades customer this is the other half of their week — the jobs themselves.
const JOBS = [
  { id: "j1", company: "Unit 4, Marlow Court", contact: "Boiler swap",
    state: "scheduled", value: 1850, crew: "Team A", days: 0 },
  { id: "j2", company: "Fairview Dental", contact: "Backflow test",
    state: "scheduled", value: 420, crew: "Team B", days: 0 },
  { id: "j3", company: "Rowan Street flats", contact: "Riser replacement",
    state: "progress", value: 7400, crew: "Team A", days: 0 },
  { id: "j4", company: "Kestrel Bakery", contact: "Grease trap",
    state: "invoiced", value: 980, crew: "Team B", days: 12 },
  { id: "j5", company: "Halcyon Gym", contact: "Shower block refit",
    state: "paid", value: 5600, crew: "Team A", days: 0 },
];

const JOBS_APP: AppDescriptor = {
  id: "ops.jobs",
  title: "Jobs this week",
  subtitle: "{{ count }} jobs · the same board, pointed at the work",
  icon: "wrench",
  triggers: ["show me the jobs", "the jobs board", "jobs this week", "show the jobs"],
  reply:
    "**{{ count }} jobs** on this week, {{ valueLabel }} of work. Kestrel Bakery has been invoiced 12 days with no payment. This is the same board as your pipeline — different rows.",
  inline: [
    { type: "figures", items: [
      { label: "Jobs", value: "$.count" },
      { label: "Value", value: "$.value", format: "currency.usd" },
      { label: "Unpaid", value: "$.overdue", warnWhenSet: true },
    ] },
  ],
  canvas: [
    { type: "board",
      data: "$.jobs",
      groupBy: "state",
      columnSets: {
        state: [
          { value: "scheduled", label: "Scheduled", meta: "booked in" },
          { value: "progress", label: "In progress", meta: "on site" },
          { value: "invoiced", label: "Invoiced", meta: "awaiting payment" },
          { value: "paid", label: "Paid", meta: "done" },
        ],
        crew: [
          { value: "Team A", label: "Team A", meta: "three vans" },
          { value: "Team B", label: "Team B", meta: "two vans" },
        ],
      },
      rankBy: { field: "value", direction: "desc" },
      card: {
        title: "{{ company }}",
        subtitle: "{{ contact }}",
        value: { field: "value", format: "currency.usd" },
        chips: ["{{ crew }}"],
      },
      flag: { field: "days", over: 7, chip: "{{ days }} days unpaid" },
      emptyLabel: "Nothing here",
    },
  ],
  actions: [{ label: "Group by crew", do: { kind: "rebind", groupBy: "crew" } }],
  footNote: "Same board block as the pipeline — no new code, just different rows.",
  data: () => ({
    count: JOBS.length,
    value: JOBS.reduce((n, j) => n + j.value, 0),
    valueLabel: `$${JOBS.reduce((n, j) => n + j.value, 0).toLocaleString("en-US")}`,
    overdue: JOBS.filter((j) => j.days > 7).length,
    jobs: JOBS,
  }),
};

export const MCP_APPS: AppDescriptor[] = [PIPELINE, DEAL, LEAD, JOBS_APP];

export const getApp = (id?: string) => MCP_APPS.find((a) => a.id === id);

/** Longest trigger wins, so "show me the pipeline" beats "pipeline". */
export function matchApp(text: string): AppDescriptor | null {
  const t = text.trim().toLowerCase().replace(/[?.!]+$/, "");
  let best: { app: AppDescriptor; len: number } | null = null;
  for (const app of MCP_APPS) {
    for (const phrase of app.triggers) {
      if (t === phrase || t === `run ${phrase}` || t.includes(phrase)) {
        if (!best || phrase.length > best.len) best = { app, len: phrase.length };
      }
    }
  }
  return best?.app ?? null;
}
