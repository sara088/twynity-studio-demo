"use client";

import { useParams } from "next/navigation";
import { OAuthScreen } from "@/features/talk/components/OAuthScreen";
import { OAUTH_MESSAGE, isProvider } from "@/features/talk/data/connect";

// Standalone OAuth tab opened by the connect modal (window.open). It runs the
// provider sign-in, posts the result back to the opener, and closes itself —
// the same shape as a real OAuth popup/redirect.
export function OAuthClient() {
  const raw = useParams().provider;
  const provider = Array.isArray(raw) ? raw[0] : raw;

  if (!isProvider(provider)) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg-page px-6 text-center text-[14px] text-gray-3">
        Unknown sign-in provider.
      </div>
    );
  }

  const finish = (status: "connected" | "cancelled") => {
    try {
      window.opener?.postMessage(
        { source: OAUTH_MESSAGE, provider, status },
        window.location.origin,
      );
    } catch {
      /* ignore */
    }
    window.close();
  };

  return <OAuthScreen provider={provider} onDone={finish} />;
}
