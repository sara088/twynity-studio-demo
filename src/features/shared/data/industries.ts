// Single source of truth for the platform's asset taxonomy. Used by the
// marketplace (filtering) and the Workshop (creating your own assets), so what
// you tag at creation is exactly what filters the marketplace.

export type Industry =
  | "Customer Service"
  | "Technology"
  | "Finance"
  | "Healthcare"
  | "General";

export const INDUSTRIES: Industry[] = [
  "Customer Service",
  "Technology",
  "Finance",
  "Healthcare",
  "General",
];

// Token-based tone per industry — for the chip + monogram on cards.
export const INDUSTRY_TONE: Record<Industry, string> = {
  "Customer Service": "bg-violet-light text-violet",
  Technology: "bg-skill-bg text-skill-text",
  Finance: "bg-mint text-mint-text",
  Healthcare: "bg-amber text-amber-text",
  General: "bg-bg-input text-gray-4",
};
