// Shared config for the Gmail / Microsoft Azure connect flow. The Twynity modal
// explains what access is granted and why it's safe; the actual sign-in happens
// on the provider (Google / Microsoft) in a new tab, which posts back here.

export type Provider = "gmail" | "azure";
export type Brand = "google" | "microsoft";
export type Account = { name: string; email: string };

// postMessage channel between the OAuth tab and the opener (the connect modal).
export const OAUTH_MESSAGE = "twynity-oauth";
export type OAuthResult = { source: typeof OAUTH_MESSAGE; provider: Provider; status: "connected" | "cancelled" };

type ProviderCfg = {
  brand: Brand;
  providerName: string; // "Google" / "Microsoft" — the OAuth screens
  serviceName: string; // "Gmail" / "Microsoft Azure" — what Twynity connects
  bg: string;
  accent: string;
  accounts: Account[];
  /** Friendly, Twynity-side bullets shown in the connect modal. */
  modalPoints: string[];
  /** Provider-phrased permission scopes shown on the consent screen. */
  consentScopes: string[];
};

export const PROVIDERS: Record<Provider, ProviderCfg> = {
  gmail: {
    brand: "google",
    providerName: "Google",
    serviceName: "Gmail",
    bg: "#f8f9fa",
    accent: "#1a73e8",
    accounts: [
      { name: "Sara Gordic", email: "sara.gordic@gmail.com" },
      { name: "Sara · 4th-IR", email: "sara@4thir.com" },
    ],
    modalPoints: [
      "Read & search your inbox",
      "Draft replies in your voice — you approve every send",
      "Never deletes or sends without your approval",
    ],
    consentScopes: [
      "Read, compose, send, and manage your email in Gmail",
      "View your email messages and settings",
    ],
  },
  azure: {
    brand: "microsoft",
    providerName: "Microsoft",
    serviceName: "Microsoft Azure",
    bg: "#eef1f4",
    accent: "#0067b8",
    accounts: [
      { name: "Sara · 4th-IR", email: "sara@4thir.com" },
      { name: "Sara Gordic", email: "s.gordic@outlook.com" },
    ],
    modalPoints: [
      "Read your calendar, Outlook mail & Teams",
      "Search OneDrive & SharePoint documents",
      "Schedule and summarize across them",
    ],
    consentScopes: [
      "Read your calendar, Outlook mail, and Teams messages",
      "Read and search your OneDrive and SharePoint files",
      "Maintain access to data you have given it access to",
    ],
  },
};

export function isProvider(v: unknown): v is Provider {
  return v === "gmail" || v === "azure";
}
