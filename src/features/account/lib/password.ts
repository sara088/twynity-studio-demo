// Password complexity rules shared by the Change-password flow. The first three
// are required to pass complexity; the symbol rule is recommended (it boosts the
// strength meter but isn't mandatory).
export const PW_RULES = [
  { id: "len", label: "At least 8 characters", required: true, test: (p: string) => p.length >= 8 },
  { id: "case", label: "Upper & lowercase letters", required: true, test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: "num", label: "At least one number", required: true, test: (p: string) => /\d/.test(p) },
  { id: "symbol", label: "One symbol (recommended)", required: false, test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

export function meetsComplexity(pw: string) {
  return PW_RULES.filter((r) => r.required).every((r) => r.test(pw));
}

export type Strength = { score: number; label: string; bar: string; text: string };

// Mirrors the onboarding signup meter so the two password fields feel identical.
export function strengthOf(pw: string): Strength {
  let score = PW_RULES.filter((r) => r.test(pw)).length;
  if (pw.length < 8) score = Math.min(score, 1);
  const label = score <= 1 ? "Weak" : score <= 3 ? "Medium" : "Strong";
  const bar = score <= 1 ? "bg-error" : score <= 3 ? "bg-amber-text" : "bg-success";
  const text = score <= 1 ? "text-error" : score <= 3 ? "text-amber-text" : "text-success";
  return { score, label, bar, text };
}
