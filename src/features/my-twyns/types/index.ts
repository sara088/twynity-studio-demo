export type TwynStatus = "online" | "idle" | "review";

export interface Twyn {
  id: string;
  name: string;
  role: string;
  portrait: string;
  createdLabel: string;
  status: TwynStatus;
  earningsMtd: number;
  creditsUsed: number;
  capabilities: string[];
  skills: string[];
  tools: string[];
  knowledge: { name: string; size: string }[];
  facts: string[];
  identityVerified: boolean;
}
