import type { ComponentType } from "react";
import {
  Send,
  Sparkles,
  FlaskConical,
  Users,
  Database,
  Presentation,
  ListChecks,
  MessageCircle,
} from "lucide-react";
import type { Industry } from "@/features/shared/data/industries";

export type { Industry };

export type LucideIcon = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  industry: Industry;
  pricePerYear: number;
  /** Handle of the member who built & published this, e.g. "@saragordic". */
  builder: string;
  /** Vetted & approved by 4th-IR — shows the verified badge. */
  verified: boolean;
  icon: LucideIcon;
}

export interface Interconnector {
  id: string;
  name: string;
  description: string;
  logo: string;
  pricePerYear: number;
  industry: Industry;
  /** Handle of the member who built & published this, e.g. "@saragordic". */
  builder: string;
  /** Vetted & approved by 4th-IR — shows the verified badge. */
  verified: boolean;
}

// A pre-packaged bundle of skills and interconnectors that work together to
// achieve a concrete outcome. Components reference the catalogs below by id, so
// the card/modal can resolve name/icon/price and a purchase can fan them out to
// the chosen twyn. `iconColor`/`iconPath` drive the generated gradient artwork.
export interface StarterPack {
  id: string;
  name: string;
  /** One-line "achieves X" outcome statement shown under the title. */
  outcome: string;
  description: string;
  iconColor: string;
  iconPath: string;
  industry: Industry;
  /** Handle of the member/team who published this pack. */
  builder: string;
  /** Vetted & approved by 4th-IR — shows the verified badge. */
  verified: boolean;
  pricePerYear: number;
  /** Free packs (given on join) render as Owned and can't be purchased. */
  owned?: boolean;
  components: {
    skillIds: string[];
    interconnectorIds: string[];
  };
  /** System prerequisites / dependencies surfaced on the detail modal. */
  prerequisites: string[];
}

export interface TwynReview {
  reviewer: string;
  rating: number;
  text: string;
}

export interface TwynPairing {
  name: string;
  description: string;
  portrait?: string;
  initials?: string;
}

export interface CommunityTwyn {
  id: string;
  name: string;
  rating: number;
  by: string;
  level: string;
  responseTime: string;
  description: string;
  portrait: string;
  tags: string[];
  mcps: string[];
  pricePerHour?: number;
  priceMonthly?: string;
  /** Total hires across history */
  hires?: number;
  /** Real-human card details */
  humanRoleLabel?: string;
  humanInitials?: string;
  humanAvailability?: string;
  refusals?: string[];
  capabilities?: string[];
  worksWith?: string[];
  reviews?: TwynReview[];
  pairings?: TwynPairing[];
}


export const SKILLS: SkillItem[] = [
  {
    id: "cold-outreach",
    industry: "Customer Service",
    name: "Cold Outreach",
    description: "Writes messages that get opened, replied to, and convert into meetings.",
    pricePerYear: 4,
    builder: "@mayak",
    verified: true,
    icon: Send,
  },
  {
    id: "prompt-engineering",
    industry: "Technology",
    name: "Prompt Engineering",
    description: "Extracts precise, high-quality outputs from AI tools across workflows.",
    pricePerYear: 4,
    builder: "@chenwei",
    verified: true,
    icon: Sparkles,
  },
  {
    id: "ab-testing",
    industry: "Technology",
    name: "A/B Testing",
    description: "Designs experiments, reads significance, and acts on results without guessing.",
    pricePerYear: 3,
    builder: "@davido",
    verified: false,
    icon: FlaskConical,
  },
  {
    id: "stakeholder-alignment",
    industry: "General",
    name: "Stakeholder Alignment",
    description: "Keeps all the right people informed and moving in the same direction.",
    pricePerYear: 4,
    builder: "@4th-ir",
    verified: true,
    icon: Users,
  },
  {
    id: "sql-querying",
    industry: "Technology",
    name: "SQL Querying",
    description: "Pulls clean, structured answers from any database — fast and reliably.",
    pricePerYear: 3,
    builder: "@chenwei",
    verified: true,
    icon: Database,
  },
  {
    id: "pitch-deck",
    industry: "General",
    name: "Pitch Deck Design",
    description: "Builds decks that tell a clear story and make investors lean forward.",
    pricePerYear: 5,
    builder: "@priyac",
    verified: false,
    icon: Presentation,
  },
  {
    id: "sprint-planning",
    industry: "Technology",
    name: "Sprint Planning",
    description: "Scopes, prioritises, and sequences work so teams ship without surprises.",
    pricePerYear: 3,
    builder: "@4th-ir",
    verified: true,
    icon: ListChecks,
  },
  {
    id: "customer-discovery",
    industry: "Customer Service",
    name: "Customer Discovery",
    description: "Runs interviews that surface real problems, not just what users say they want.",
    pricePerYear: 5,
    builder: "@mayak",
    verified: true,
    icon: MessageCircle,
  },
];

// MCP tools, tagged by industry. Tools without a dedicated brand glyph fall back
// to an industry-tinted monogram in the card.
export const INTERCONNECTORS: Interconnector[] = [
  // Customer Service
  { id: "slack", name: "Slack", description: "Read channels, reply in threads, summarise standups.", logo: "slack", pricePerYear: 2, industry: "Customer Service", builder: "@nanabrown", verified: true },
  { id: "gmail", name: "Gmail", description: "Triage, draft, schedule send — in your voice.", logo: "gmail", pricePerYear: 3, industry: "Customer Service", builder: "@saragordic", verified: true },
  { id: "calendar", name: "Calendar", description: "Find times, book meetings, send agendas automatically.", logo: "calendar", pricePerYear: 4, industry: "Customer Service", builder: "@saragordic", verified: true },
  { id: "hubspot", name: "HubSpot", description: "Sync contacts, log activity, draft sequences from intent.", logo: "hubspot", pricePerYear: 5, industry: "Customer Service", builder: "@marcusl", verified: false },
  { id: "zendesk", name: "Zendesk", description: "Triage tickets, draft replies, track CSAT and SLAs.", logo: "zendesk", pricePerYear: 4, industry: "Customer Service", builder: "@ananyar", verified: true },
  { id: "intercom", name: "Intercom", description: "Answer inbox messages with full customer context.", logo: "intercom", pricePerYear: 4, industry: "Customer Service", builder: "@tomh", verified: false },

  // Technology
  { id: "github", name: "GitHub", description: "Review PRs, draft commits, summarise repo activity.", logo: "github", pricePerYear: 2, industry: "Technology", builder: "@chenwei", verified: true },
  { id: "linear", name: "Linear", description: "Create issues, triage your inbox, summarise cycles.", logo: "linear", pricePerYear: 2, industry: "Technology", builder: "@mayak", verified: false },
  { id: "jira", name: "Jira", description: "Open issues, groom the backlog, summarise sprints.", logo: "jira", pricePerYear: 3, industry: "Technology", builder: "@davido", verified: true },
  { id: "figma", name: "Figma", description: "Pull design context, leave comments, export assets.", logo: "figma", pricePerYear: 3, industry: "Technology", builder: "@priyac", verified: false },
  { id: "notion", name: "Notion", description: "Search pages, draft docs, keep your wiki in sync.", logo: "notion", pricePerYear: 2, industry: "Technology", builder: "@nanabrown", verified: true },
  { id: "drive", name: "Drive", description: "Search files, summarise docs, draft from templates.", logo: "drive", pricePerYear: 3, industry: "Technology", builder: "@saragordic", verified: true },
  { id: "carrot", name: "Carrot", description: "Log hours, fill timesheets, and track time off.", logo: "carrot", pricePerYear: 3, industry: "Technology", builder: "@saragordic", verified: false },
  { id: "gamma", name: "Gamma", description: "Draft and polish presentations and decks.", logo: "gamma", pricePerYear: 3, industry: "Technology", builder: "@nanabrown", verified: true },

  // Finance
  { id: "stripe", name: "Stripe", description: "Reconcile payments, draft invoices, summarise revenue.", logo: "stripe", pricePerYear: 5, industry: "Finance", builder: "@chenwei", verified: true },
  { id: "quickbooks", name: "QuickBooks", description: "Categorise expenses, draft invoices, close the books.", logo: "quickbooks", pricePerYear: 5, industry: "Finance", builder: "@nadiao", verified: false },
  { id: "plaid", name: "Plaid", description: "Link accounts, pull transactions, verify balances.", logo: "plaid", pricePerYear: 4, industry: "Finance", builder: "@davido", verified: false },

  // Healthcare
  { id: "epic", name: "Epic", description: "Chart review, scheduling, and order summaries.", logo: "epic", pricePerYear: 6, industry: "Healthcare", builder: "@4th-ir", verified: true },
  { id: "athena", name: "athenahealth", description: "Patient records, claims, and appointment workflows.", logo: "athena", pricePerYear: 6, industry: "Healthcare", builder: "@marcusl", verified: false },
  { id: "healthie", name: "Healthie", description: "Telehealth notes, intake forms, and care plans.", logo: "healthie", pricePerYear: 5, industry: "Healthcare", builder: "@ananyar", verified: true },
];

// Pre-packaged bundles. The first is the free-on-join loadout (owned), the rest
// are outcome-oriented bundles we have enough assets to ship.
export const STARTER_PACKS: StarterPack[] = [
  {
    id: "free-starter",
    name: "Free Starter Pack",
    outcome: "Everything a new twyn gets on day one.",
    description:
      "The skills and connections every twyn ships with — query data, write outreach, plan sprints, engineer prompts, and stay on top of email and calendar. Included free with your account.",
    iconColor: "#059669",
    iconPath: "M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
    industry: "General",
    builder: "@4th-ir",
    verified: true,
    pricePerYear: 0,
    owned: true,
    components: {
      skillIds: ["sql-querying", "cold-outreach", "sprint-planning", "prompt-engineering"],
      interconnectorIds: ["gmail", "calendar"],
    },
    prerequisites: ["A Google account to connect Gmail & Calendar"],
  },
  {
    id: "design-pack",
    name: "Design Pack",
    outcome: "Ship polished product design end-to-end.",
    description:
      "Craft a story-driven deck and work directly in Figma, Notion, and Drive — the design toolkit your twyn needs to take work from brief to handoff.",
    iconColor: "#6C5CE7",
    iconPath: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
    industry: "Technology",
    builder: "@4th-ir",
    verified: true,
    pricePerYear: 17,
    components: {
      skillIds: ["pitch-deck"],
      interconnectorIds: ["figma", "notion", "drive"],
    },
    prerequisites: [
      "A Figma account",
      "A Google account for Drive",
      "Notion workspace access",
    ],
  },
  {
    id: "development-pack",
    name: "Development Pack",
    outcome: "Plan, build, and ship software with one team.",
    description:
      "A full engineering loadout: plan and sequence sprints, query databases, run experiments, and operate across GitHub, Linear, Jira, and Notion.",
    iconColor: "#3B82F6",
    iconPath: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
    industry: "Technology",
    builder: "@4th-ir",
    verified: true,
    pricePerYear: 22,
    components: {
      skillIds: ["sprint-planning", "sql-querying", "prompt-engineering", "ab-testing"],
      interconnectorIds: ["github", "linear", "jira", "notion"],
    },
    prerequisites: [
      "GitHub organization access",
      "Atlassian (Jira) account",
      "Linear workspace access",
    ],
  },
  {
    id: "scrum-pack",
    name: "Scrum Pack",
    outcome: "Run agile ceremonies and keep teams unblocked.",
    description:
      "Everything a scrum master needs: scope and sequence sprints, keep stakeholders aligned, and manage the board across Jira, Linear, Slack, and Calendar.",
    iconColor: "#D97706",
    iconPath: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15",
    industry: "Technology",
    builder: "@4th-ir",
    verified: true,
    pricePerYear: 13,
    components: {
      skillIds: ["sprint-planning", "stakeholder-alignment"],
      interconnectorIds: ["jira", "linear", "slack", "calendar"],
    },
    prerequisites: [
      "Atlassian (Jira) account",
      "Linear workspace access",
      "Slack workspace admin approval",
    ],
  },
];

export const COMMUNITY_TWYNS: CommunityTwyn[] = [
  {
    id: "sara",
    name: "Sara",
    rating: 4.9,
    by: "Sara G.",
    level: "L2",
    responseTime: "2hr",
    description: "Virtual Scrum Master keeping agile teams sharp, sprint-ready, and unblocked.",
    portrait: "/assets/sara.png",
    tags: ["Agile", "Azure DevOps", "SharePoint", "+3"],
    mcps: ["Excel", "SharePoint", "Azure Boards", "Calendar"],
    pricePerHour: 5,
  },
  {
    id: "maya",
    name: "Maya Kowalski",
    rating: 4.9,
    by: "Maya",
    level: "L2",
    responseTime: "2hr",
    description: "Talent acquisition · first-pass screening, rubric design, panel synthesis.",
    portrait: "/assets/persona-exec-f.png",
    tags: ["Recruiting", "Greenhouse", "Rubrics", "+2"],
    mcps: ["Greenhouse", "Slack", "Notion"],
    priceMonthly: "$3,400 /mo per role",
  },
  {
    id: "scrum-master",
    name: "Scrum Master",
    rating: 4.9,
    by: "Dana M.",
    level: "L2",
    responseTime: "4hr",
    description: "Agile leader focused on team performance and delivery.",
    portrait: "/assets/persona-agile.png",
    tags: ["Agile", "Jira", "Azure DevOps", "+3"],
    mcps: ["Jira", "Slack", "GitHub"],
    pricePerHour: 5,
  },
  {
    id: "marketing-strategist",
    name: "Marketing Strategist",
    rating: 4.8,
    by: "Priya C.",
    level: "L2",
    responseTime: "6hr",
    description: "Data-driven marketer that grows brands and drives results.",
    portrait: "/assets/persona-consult-f.png",
    tags: ["SEO", "Content", "Analytics", "+2"],
    mcps: ["HubSpot", "Slack", "Notion"],
    pricePerHour: 4,
  },
  {
    id: "fullstack",
    name: "Full Stack Developer",
    rating: 4.9,
    by: "David O.",
    level: "L2",
    responseTime: "4hr",
    description: "Builds scalable web apps and powerful digital experiences.",
    portrait: "/assets/persona-dev-m.png",
    tags: ["React", "Node.js", "AWS", "+4"],
    mcps: ["GitHub", "Linear", "Slack", "AWS", "Vercel", "Notion"],
    pricePerHour: 4,
    hires: 54,
    humanRoleLabel: "Full Stack Developer · the real person",
    humanInitials: "FS",
    humanAvailability: "L2 available within 24hr · placeholder",
    refusals: [
      "Override the human's judgment on a final call",
      "Take actions beyond agreed scope",
    ],
    capabilities: [
      "Full-stack web application development",
      "API design, integration & documentation",
      "Cloud infrastructure setup and deployment",
      "Code review, testing & CI/CD pipeline automation",
    ],
    worksWith: [
      "Product teams",
      "Startups",
      "Enterprise engineering",
      "Solo founders",
    ],
    reviews: [
      {
        reviewer: "Jake R.",
        rating: 5,
        text: "Delivered the entire backend API in a week. Clean code, solid architecture, great communication.",
      },
      {
        reviewer: "Lisa M.",
        rating: 5,
        text: "Best developer I've worked with. Zero back-and-forth — everything works on first deployment.",
      },
    ],
    pairings: [
      {
        name: "DevOps Engineer",
        description: "Handles infra so the developer can ship faster.",
        portrait: "/assets/persona-exec-m.png",
      },
      {
        name: "UI/UX Designer",
        description: "Design-to-code handoff with zero ambiguity.",
        portrait: "/assets/persona-creative-m.png",
      },
    ],
  },
  {
    id: "financial-analyst",
    name: "Financial Analyst",
    rating: 4.7,
    by: "Nadia O.",
    level: "L2",
    responseTime: "8hr",
    description: "Turns data into insights and drives smarter decisions.",
    portrait: "/assets/persona-analytic-f.png",
    tags: ["Excel", "Power BI", "Modeling", "+2"],
    mcps: ["Notion", "Slack", "QuickBooks"],
    pricePerHour: 4,
  },
  {
    id: "devops",
    name: "DevOps Engineer",
    rating: 4.9,
    by: "Chris M.",
    level: "L2",
    responseTime: "4hr",
    description: "Automates infrastructure and ensures high availability.",
    portrait: "/assets/persona-exec-m.png",
    tags: ["AWS", "Docker", "Kubernetes", "+3"],
    mcps: ["GitHub", "AWS", "Datadog"],
    pricePerHour: 5,
  },
];
