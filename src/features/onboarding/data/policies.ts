// Mock legal copy for the onboarding policy popups (Terms / Privacy / Biometric).
// Placeholder text for the prototype — final wording pending legal review.

export type PolicyKey = "terms" | "privacy" | "biometric";

export interface Policy {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}

export const POLICIES: Record<PolicyKey, Policy> = {
  biometric: {
    title: "Biometric Data Policy",
    updated: "Last updated June 2026",
    sections: [
      {
        heading: "What we collect",
        body: "To build your twyn we capture a photo of your face and a short voice recording. These are biometric identifiers, so we treat them with extra care.",
      },
      {
        heading: "How we use it",
        body: "Your face and voice are used only to generate and run your twyn. We do not use them to identify you elsewhere, and we never sell or share them with third parties for advertising.",
      },
      {
        heading: "Consent",
        body: "We only create an AI likeness with your explicit consent. By continuing you confirm the face and voice are your own, or that you have permission from the person they belong to. Impersonating someone else is not allowed.",
      },
      {
        heading: "Storage, retention & your control",
        body: "Biometric data is encrypted in transit and at rest. You can review or delete your twyn — and the underlying biometric data — at any time, and we permanently purge deleted data shortly afterward. You may also withdraw consent, which removes the likeness.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "Last updated June 2026",
    sections: [
      {
        heading: "What we collect",
        body: "Account details (name, email), the content you create with your twyns, and basic usage data that helps us run and improve the service.",
      },
      {
        heading: "How we use your data",
        body: "To provide and secure the service, communicate with you about your account, and improve the product. We do not sell your personal data.",
      },
      {
        heading: "Sharing",
        body: "We share data only with vetted processors (e.g. hosting, payments) under contract, and where required by law. Biometric data is governed by our Biometric Data Policy.",
      },
      {
        heading: "Your choices",
        body: "You can access, export, or delete your data at any time, and contact us with any privacy request.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    updated: "Last updated June 2026",
    sections: [
      {
        heading: "Your account",
        body: "Keep your login secure — you're responsible for activity under your account. You must be old enough to consent to biometric processing in your region.",
      },
      {
        heading: "Acceptable use",
        body: "Don't impersonate others, upload faces or voices you don't have the right to use, or use a twyn to deceive, harass, or break the law. Violations can lead to removal or suspension.",
      },
      {
        heading: "Your content",
        body: "You own the twyns you create. You grant Twynity the limited license needed to host and operate them on your behalf.",
      },
      {
        heading: "Changes & termination",
        body: "We may update these terms or suspend accounts that break them. We'll let you know about material changes.",
      },
    ],
  },
};
