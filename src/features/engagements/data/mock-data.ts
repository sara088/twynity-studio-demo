export interface Engagement {
  id: string;
  org: string;
  role: string;
  status: "active" | "ending" | "pending";
  startedAt: string;
  rate: string;
  creditsUsed: number;
  earningsMtd: number;
}

export const ENGAGEMENTS: Engagement[] = [
  {
    id: "e1",
    org: "Linear",
    role: "Design critique partner",
    status: "active",
    startedAt: "2026-04-12",
    rate: "$3.20/credit",
    creditsUsed: 142,
    earningsMtd: 454,
  },
  {
    id: "e2",
    org: "Vercel",
    role: "Onboarding consultant",
    status: "active",
    startedAt: "2026-03-02",
    rate: "$2.80/credit",
    creditsUsed: 311,
    earningsMtd: 871,
  },
  {
    id: "e3",
    org: "Notion",
    role: "Doc audit",
    status: "ending",
    startedAt: "2026-01-20",
    rate: "$2.40/credit",
    creditsUsed: 88,
    earningsMtd: 211,
  },
];
