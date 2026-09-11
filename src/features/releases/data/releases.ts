// Single source of truth for the release surfaces: the /changelog list, the
// curated /whats-new page, and the in-app ReleaseToast all read from here.
// Newest first. In production this would come from a CMS / the deploy pipeline.

export type ChangeType = "new" | "improved" | "fixed";

// Keys map to a small, token-built mock in the What's-new highlight sections
// (no image assets needed). See HighlightVisual in WhatsNewView.
export type HighlightVisual = "modes" | "upgrade" | "limits" | "plans" | "capture";

export interface Highlight {
  heading: string;
  body: string;
  visual: HighlightVisual;
}

export interface Change {
  type: ChangeType;
  text: string;
}

export interface Release {
  version: string; // "1.5.0"
  date: string; // ISO "2026-07-08"
  label: string; // "July 2026"
  slug: string; // "summer-2026"
  title: string;
  theme: string; // toast chip, e.g. "Studio"
  summary: string; // hero subhead + toast body
  /** Featured releases get a curated /whats-new page. */
  featured?: boolean;
  highlights: Highlight[];
  changes: Change[];
}

export const RELEASES: Release[] = [
  {
    version: "1.5.0",
    date: "2026-07-08",
    label: "July 2026",
    slug: "summer-2026",
    title: "Your studio, your way",
    theme: "Studio",
    summary:
      "Start a twyn in the mode you want, upgrade without losing your footage, and always know where you stand on credits.",
    featured: true,
    highlights: [
      {
        heading: "Start how you want.",
        body: "Every twyn card now has chat, voice, and video right on it — pick how you want to begin and the studio opens straight into that mode. No extra taps.",
        visual: "modes",
      },
      {
        heading: "Make it your own — properly.",
        body: "Turning a free avatar into a moving one now uses the same two-video capture as onboarding (a consent clip and a guided training video), then you pick a plan and check out with Stripe. Your footage carries over — no re-recording.",
        visual: "upgrade",
      },
      {
        heading: "Honest about limits.",
        body: "Out of credits or trial ended? You'll see it in the chat and across the app — the sidebar meter, the rail, and the mobile Account tab all reflect it. Nothing fails silently, and neither state resets on you.",
        visual: "limits",
      },
      {
        heading: "Plans that fit — now with Enterprise.",
        body: "Five individual tiers plus a new Enterprise plan, a public pricing page, and clearer feature lists (your custom avatar and voice first, stock underneath).",
        visual: "plans",
      },
    ],
    changes: [
      { type: "new", text: "Chat / voice / video quick-start icons on My Twyns cards — open the studio in the mode you want." },
      { type: "new", text: "Enterprise plan on pricing, alongside Teams (Teams & Enterprise tab)." },
      { type: "new", text: "In-studio upgrade hands off to Stripe Checkout in a new tab after you pick a plan." },
      { type: "new", text: "Prototype “State” panel to preview tier, avatar, credits, and trial states for demos." },
      { type: "improved", text: "The “Make it move” / “Make it your own” upgrade reuses the onboarding two-video capture (consent + training) before plan selection." },
      { type: "improved", text: "Out-of-credits and trial-ended states now surface in the sidebar credit meter, the collapsed rail, and the mobile Account tab — not just the chat." },
      { type: "improved", text: "Pricing feature lists reordered — custom avatar & voice first, stock underneath — for consistency across every tier." },
      { type: "improved", text: "Pricing headline is now “Pick the plan that fits.”" },
      { type: "fixed", text: "“New chat” now resets the conversation instead of doing nothing." },
      { type: "fixed", text: "“Hire a twyn” on the landing page now opens the demo (was a dead button)." },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-06-15",
    label: "June 2026",
    slug: "avatars-and-upgrade",
    title: "Avatars that move, and a clearer upgrade moment",
    theme: "Avatars",
    summary:
      "Free twyns now come to life with a ready-made moving avatar, and the path to making one truly yours got a lot clearer.",
    highlights: [],
    changes: [
      { type: "new", text: "Free tier now gets a moving stock avatar (a ready-made replica); your own uploaded footage stays a still photo with a “Make it move” prompt." },
      { type: "improved", text: "Upgrade copy adapts to context — “Make it your own” for a stock avatar, “Make it move” for your own photo." },
      { type: "improved", text: "You land in the studio on a tier-explicit URL, so the state you're in is always clear." },
      { type: "improved", text: "Clearer distinction between “your photo” and a “stock avatar” throughout the studio." },
      { type: "fixed", text: "We only ask for a video when we don't already have your footage from setup." },
    ],
  },
  {
    version: "1.3.0",
    date: "2026-05-24",
    label: "May 2026",
    slug: "onboarding-and-tiers",
    title: "Onboarding & tiers",
    theme: "Onboarding",
    summary:
      "A guided two-video capture, voice recording in the same flow, and a free trial that never puts a paywall in your way.",
    highlights: [],
    changes: [
      { type: "new", text: "Two-video capture in onboarding — a short consent clip and a guided training video; record or upload each." },
      { type: "new", text: "Voice recording folded into the same capture popup." },
      { type: "improved", text: "Free trial always starts free — no paywall in signup. You pay in-app, when you're ready." },
      { type: "improved", text: "“Promo code” is now “early access code,” with clearer upgrade-banner copy." },
      { type: "improved", text: "A current-tier pill appears in onboarding once Basic is unlocked." },
      { type: "fixed", text: "The upgrade / early-access entry now always shows during the free trial." },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-04-17",
    label: "April 2026",
    slug: "studio-foundations",
    title: "Studio foundations",
    theme: "Studio",
    summary:
      "The live studio, the equip panel, and the marketplace — the core of talking to and teaching your twyn.",
    highlights: [],
    changes: [
      { type: "new", text: "Live avatar + voice studio with an equip panel for tools, skills, and knowledge, a canvas, and conversation history." },
      { type: "new", text: "Marketplace to browse and buy skills, interconnectors, and knowledge packs." },
      { type: "improved", text: "Tier-aware studio — free trial (static avatar) vs Basic (moving) render distinctly." },
    ],
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** ISO "2026-07-08" → "Jul 8, 2026" (deterministic, no Date needed). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** ISO → "Jul 8" (compact, for the sidebar nav). */
export function formatDateShort(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

export const getLatest = (): Release => RELEASES[0];
export const getLatestFeatured = (): Release => RELEASES.find((r) => r.featured) ?? RELEASES[0];
export const getReleaseBySlug = (slug: string): Release | undefined =>
  RELEASES.find((r) => r.slug === slug);
export const getFeatured = (): Release[] => RELEASES.filter((r) => r.featured);
