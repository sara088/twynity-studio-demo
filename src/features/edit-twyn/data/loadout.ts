import type { ComponentType } from "react";
import {
  FileText,
  Mail,
  CalendarDays,
  Search,
  MessageCircle,
  Sparkles,
  Database,
  Send,
  ListChecks,
  BookOpen,
  NotebookPen,
  Inbox,
  BarChart3,
  FileCode2,
  Presentation,
  FlaskConical,
  Users,
  Handshake,
  Workflow,
} from "lucide-react";

export type LucideIcon = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
export type CatalogItem = { id: string; name: string; desc: string; icon: LucideIcon };

// Capabilities catalog (10). Equipped = the 6 shown on the card.
export const CAPABILITIES: CatalogItem[] = [
  { id: "summarize", name: "Summarize long docs", desc: "Compress 50+ pages into a 1-page brief.", icon: FileText },
  { id: "draft", name: "Draft outreach & replies", desc: "Write in your voice. You approve before send.", icon: Mail },
  { id: "schedule", name: "Schedule across timezones", desc: "Coordinate without email tennis.", icon: CalendarDays },
  { id: "research", name: "Run quick research", desc: "Pull credible sources. No hallucinations.", icon: Search },
  { id: "meeting-notes", name: "Meeting notes", desc: "Transcribe and summarize after the call.", icon: NotebookPen },
  { id: "email-triage", name: "Email & inbox triage", desc: "Sort, label, draft replies on your behalf.", icon: Inbox },
  { id: "synthesize", name: "Pattern synthesis", desc: "Turn 20+ transcripts into clean themes.", icon: Sparkles },
  { id: "customer-discovery", name: "Customer discovery", desc: "Run user interviews, surface real problems.", icon: MessageCircle },
  { id: "data-storytelling", name: "Data storytelling", desc: "Turn dashboards into narratives.", icon: BarChart3 },
  { id: "tech-writing", name: "Tech writing", desc: "Specs, RFCs, and clear docs.", icon: FileCode2 },
];
export const EQUIPPED_CAPABILITIES = ["summarize", "schedule", "draft", "research", "customer-discovery", "synthesize"];

// Skills catalog (10). Equipped = 4.
export const SKILLS: CatalogItem[] = [
  { id: "sql-query", name: "SQL Querying", desc: "Pulls clean, structured answers from any database.", icon: Database },
  { id: "cold-outreach", name: "Cold Outreach", desc: "Writes messages that get opened and replied to.", icon: Send },
  { id: "pitch-deck", name: "Pitch Deck Design", desc: "Builds decks that make investors lean forward.", icon: Presentation },
  { id: "sprint-planning", name: "Sprint Planning", desc: "Scopes and sequences work so teams ship.", icon: ListChecks },
  { id: "prompt-eng", name: "Prompt Engineering", desc: "Extracts precise outputs from AI tools.", icon: Sparkles },
  { id: "ab-testing", name: "A/B Testing", desc: "Designs experiments and reads significance.", icon: FlaskConical },
  { id: "stakeholder", name: "Stakeholder Alignment", desc: "Keeps the right people moving together.", icon: Users },
  { id: "customer-discovery", name: "Customer Discovery", desc: "Runs interviews that surface real problems.", icon: Search },
  { id: "data-viz", name: "Data Visualization", desc: "Picks the right chart for the story.", icon: BarChart3 },
  { id: "negotiation", name: "Negotiation", desc: "Reads the room and closes without burning bridges.", icon: Handshake },
];
export const EQUIPPED_SKILLS = ["sql-query", "cold-outreach", "sprint-planning", "prompt-eng"];

// Knowledge catalog (5). Assigned = 3.
export const KNOWLEDGE: CatalogItem[] = [
  { id: "brand-voice", name: "Brand voice guide", desc: "Tone, vocabulary, and style rules.", icon: BookOpen },
  { id: "q3-board", name: "Q3 board pre-read", desc: "Pipeline, retention, EU launch prep.", icon: FileText },
  { id: "product-roadmap", name: "Product roadmap 2026", desc: "Q2–Q4 feature plan, priorities.", icon: FileText },
  { id: "sales-playbook", name: "Sales playbook", desc: "Objection handling, demo scripts.", icon: FileText },
  { id: "interview-transcripts", name: "User interview transcripts", desc: "14 transcripts from Q1 discovery.", icon: FileText },
];
export const ASSIGNED_KNOWLEDGE = ["brand-voice", "q3-board", "sales-playbook"];

// Workflows catalog (3). Equipped = 1. Multi-step jobs built elsewhere (imported
// / bought) and equipped like a skill — mirrors the studio Equip panel.
// Ids match the studio catalog (workshop.ts) so the edit page can resolve each
// workflow's full definition (steps, source, trigger, required connections).
export const WORKFLOWS: CatalogItem[] = [
  { id: "wf-morning-brief", name: "Morning Brief", desc: "Scan your inbox and calendar, flag what needs you, draft replies.", icon: Workflow },
  { id: "wf-meeting-prep", name: "Meeting Prep", desc: "Before your next meeting: the thread, the people, the last notes.", icon: Workflow },
  { id: "wf-inbox-triage", name: "Inbox Triage", desc: "Sort new mail, label it, and draft replies to the ones that matter.", icon: Workflow },
  { id: "wf-expense-approvals", name: "Expense Approvals", desc: "Route new expense reports to the right approver and chase sign-off.", icon: Workflow },
];
export const EQUIPPED_WORKFLOWS = ["wf-morning-brief"];

// Interconnectors (2, both connected). Brand logos are inlined where rendered.
export const INTERCONNECTORS = [
  { id: "gmail", name: "Gmail", desc: "Email reading, drafting, triage." },
  { id: "azure", name: "Microsoft Azure", desc: "Outlook, Teams, OneDrive, SharePoint." },
];

export function byIds(catalog: CatalogItem[], ids: string[]) {
  return ids.map((id) => catalog.find((c) => c.id === id)).filter(Boolean) as CatalogItem[];
}

// Per-category chip colors (chip surface, border, text). Each loadout category
// reads as a distinct color: violet / indigo / amber / green.
export const CHIP_COLORS: Record<string, string> = {
  capabilities: "bg-violet-light border-violet-mid text-violet",
  skills: "bg-skill-bg border-skill-border text-skill-text",
  interconnectors: "bg-amber border-amber-text/25 text-amber-text",
  knowledge: "bg-mint border-mint-text/25 text-mint-text",
  workflows: "bg-violet-light border-violet-mid text-violet",
};

