"use client";

import { useEffect } from "react";
import { markReleaseRead } from "../lib/seen";

// Mounted on the What's-new page: viewing it clears the unread badge.
export function MarkReleaseRead({ version }: { version: string }) {
  useEffect(() => {
    markReleaseRead(version);
  }, [version]);
  return null;
}
