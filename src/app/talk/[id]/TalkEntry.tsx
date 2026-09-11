"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import type { Twyn } from "@/features/my-twyns/types";
import { TalkView, type StartMode } from "@/features/talk/components/TalkView";

const START_MODES: StartMode[] = ["chat", "voice", "video"];

// The product reads ?start= on the server so the studio renders in the chosen
// mode with no flash. A static export has no request to read, so it moves here.
// Same behaviour, one client render later.
function Entry({ twyn }: { twyn: Twyn }) {
  const start = useSearchParams().get("start");
  return <TalkView twyn={twyn} initialMode={START_MODES.find((m) => m === start)} />;
}

export function TalkEntry({ twyn }: { twyn: Twyn }) {
  return (
    <Suspense fallback={null}>
      <Entry twyn={twyn} />
    </Suspense>
  );
}
