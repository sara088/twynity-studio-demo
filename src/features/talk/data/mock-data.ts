import type { ChatMessage } from "../types";

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "twyn",
    content:
      "Hey — I'm Sara's twyn. Ask me about Figma audits, onboarding flows, or what I'd refuse to ship.",
  },
];

export const QUICK_PROMPTS = [
  "Walk me through a design critique",
  "What's your take on dark patterns?",
  "Audit this checkout flow",
  "Share a recent decision you got wrong",
];
