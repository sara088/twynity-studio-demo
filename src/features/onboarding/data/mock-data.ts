export interface Capability {
  id: string;
  name: string;
  description: string;
  premium?: boolean;
  defaultEquipped?: boolean;
}

export interface InteractionStyle {
  id: string;
  name: string;
  description: string;
}

export interface ToolItem {
  id: string;
  name: string;
}

export const SPEECHES: Record<1 | 2 | 3, string> = {
  1: "This takes under two minutes. Add a photo and record a short voice clip — I'll handle the rest.",
  2: "Now — what do you actually do? Just say it the way you'd say it to a friend.",
  3: "Pick a few free capabilities to get started. You can equip more, connect tools, and go deeper once you're in the studio.",
};

export const ROLE_SUGGESTIONS = [
  "Product Discovery Lead",
  "Founding Designer",
  "Scope-cutter",
  "Engineering Lead",
  "Growth Operator",
  "Strategy Advisor",
  "Operations Lead",
  "Brand Strategist",
  "Data Analyst",
  "Compliance Specialist",
  "Generalist Operator",
];

export const STYLES: InteractionStyle[] = [
  {
    id: "direct",
    name: "Direct & efficient",
    description: "Gets to the point. Few words, clear calls.",
  },
  {
    id: "warm",
    name: "Warm & collaborative",
    description: "Explains, asks, partners. Patient.",
  },
  {
    id: "analytical",
    name: "Analytical & thorough",
    description: "Depth-first. Evidence before opinion.",
  },
  {
    id: "playful",
    name: "Playful & creative",
    description: "Informal, idea-rich, energizing.",
  },
];

export const CAPABILITIES: Capability[] = [
  {
    id: "summarize",
    name: "Summarize long docs",
    description: "Compress a 50-pg PDF into a 1-pg brief with citations.",
    defaultEquipped: true,
  },
  {
    id: "schedule",
    name: "Schedule across timezones",
    description: "Coordinate meetings without the email tennis.",
    defaultEquipped: true,
  },
  {
    id: "outreach",
    name: "Draft outreach & replies",
    description: "Write in your voice. You approve before send.",
    defaultEquipped: true,
  },
  {
    id: "research",
    name: "Run quick research",
    description: "Pull credible sources, no hallucinations.",
    defaultEquipped: true,
  },
  {
    id: "discovery",
    name: "Run discovery interviews",
    description: "Lead user interviews, surface real problems.",
    premium: true,
  },
  {
    id: "synthesis",
    name: "Pattern synthesis",
    description: "Turn 20+ transcripts into clean theme clusters.",
    premium: true,
  },
];

export const TOOLS: ToolItem[] = [
  { id: "slack",    name: "Slack"    },
  { id: "notion",   name: "Notion"   },
  { id: "linear",   name: "Linear"   },
  { id: "github",   name: "GitHub"   },
  { id: "figma",    name: "Figma"    },
  { id: "gmail",    name: "Gmail"    },
  { id: "drive",    name: "Drive"    },
  { id: "calendar", name: "Calendar" },
  { id: "hubspot",  name: "HubSpot"  },
];
