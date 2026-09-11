"use client";

import { useEffect, useState } from "react";
import {
  getAvatarStatus,
  onAvatarChanged,
  settleAvatar,
  type AvatarStatus,
} from "@/features/shared/lib/avatar";

const READY: AvatarStatus = { state: "ready", progress: 1 };

// Reactive avatar processing status for a twyn. Subscribes to the store and,
// while processing, ticks progress and settles (ready or failed → notification)
// when the (demo) window completes.
export function useAvatarStatus(twynId: string, twynName?: string): AvatarStatus {
  const [status, setStatus] = useState<AvatarStatus>(READY);

  useEffect(() => {
    const refresh = () => setStatus(getAvatarStatus(twynId));
    refresh();
    return onAvatarChanged(refresh);
  }, [twynId]);

  useEffect(() => {
    if (status.state !== "processing") return;
    const id = setInterval(() => {
      const next = getAvatarStatus(twynId);
      if (next.state === "processing") setStatus(next);
      else settleAvatar(twynId, twynName); // → event → refresh sets ready/failed
    }, 300);
    return () => clearInterval(id);
  }, [status.state, twynId, twynName]);

  return status;
}
