/**
 * Real brand glyphs for the marketplace Interconnectors. Official icon paths come
 * from Simple Icons (CC0). Slack/Plaid/Epic/athenahealth/Healthie aren't in the
 * set — Slack keeps its full-colour mark; the rest fall back to a monogram.
 */
import {
  siGmail,
  siGooglecalendar,
  siGoogledrive,
  siHubspot,
  siZendesk,
  siIntercom,
  siGithub,
  siLinear,
  siJira,
  siFigma,
  siNotion,
  siStripe,
  siQuickbooks,
  siObsidian,
  siLogseq,
  siN8n,
  siZapier,
  siUipath,
  siMake,
  siLangflow,
  siZoom,
  siGooglemeet,
} from "simple-icons";

type Props = { className?: string };

// Slack was removed from Simple Icons (trademark policy) — keep its full-colour mark.
export function SlackIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A" />
      <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
      <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0" />
      <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
      <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D" />
      <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
      <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E" />
      <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E" />
    </svg>
  );
}

// Microsoft Teams was removed from Simple Icons (trademark) — clean inline mark:
// the purple "T" tile with a companion person bubble.
export function TeamsIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="17" cy="7" r="3" fill="#7B83EB" />
      <rect x="3" y="6" width="13" height="13" rx="2.2" fill="#5059C9" />
      <path d="M12.4 9.3H6.6v1.7h2v5h1.8v-5h2z" fill="#fff" />
    </svg>
  );
}

// Our interconnector logo id → official Simple Icon.
const SI: Record<string, { path: string; hex: string }> = {
  gmail: siGmail,
  calendar: siGooglecalendar,
  drive: siGoogledrive,
  hubspot: siHubspot,
  zendesk: siZendesk,
  intercom: siIntercom,
  github: siGithub,
  linear: siLinear,
  jira: siJira,
  figma: siFigma,
  notion: siNotion,
  stripe: siStripe,
  quickbooks: siQuickbooks,
  obsidian: siObsidian,
  logseq: siLogseq,
  n8n: siN8n,
  zapier: siZapier,
  uipath: siUipath,
  make: siMake,
  langflow: siLangflow,
  zoom: siZoom,
  meet: siGooglemeet,
};

// A few brand hexes are too pale to read on a light tile — nudge to a legible tone.
const COLOR_OVERRIDE: Record<string, string> = {
  intercom: "#1F8DED",
};

/** Whether we have a real brand glyph for this logo id (else callers monogram). */
export function hasBrandIcon(logo: string) {
  return logo === "slack" || logo in SI;
}

export function BrandIcon({
  logo,
  className = "h-6 w-6",
}: {
  logo: string;
  className?: string;
}) {
  if (logo === "slack") return <SlackIcon className={className} />;
  const icon = SI[logo];
  if (!icon) return null;
  return (
    <svg viewBox="0 0 24 24" className={className} fill={COLOR_OVERRIDE[logo] ?? `#${icon.hex}`} aria-hidden>
      <path d={icon.path} />
    </svg>
  );
}
