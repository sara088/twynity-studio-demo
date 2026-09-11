export interface TopUpPack {
  id: string;
  tier: string; // pass name, e.g. "Week pass"
  credits: number;
  price: number;
  unitPrice?: string;
  validity: string; // how long the credits stay valid, e.g. "7 days"
  caption: string;
  popular?: boolean;
}

// Tiered passes — credits are valid for the pass window (Daily / Weekly /
// Monthly), then expire. Checkout is one-click against the saved card.
export const TOP_UP_PACKS: TopUpPack[] = [
  {
    id: "day",
    tier: "Day pass",
    credits: 60,
    price: 3,
    validity: "24 hours",
    caption: "A quick boost for a busy day.",
  },
  {
    id: "week",
    tier: "Week pass",
    credits: 300,
    price: 12,
    unitPrice: "$0.04/credit",
    validity: "7 days",
    caption: "Best value — our most popular pass.",
    popular: true,
  },
  {
    id: "month",
    tier: "Month pass",
    credits: 1000,
    price: 35,
    unitPrice: "$0.035/credit",
    validity: "30 days",
    caption: "Heavy use, lowest per-credit rate.",
  },
];

export const USAGE_SUMMARY = {
  used: 17,
  total: 100,
  resetsOn: "June 1",
  // Topped-up (paid) credits — a separate bucket that doesn't reset monthly.
  topUpUsed: 60,
  topUpTotal: 250,
};

// ─── Billing (Stripe-standard) ──────────────────────────────────────────────

export interface PaymentMethod {
  brand: string; // card network, e.g. "Visa"
  last4: string;
  expMonth: number; // 1–12
  expYear: number;
  name: string; // name on card
}

export const PAYMENT_METHOD: PaymentMethod = {
  brand: "Visa",
  last4: "4242",
  expMonth: 8,
  expYear: 2027,
  name: "Sara Djurovic",
};

export interface BillingDetails {
  name: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string; // VAT / tax ID, optional in practice
}

export const BILLING_DETAILS: BillingDetails = {
  name: "Sara Djurovic",
  email: "sara@example.com",
  line1: "21 Knez Mihailova",
  line2: "",
  city: "Belgrade",
  state: "",
  postalCode: "11000",
  country: "Serbia",
  taxId: "RS123456789",
};

export interface Invoice {
  id: string;
  number: string; // human invoice number
  date: string;
  description: string;
  amount: number;
  status: "Paid";
}

export const INVOICES: Invoice[] = [
  { id: "in-1043", number: "TWY-1043", date: "May 1, 2026", description: "500 credits top-up", amount: 20, status: "Paid" },
  { id: "in-1021", number: "TWY-1021", date: "Apr 3, 2026", description: "Crisis Management · annual license", amount: 36, status: "Paid" },
  { id: "in-0998", number: "TWY-0998", date: "Mar 1, 2026", description: "100 credits top-up", amount: 5, status: "Paid" },
  { id: "in-0975", number: "TWY-0975", date: "Feb 1, 2026", description: "1,000 credits top-up", amount: 35, status: "Paid" },
];

// ─── Plans / tiers ──────────────────────────────────────────────────────────
// Real tier data: Free Trial · Basic · Standard · Pro · Teams. Prices in CHF
// (per the pricing model); Teams is custom (talk to sales). Feature limits —
// avatars/voices, storage, and monthly interaction credits — come straight from
// the model. Tier ids match @/features/shared/lib/tier (TierId).

export type PlanTier = "free-trial" | "basic" | "standard" | "pro" | "teams" | "enterprise";

export interface Plan {
  id: PlanTier;
  name: string;
  tagline: string;
  /** Icon key resolved to a lucide icon in the component. */
  icon: "trial" | "basic" | "standard" | "pro" | "teams" | "enterprise";
  priceLabel: string; // "Free" · "129.04 CHF" · "Custom"
  priceUnit: string; // "15-day trial" · "/ month" · "Talk to sales"
  cta: string;
  current?: boolean;
  recommended?: boolean;
  features: string[];
  idealFor: string;
}

export const PLANS: Plan[] = [
  {
    id: "free-trial",
    name: "Free Trial",
    tagline: "Try Twynity, free",
    icon: "trial",
    priceLabel: "Free",
    priceUnit: "15-day trial",
    cta: "Current plan",
    current: true,
    features: [
      "15-day free trial",
      // No custom avatar on the trial (that's the "Make it move" upgrade) —
      // just a custom voice, then the stock avatar & voice. Custom-first, stock
      // underneath, to match the paid tiers.
      "1 custom voice",
      "1 stock avatar & 1 stock voice",
      "100 MB knowledge storage",
      "165 interaction credits",
      "Web & mobile access",
    ],
    idealFor: "First-time users trying it out",
  },
  {
    id: "basic",
    name: "Basic",
    tagline: "Your first twyn, for real",
    icon: "basic",
    priceLabel: "129.04 CHF",
    priceUnit: "/ month",
    cta: "Upgrade to Basic",
    features: [
      "1 custom avatar & 1 custom voice",
      "3 stock avatars & 3 stock voices",
      "500 MB knowledge storage",
      "660 interaction credits / month",
      "Cross-tool workflows",
      "Marketplace access",
    ],
    idealFor: "Solo professionals",
  },
  {
    id: "standard",
    name: "Standard",
    tagline: "More twyns, more range",
    icon: "standard",
    priceLabel: "250.42 CHF",
    priceUnit: "/ month",
    cta: "Upgrade to Standard",
    recommended: true,
    features: [
      "Everything in Basic",
      "3 custom avatars & 3 custom voices",
      "5 stock avatars & 5 stock voices",
      "1 GB knowledge storage",
      "1,650 interaction credits / month",
    ],
    idealFor: "Power users & creators",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Full-power workforce",
    icon: "pro",
    priceLabel: "379.82 CHF",
    priceUnit: "/ month",
    cta: "Upgrade to Pro",
    features: [
      "Everything in Standard",
      "5 custom avatars & 5 custom voices",
      "10 stock avatars & 10 stock voices",
      "3 GB knowledge storage",
      "3,300 interaction credits / month",
      "Priority support",
    ],
    idealFor: "Heavy users & founders",
  },
  {
    id: "teams",
    name: "Teams",
    tagline: "Twyns that work together",
    icon: "teams",
    priceLabel: "Custom",
    priceUnit: "Talk to sales",
    cta: "Contact sales",
    features: [
      "Everything in Pro",
      "3 team workspaces",
      "3 team workflows",
      "10 GB knowledge storage",
      "Collaborate across twyns",
      "Centralized billing & admin",
    ],
    idealFor: "Teams & organizations",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Twyns at company scale",
    icon: "enterprise",
    priceLabel: "Custom",
    priceUnit: "Talk to sales",
    cta: "Contact sales",
    features: [
      "Everything in Teams",
      "Unlimited workspaces & workflows",
      "SSO / SAML & advanced security",
      "Dedicated success manager",
      "Custom knowledge storage",
      "SLA, audit logs & compliance",
    ],
    idealFor: "Large & regulated organizations",
  },
];
