import { GitFork, MoveRight, GitBranch, type LucideIcon } from "lucide-react";
import type { Collaboration } from "../types";

// Shared labels/icons/copy for the collaboration modes — used across the list,
// the builder, and the group chat.
export const COLLAB: Record<Collaboration, { label: string; icon: LucideIcon; hint: string }> = {
  parallel: { label: "Parallel", icon: GitFork, hint: "Everyone works at once." },
  sequential: { label: "Sequential", icon: MoveRight, hint: "A chain — each builds on the last." },
  conditional: { label: "Conditional", icon: GitBranch, hint: "Approval-gated branches." },
};

export const COLLAB_ORDER: Collaboration[] = ["parallel", "sequential", "conditional"];
