import { OAuthClient } from "./OAuthClient";

// A server wrapper so the route can enumerate its params for the static export;
// the screen itself stays a client component.
export function generateStaticParams() {
  return [{ provider: "gmail" }, { provider: "azure" }];
}

export default function OAuthPage() {
  return <OAuthClient />;
}
