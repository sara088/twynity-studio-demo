export interface EarningsRow {
  date: string;
  source: string;
  credits: number;
  amount: number;
}

export const EARNINGS: EarningsRow[] = [
  { date: "2026-05-28", source: "Linear · design critique", credits: 32, amount: 102.4 },
  { date: "2026-05-27", source: "Vercel · onboarding consult", credits: 48, amount: 134.4 },
  { date: "2026-05-26", source: "Notion · doc audit", credits: 18, amount: 43.2 },
  { date: "2026-05-25", source: "Linear · design critique", credits: 21, amount: 67.2 },
  { date: "2026-05-24", source: "Vercel · onboarding consult", credits: 41, amount: 114.8 },
  { date: "2026-05-23", source: "Linear · design critique", credits: 27, amount: 86.4 },
];

export const EARNINGS_SUMMARY = {
  mtd: 1536,
  ytd: 14_412,
  pending: 318,
  nextPayout: "2026-06-01",
};
