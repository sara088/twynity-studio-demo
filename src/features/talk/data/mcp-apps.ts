// ─────────────────────────────────────────────────────────────────────────
// MCP apps — described, not built.
//
// A server returns two things: its rows (the tool result) and a *description*
// of how to show them. Twynity renders the description with its own components,
// so an app is native by construction — it never ships styling of its own.
//
// Two rules this file keeps:
//   1. `blocks` are static. Only `data()` changes between calls — exactly like
//      a real MCP tool returning fresh structuredContent each invocation.
//   2. Interaction is declared, never coded. An action carries an *intent*
//      ("advance this deal"); TalkView decides what that means. No app here
//      knows about React state, the Canvas, or the chat thread.
//
// Adding a fifth app means adding a descriptor below. Nothing else.
// ─────────────────────────────────────────────────────────────────────────

import {
  OWNERS, STAGES, gateReady, isRotten, nextStage, pipelineTotals, rotLimit,
  stageOf, type CrmState,
} from "../lib/crm-store";

/** "$.path" reads the tool result; "{{ field }}" interpolates a row. */
export type Binding = string;

/** What a control asks the host to do. The renderer never performs these. */
export type Intent =
  | { kind: "rebind"; groupBy: string }
  | { kind: "open"; app: string; deal?: string }
  | {
      kind: "tool";
      op:
        | "approveDraft" | "logInteraction" | "satisfy" | "advance"
        | "resolveDuplicate" | "assignOwner" | "createLead" | "convertLead"
        | "reset";
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
        /** Column sets, keyed by the groupBy field currently in play. */
        columnSets: Record<string, { value: string; label: string; meta?: Binding }[]>;
        rankBy: { field: string; direction?: "asc" | "desc" };
        card: CardSpec;
        flag?: { field: string; overField: string; chip: Binding };
        onCardClick?: Intent;
        emptyLabel?: string;
      }
    | { type: "fields"; label?: string; tone?: "read" | "inferred" | "needs"; items: FieldSpec[] }
    | { type: "criteria"; label?: string; data: string; action?: ActionSpec }
    | { type: "notice"; tone: "good" | "warn"; text: Binding; actions?: ActionSpec[] }
    | { type: "draft"; label: string; body: Binding; meta?: Binding }
  );

export interface AppDescriptor {
  id: string;
  /** May interpolate from data, e.g. "{{ from }} → {{ to }}". */
  title: Binding;
  subtitle?: Binding;
  icon: "board" | "person" | "check";
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

// ── 1 · Show me the pipeline ────────────────────────────────────────────
const STAGE_COLUMNS = STAGES.map((s) => ({
  value: s.value,
  label: s.label,
  meta: `${s.probability}%`,
}));

const LINE_COLUMNS = [
  { value: "EAIW", label: "EAIW", meta: "Enterprise AI Workforce" },
  { value: "AISC", label: "AISC", meta: "AI Strategy & Consulting" },
  { value: "ITWC", label: "ITWC", meta: "Individual Twyn Creation" },
  { value: "TADS", label: "TADS", meta: "Teams & Dev Services" },
];

const PIPELINE: AppDescriptor = {
  id: "crm.pipeline",
  title: "Pipeline",
  subtitle: "{{ open }} open · {{ totalLabel }} · click a card to work it",
  icon: "board",
  triggers: ["show me the pipeline", "show the pipeline", "the pipeline", "pipeline"],
  reply:
    "**{{ totalLabel }}** across {{ open }} open deals. {{ flaggedLine }}",
  inline: [
    { type: "figures", items: [
      { label: "Open", value: "$.total", format: "currency.usd" },
      { label: "Weighted", value: "$.weighted", format: "currency.usd" },
      { label: "Flagged", value: "$.flagged", warnWhenSet: true },
    ] },
  ],
  canvas: [
    { type: "board",
      data: "$.deals",
      groupBy: "stage",
      columnSets: { stage: STAGE_COLUMNS, line: LINE_COLUMNS },
      rankBy: { field: "value", direction: "desc" },
      card: {
        title: "{{ name }}",
        subtitle: "{{ account }}",
        value: { field: "value", format: "currency.usd", emptyLabel: "No value yet" },
        chips: ["{{ line }}", "{{ days }}d"],
      },
      flag: { field: "days", overField: "rot", chip: "{{ days }}d · limit {{ rot }}" },
      onCardClick: { kind: "open", app: "crm.stage.gate" },
      emptyLabel: "Nothing here",
    },
  ],
  actions: [
    { label: "Group by service line", do: { kind: "rebind", groupBy: "line" } },
    { label: "Work {{ topFlagName }}", primary: true, when: "flagged",
      do: { kind: "open", app: "crm.stage.gate", deal: "$.topFlagId" } },
  ],
  footNote: "Read from Frappe CRM · just now",
  data: (s) => {
    const totals = pipelineTotals(s.deals);
    const flaggedDeals = s.deals.filter(isRotten);
    const top = flaggedDeals[0];
    return {
      ...totals,
      totalLabel: money(totals.total),
      deals: s.deals.map((d) => ({ ...d, rot: rotLimit(d) })),
      topFlagId: top?.id ?? "",
      topFlagName: top ? top.account.split(" ")[0] : "",
      flaggedLine: top
        ? `${top.account.split(" ")[0]} is the one to look at — ${top.days} days in ${stageOf(top.stage).label}, against the ${top.line} limit of ${rotLimit(top)}.`
        : "Nothing is past its stage-rot limit.",
    };
  },
};

// ── 2 · Enter a lead ────────────────────────────────────────────────────
const LEAD: AppDescriptor = {
  id: "crm.lead.capture",
  title: "New lead",
  subtitle: "{{ statusLine }}",
  icon: "person",
  triggers: ["add a lead", "new lead", "enter a lead", "capture a lead", "create a lead"],
  reply:
    "Got ten of fourteen fields. One required field still needs you, and there's a near-match on the account — **Ashanti Gold Ltd** already exists. Same company or a different one?",
  inline: [
    { type: "figures", items: [
      { label: "Read", value: "$.read" },
      { label: "Inferred", value: "$.inferred" },
      { label: "Needs you", value: "$.missing", warnWhenSet: true },
    ] },
  ],
  canvas: [
    { type: "notice", when: "duplicateOpen", tone: "good",
      text: "Ashanti Gold Ltd already exists as an account — 1 closed-won deal, last touched March 2025. Link this lead to it, or create a separate company?",
      actions: [
        { label: "Link to existing",
          do: { kind: "tool", op: "resolveDuplicate", value: "linked" } },
        { label: "Separate company",
          do: { kind: "tool", op: "resolveDuplicate", value: "separate" } },
      ] },
    { type: "notice", when: "duplicateResolved", tone: "good", text: "{{ duplicateLabel }}" },
    { type: "notice", when: "converted", tone: "good",
      text: "Converted — the opportunity is on your board in Identified." },
    { type: "fields", label: "What I read from your message", tone: "read", items: [
      { label: "First name", value: "Kofi", required: true },
      { label: "Last name", value: "Mensah", required: true },
      { label: "Email", value: "kofi.mensah@ashantigold.com", required: true },
      { label: "Phone", value: "+233 24 118 4471" },
      { label: "Job title", value: "Head of Digital Transformation" },
      { label: "Company", value: "{{ company }}", required: true },
      { label: "Lead source", value: "Conference", required: true,
        source: "from “Africa AI Summit”" },
    ] },
    { type: "fields", label: "What I inferred — check these", tone: "inferred", items: [
      { label: "Country", value: "Ghana", required: true,
        source: "guessed from the +233 dialling code" },
      { label: "Industry", value: "Industrial & Manufacturing",
        source: "guessed from the company name" },
      { label: "Service interest", value: "EAIW — Enterprise AI Workforce",
        source: "guessed from “document processing”" },
    ] },
    { type: "fields", label: "Only you can answer these", tone: "needs", items: [
      { label: "Assigned to", required: true, value: "$.owner",
        choose: { from: "owners", placeholder: "Choose an owner…",
          op: { kind: "tool", op: "assignOwner" } } },
      { label: "Company size", optional: true },
      { label: "AI maturity", optional: true },
      { label: "Status", value: "{{ status }}" },
    ] },
  ],
  actions: [
    { label: "Edit fields", when: "notCreated" },
    { label: "Create lead", primary: true, when: "notCreated", enabledWhen: "ready",
      do: { kind: "tool", op: "createLead" } },
    { label: "Convert to opportunity", primary: true, when: "canConvert",
      do: { kind: "tool", op: "convertLead" } },
  ],
  footNote: "{{ footLine }}",
  data: (s) => {
    const { owner, duplicate, created, converted } = s.lead;
    const ready = !!owner;
    return {
      read: 7, inferred: 3, missing: owner ? 0 : 1,
      owners: OWNERS,
      owner: owner ?? "",
      ready,
      notCreated: !created,
      canConvert: created && !converted,
      converted,
      duplicateOpen: duplicate === "unresolved",
      duplicateResolved: duplicate !== "unresolved",
      duplicateLabel:
        duplicate === "linked"
          ? "Linked to the existing Ashanti Gold Ltd account."
          : "Creating Ashanti Gold Refinery as a separate company.",
      company: duplicate === "linked" ? "Ashanti Gold Ltd" : "Ashanti Gold Refinery",
      status: created ? "Qualified" : "New",
      statusLine: created
        ? "Lead created in Frappe"
        : "Nothing is written to Frappe until you create it",
      footLine: created
        ? converted
          ? "Opportunity created at Stage 1 — Identified."
          : "Lead created. Converting makes an Account, a Contact and an Opportunity."
        : ready
          ? "Ready to create."
          : "1 required field outstanding",
    };
  },
};

// ── 3 · Move an opportunity ─────────────────────────────────────────────
const GATE: AppDescriptor = {
  id: "crm.stage.gate",
  title: "{{ from }} → {{ to }}",
  subtitle: "{{ dealLine }}",
  icon: "check",
  triggers: [
    "move techvision to discovery", "move techvision", "advance techvision",
    "move an opportunity", "advance the deal", "move the deal",
  ],
  reply: "{{ replyLine }}",
  inline: [
    { type: "figures", items: [
      { label: "Met", value: "$.met" },
      { label: "Drafted", value: "$.drafted" },
      { label: "Needs you", value: "$.blocked", warnWhenSet: true },
    ] },
  ],
  canvas: [
    { type: "notice", when: "rotten", tone: "warn", text: "{{ rotLine }}" },
    { type: "notice", when: "ready", tone: "good",
      text: "All criteria are met. This deal can advance." },
    { type: "criteria", label: "Exit criteria — {{ from }}", data: "$.criteria",
      action: { label: "Log the call",
        do: { kind: "tool", op: "logInteraction", deal: "$.dealId" } } },
    { type: "draft", when: "hasDraft", label: "Drafted — timeline driver",
      body: "$.draft.body", meta: "$.draft.meta" },
  ],
  actions: [
    { label: "Approve the draft", when: "hasDraft",
      do: { kind: "tool", op: "approveDraft", deal: "$.dealId" } },
    { label: "Advance to {{ to }}", primary: true, enabledWhen: "ready",
      do: { kind: "tool", op: "advance", deal: "$.dealId" } },
  ],
  footNote: "{{ footLine }}",
  data: (s, params) => {
    const dealId = params?.deal ?? "d-techvision";
    const deal = s.deals.find((d) => d.id === dealId) ?? s.deals[0];
    const criteria = s.criteria[deal.id] ?? [];
    const ready = gateReady(criteria);
    const next = nextStage(deal);
    const draft = s.drafts[deal.id];
    const hasDraft = !!draft && criteria.some((c) => c.state === "drafted");
    const blocked = criteria.filter((c) => c.state === "todo").length;
    const drafted = criteria.filter((c) => c.state === "drafted").length;
    return {
      dealId: deal.id,
      criteria,
      met: criteria.filter((c) => c.state === "done").length,
      drafted, blocked,
      from: stageOf(deal.stage).label,
      to: next?.label ?? "Closed",
      dealLine: `${deal.account} — ${deal.name} · ${deal.line}${deal.value ? ` · ${money(deal.value)}` : ""}`,
      ready,
      hasDraft,
      draft: draft ?? { body: "", meta: "" },
      rotten: isRotten(deal),
      rotLine: `${deal.days} days in ${stageOf(deal.stage).label}. The ${deal.line} limit is ${rotLimit(deal)} days, so this deal is already on the manager's exception list.`,
      replyLine: ready
        ? `The ${stageOf(deal.stage).label} gate is clear — ${deal.account.split(" ")[0]} can move to ${next?.label ?? "close"}.`
        : `Not yet — the ${stageOf(deal.stage).label} gate needs ${criteria.length} criteria and ${blocked + drafted} ${blocked + drafted === 1 ? "is" : "are"} open. I filled what I could find in your call logs. **The rest needs you.**`,
      footLine: ready
        ? "Every criterion is met."
        : `Advancement stays blocked until all ${criteria.length} clear.`,
    };
  },
};

// ── 4 · The same board, different work ──────────────────────────────────
// Proof the board isn't a sales screen: identical block, different rows.
const SPRINT_ITEMS = [
  { id: "w1", name: "Frappe CRM MCP — read tools", owner: "Nathan", state: "todo",
    points: 8, area: "Backend", blockedDays: 0, blockLimit: 3 },
  { id: "w2", name: "Canvas board renderer", owner: "Unassigned", state: "todo",
    points: 5, area: "Frontend", blockedDays: 0, blockLimit: 3 },
  { id: "w3", name: "Lead capture extraction", owner: "Magnus", state: "doing",
    points: 8, area: "Backend", blockedDays: 4, blockLimit: 3 },
  { id: "w4", name: "Stage gate rules seed", owner: "Nana", state: "doing",
    points: 5, area: "Config", blockedDays: 0, blockLimit: 3 },
  { id: "w5", name: "Maps MCP canvas handoff", owner: "Nana", state: "review",
    points: 3, area: "Frontend", blockedDays: 0, blockLimit: 3 },
  { id: "w6", name: "Graphs MCP candlestick", owner: "Nana", state: "done",
    points: 8, area: "Frontend", blockedDays: 0, blockLimit: 3 },
];

const SPRINT: AppDescriptor = {
  id: "azure.sprint",
  title: "Sprint 12",
  subtitle: "{{ open }} items · same board block as your pipeline",
  icon: "board",
  triggers: ["show me the sprint", "the sprint board", "sprint board", "show the sprint"],
  reply:
    "Sprint 12 — **{{ open }} items, {{ points }} points**. One is blocked: lead capture extraction, four days now. Same board block as your pipeline, pointed at Azure.",
  inline: [
    { type: "figures", items: [
      { label: "Items", value: "$.open" },
      { label: "Points", value: "$.points" },
      { label: "Blocked", value: "$.flagged", warnWhenSet: true },
    ] },
  ],
  canvas: [
    { type: "board",
      data: "$.workItems",
      groupBy: "state",
      columnSets: {
        state: [
          { value: "todo", label: "To do", meta: "not started" },
          { value: "doing", label: "In progress", meta: "active" },
          { value: "review", label: "In review", meta: "awaiting" },
          { value: "done", label: "Done", meta: "closed" },
        ],
        owner: [
          { value: "Nathan", label: "Nathan", meta: "backend" },
          { value: "Magnus", label: "Magnus", meta: "backend" },
          { value: "Nana", label: "Nana", meta: "frontend" },
          { value: "Unassigned", label: "Unassigned", meta: "—" },
        ],
      },
      rankBy: { field: "points", direction: "desc" },
      card: {
        title: "{{ name }}",
        subtitle: "{{ owner }}",
        value: { field: "points", emptyLabel: "Unpointed" },
        chips: ["{{ area }}"],
      },
      flag: { field: "blockedDays", overField: "blockLimit", chip: "Blocked {{ blockedDays }}d" },
      emptyLabel: "Nothing here",
    },
  ],
  actions: [{ label: "Group by owner", do: { kind: "rebind", groupBy: "owner" } }],
  footNote: "Read from Azure DevOps · just now",
  data: () => ({
    open: SPRINT_ITEMS.length,
    points: SPRINT_ITEMS.reduce((n, w) => n + w.points, 0),
    flagged: SPRINT_ITEMS.filter((w) => w.blockedDays > w.blockLimit).length,
    workItems: SPRINT_ITEMS,
  }),
};

export const MCP_APPS: AppDescriptor[] = [PIPELINE, LEAD, GATE, SPRINT];

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
