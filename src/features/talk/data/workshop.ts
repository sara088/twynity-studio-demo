import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Mail,
  CalendarDays,
  Search,
  NotebookPen,
  Inbox,
  Sparkles,
  MessageCircle,
  BarChart3,
  FileCode2,
  Database,
  Send,
  Presentation,
  ListChecks,
  FlaskConical,
  Users,
  Handshake,
  BookOpen,
  HardDrive,
  Workflow,
} from "lucide-react";

import type { PurchasedItem } from "@/features/shared/lib/purchases";

export type WorkshopTab =
  | "capabilities"
  | "skills"
  | "interconnectors"
  | "knowledge"
  | "workflows";

/** Where an owned asset came from. */
export type Provenance = "free" | "built" | "purchased" | "imported";

// A workflow is a multi-step job a twyn can run. It's not built here — it's built
// on an external platform (or bought) and equipped like any other asset. Each step
// is either a tool call (tool-level), a handoff to another twyn (people-level), an
// approval the user must clear, or the artifact the run produces.
export type WorkflowStepKind = "tool" | "handoff" | "approval" | "artifact";

export interface WorkflowStep {
  kind: WorkflowStepKind;
  label: string;
  meta?: string;
  /** For a handoff: the teammate twyn that runs this step (people-level). */
  actor?: string;
}

// How much a source lets us SEE of a run — this dictates the side panel:
//  • live   — agentic / MCP-native / A2A: streamed steps, tool calls, twyn
//             handoffs, approval events (LangFlow/LangGraph, UiPath Maestro, our
//             own twyn tools).
//  • polled — n8n / Make / Power Automate: real step list + per-step status, but
//             poll-after-the-fact, no push, no people-level handoffs.
//  • status — Zapier / classic UiPath RPA: no readable step graph; only
//             job-level running → done/failed + the output.
export type RunFidelity = "live" | "polled" | "status";

export interface WorkflowDef {
  /** How it got here — shapes the "powered by" line and the run fidelity.
   *  "twynity" = built here in the Twynity Workflow Builder (our own engine, so
   *  we see every step live). Everything else came from outside. */
  source: "twynity" | "imported" | "marketplace" | "captured";
  /** External platform it was built on (imported), e.g. "n8n". */
  platform?: string;
  /** What the source lets us visualize — drives which run panel we render. */
  fidelity: RunFidelity;
  steps: WorkflowStep[];
  /** Artifact id the run produces — ties the run board to the Canvas document. */
  produces?: string;
  /** Natural-language trigger phrase — say this (or the /slash) to run it. The
   *  user can change it ("teach your twyn a word"); this is the default. */
  trigger?: string;
  /** Connections this workflow needs — bound per twyn (each twyn connects its own
   *  accounts), shown as "Needs:" and connected from the twyn's edit page. */
  requires?: string[];
  /** Runs on sample data (nothing real is touched) — shown as an "Example run"
   *  so onboarding is honest before a user has connected/populated everything. */
  demo?: boolean;
}

export interface WorkshopItem {
  id: string;
  name: string;
  description: string;
  tab: WorkshopTab;
  icon: LucideIcon;
  /** Brand logo to render in place of the lucide icon (interconnectors) */
  logo?: "gmail" | "azure";
  /** Pre-equipped (added) on initial load */
  defaultEquipped?: boolean;
  /** free (included) · built (made in the workshop) · purchased (marketplace) */
  provenance?: Provenance;
  /** For a workflow asset — the run definition (steps, source). */
  workflow?: WorkflowDef;
}

// The workshop mirrors the edit-twyn loadout so a twyn reads the same in both
// places: 10 capabilities (6 equipped), 10 skills (4), 5 knowledge docs (3),
// 2 interconnectors (added by default, connected via OAuth). Ids are namespaced
// per tab to stay unique across this flat catalog (getItem looks up by id).
export const WORKSHOP_CATALOG: WorkshopItem[] = [
  // Capabilities (10)
  { id: "summarize", name: "Summarize long docs", description: "Compress 50+ pages into a 1-page brief.", tab: "capabilities", icon: FileText, defaultEquipped: true },
  { id: "draft", name: "Draft outreach & replies", description: "Write in your voice. You approve before send.", tab: "capabilities", icon: Mail, defaultEquipped: true },
  { id: "schedule", name: "Schedule across timezones", description: "Coordinate without email tennis.", tab: "capabilities", icon: CalendarDays, defaultEquipped: true },
  { id: "research", name: "Run quick research", description: "Pull credible sources. No hallucinations.", tab: "capabilities", icon: Search, defaultEquipped: true },
  { id: "meeting-notes", name: "Meeting notes", description: "Transcribe and summarize after the call.", tab: "capabilities", icon: NotebookPen },
  { id: "email-triage", name: "Email & inbox triage", description: "Sort, label, draft replies on your behalf.", tab: "capabilities", icon: Inbox },
  { id: "synthesize", name: "Pattern synthesis", description: "Turn 20+ transcripts into clean themes.", tab: "capabilities", icon: Sparkles, defaultEquipped: true },
  { id: "customer-discovery", name: "Customer discovery", description: "Run user interviews, surface real problems.", tab: "capabilities", icon: MessageCircle, defaultEquipped: true },
  { id: "data-storytelling", name: "Data storytelling", description: "Turn dashboards into narratives.", tab: "capabilities", icon: BarChart3 },
  { id: "tech-writing", name: "Tech writing", description: "Specs, RFCs, and clear docs.", tab: "capabilities", icon: FileCode2 },

  // Skills (10)
  { id: "skill-sql-query", name: "SQL Querying", description: "Pulls clean, structured answers from any database.", tab: "skills", icon: Database, defaultEquipped: true },
  { id: "skill-cold-outreach", name: "Cold Outreach", description: "Writes messages that get opened and replied to.", tab: "skills", icon: Send, defaultEquipped: true },
  { id: "skill-pitch-deck", name: "Pitch Deck Design", description: "Builds decks that make investors lean forward.", tab: "skills", icon: Presentation },
  { id: "skill-sprint-planning", name: "Sprint Planning", description: "Scopes and sequences work so teams ship.", tab: "skills", icon: ListChecks, defaultEquipped: true },
  { id: "skill-prompt-eng", name: "Prompt Engineering", description: "Extracts precise outputs from AI tools.", tab: "skills", icon: Sparkles, defaultEquipped: true },
  { id: "skill-ab-testing", name: "A/B Testing", description: "Designs experiments and reads significance.", tab: "skills", icon: FlaskConical },
  { id: "skill-stakeholder", name: "Stakeholder Alignment", description: "Keeps the right people moving together.", tab: "skills", icon: Users },
  { id: "skill-customer-discovery", name: "Customer Discovery", description: "Runs interviews that surface real problems.", tab: "skills", icon: Search },
  { id: "skill-data-viz", name: "Data Visualization", description: "Picks the right chart for the story.", tab: "skills", icon: BarChart3 },
  { id: "skill-negotiation", name: "Negotiation", description: "Reads the room and closes without burning bridges.", tab: "skills", icon: Handshake },

  // Interconnectors (2) — added by default, connected via OAuth
  { id: "tool-gmail", name: "Gmail", description: "Email reading, drafting, triage.", tab: "interconnectors", icon: Mail, logo: "gmail", defaultEquipped: true },
  { id: "tool-azure", name: "Microsoft Azure", description: "Outlook, Teams, OneDrive, SharePoint.", tab: "interconnectors", icon: HardDrive, logo: "azure", defaultEquipped: true },

  // Knowledge (5)
  { id: "k-brand-voice", name: "Brand voice guide", description: "Tone, vocabulary, and style rules.", tab: "knowledge", icon: BookOpen, defaultEquipped: true },
  { id: "k-q3-board", name: "Q3 board pre-read", description: "Pipeline, retention, EU launch prep.", tab: "knowledge", icon: FileText, defaultEquipped: true },
  { id: "k-product-roadmap", name: "Product roadmap 2026", description: "Q2–Q4 feature plan, priorities.", tab: "knowledge", icon: FileText },
  { id: "k-sales-playbook", name: "Sales playbook", description: "Objection handling, demo scripts.", tab: "knowledge", icon: FileText, defaultEquipped: true },
  { id: "k-interview-transcripts", name: "User interview transcripts", description: "14 transcripts from Q1 discovery.", tab: "knowledge", icon: FileText },

  // Workflows (3) — general knowledge-worker jobs, equipped like a skill. The twyn
  // runs them in conversation; the run visualizes in the Canvas. Morning Brief is
  // wired end-to-end and is the one the guided tour runs (as a sample). `demo`
  // marks a run that uses sample data — honest for onboarding, before a user has
  // actually connected/populated everything.
  {
    id: "wf-morning-brief",
    name: "Morning Brief",
    description: "Scan your inbox and calendar, flag what needs you, draft replies.",
    tab: "workflows",
    icon: Workflow,
    defaultEquipped: true,
    workflow: {
      // The twyn's own MCP tools → we see everything (live board). Solo — the
      // people-level handoff is shown by Meeting Prep.
      source: "captured",
      fidelity: "live",
      produces: "morning-brief",
      trigger: "morning brief",
      requires: ["Gmail", "Calendar"],
      demo: true,
      steps: [
        { kind: "tool", label: "Scan your inbox", meta: "gmail · 12 new" },
        { kind: "tool", label: "Check today's calendar", meta: "outlook · 4 meetings" },
        { kind: "tool", label: "Flag what needs a reply", meta: "2 urgent" },
        { kind: "tool", label: "Draft the replies", meta: "in your voice" },
        { kind: "approval", label: "Send the 2 replies?", meta: "you approve before anything sends" },
        { kind: "tool", label: "Compile your brief", meta: "inbox · calendar · to-dos" },
        { kind: "artifact", label: "Your morning brief", meta: "ready" },
      ],
    },
  },
  {
    id: "wf-meeting-prep",
    name: "Meeting Prep",
    description: "Before your next meeting: the thread, the people, the last notes.",
    tab: "workflows",
    icon: Workflow,
    workflow: {
      // Agentic marketplace pack → live board, and it hands off to another twyn
      // (people-level), which only agentic sources can expose.
      source: "marketplace",
      fidelity: "live",
      trigger: "prep my next meeting",
      requires: ["Calendar", "Gmail", "Notion"],
      demo: true,
      steps: [
        { kind: "tool", label: "Find your next meeting", meta: "calendar · in 30 min" },
        { kind: "tool", label: "Pull the email thread", meta: "8 messages" },
        { kind: "handoff", label: "Get last call's notes from Nana", meta: "notetaker twyn", actor: "Nana" },
        { kind: "approval", label: "Share the prep doc with attendees?", meta: "you approve before send" },
        { kind: "artifact", label: "Meeting prep", meta: "brief + talking points" },
      ],
    },
  },
  {
    id: "wf-inbox-triage",
    name: "Inbox Triage",
    description: "Sort new mail, label it, and draft replies to the ones that matter.",
    tab: "workflows",
    icon: Workflow,
    workflow: {
      // Imported n8n → we can read the steps and poll their status, but no push
      // stream and no twyn handoffs (polled board).
      source: "imported",
      platform: "n8n",
      fidelity: "polled",
      trigger: "triage my inbox",
      requires: ["Gmail"],
      demo: true,
      steps: [
        { kind: "tool", label: "Read new mail", meta: "gmail · last 24h" },
        { kind: "tool", label: "Sort & label", meta: "by topic + priority" },
        { kind: "approval", label: "Archive the low-priority ones?", meta: "you approve" },
        { kind: "tool", label: "Draft replies to what matters", meta: "in your voice" },
        { kind: "artifact", label: "Triage summary", meta: "18 sorted · 3 need you" },
      ],
    },
  },
  {
    id: "wf-expense-approvals",
    name: "Expense Approvals",
    description: "Route new expense reports to the right approver and chase sign-off.",
    tab: "workflows",
    icon: Workflow,
    workflow: {
      // Imported Zapier → no readable step graph and no public run API. We can only
      // show job-level status + the result (status card).
      source: "imported",
      platform: "Zapier",
      fidelity: "status",
      trigger: "run expense approvals",
      requires: ["Slack"],
      demo: true,
      steps: [
        { kind: "tool", label: "Run the Zap", meta: "expense-approvals" },
        { kind: "artifact", label: "Approvals routed", meta: "7 sent · 2 auto-approved" },
      ],
    },
  },
];

export const TAB_LABELS: Record<WorkshopTab, string> = {
  capabilities: "Capabilities",
  skills: "Skills",
  interconnectors: "Interconnectors",
  knowledge: "Knowledge",
  workflows: "Workflows",
};

// Tabs shown in the Equip panel, in order. Capabilities are folded into Starter
// Packs in the marketplace, so they're no longer a standalone equip category.
// Workflows lead — they're the multi-step jobs a twyn runs.
export const TAB_ORDER: WorkshopTab[] = ["workflows", "interconnectors", "skills", "knowledge"];

export const TAB_SLOT_LABEL: Record<WorkshopTab, string> = {
  capabilities: "CAPABILITIES",
  skills: "SKILLS",
  interconnectors: "INTERCONNECTORS",
  knowledge: "KNOWLEDGE",
  workflows: "WORKFLOWS",
};

// Slots available per category — mirrors the edit-twyn loadout.
export const TAB_MAX: Record<WorkshopTab, number> = {
  capabilities: 6,
  skills: 8,
  interconnectors: 8,
  knowledge: 10,
  workflows: 6,
};

export const DEFAULT_EQUIPPED = WORKSHOP_CATALOG.filter(
  (i) => i.defaultEquipped
).map((i) => i.id);

export function getItem(id: string) {
  return WORKSHOP_CATALOG.find((i) => i.id === id);
}

/** The run definition for an equipped workflow, by id. */
export function getWorkflow(id: string | undefined): WorkflowDef | undefined {
  if (!id) return undefined;
  return WORKSHOP_CATALOG.find((i) => i.id === id)?.workflow;
}

/** The /slash command for a workflow, derived from its name (e.g. "/morning-brief"). */
export function slashFor(name: string): string {
  return "/" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// The full set of assets a twyn owns: the base catalog (free defaults + built)
// plus anything purchased for it on the marketplace. One source of truth for
// the studio Equip panel and the slot bar.
export function buildOwnedCatalog(purchases: PurchasedItem[]): WorkshopItem[] {
  const base: WorkshopItem[] = WORKSHOP_CATALOG.map((i) => ({
    ...i,
    provenance: i.defaultEquipped ? "free" : "built",
  }));
  const baseIds = new Set(base.map((b) => b.id));
  const purchased: WorkshopItem[] = purchases
    // Packs aren't a workshop tab — they fan out into their component assets,
    // which arrive as their own purchases.
    .filter((p) => !baseIds.has(p.id) && p.type !== "packs")
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      tab: p.type as WorkshopTab,
      icon: Sparkles,
      provenance: "purchased",
    }));
  return [...base, ...purchased];
}
