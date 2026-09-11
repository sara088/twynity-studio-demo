// Workflows built on Twynity (or imported through the builder) persist in
// localStorage so they show up equipped and runnable in the studio, on a
// different route. Mirrors `shared/lib/purchases.ts`.
//
// Stored shape is plain JSON — the lucide `icon` on a WorkshopItem isn't
// serializable, so it's re-attached on read by `toWorkshopItem`.

import { Workflow } from "lucide-react";
import type {
  WorkshopItem,
  WorkflowStep,
  WorkflowStepKind,
  RunFidelity,
} from "@/features/talk/data/workshop";

export type BuiltWorkflow = {
  id: string;
  name: string;
  description: string;
  /** Natural-language phrase that runs it, e.g. "morning brief". */
  trigger: string;
  steps: WorkflowStep[];
  requires: string[];
  /** Set when the flow came in from an external platform via the builder. */
  platform?: string;
  fidelity: RunFidelity;
  createdAt: number;
};

const KEY = "twynity_built_workflows";
const EVENT = "twynity:built-workflows-changed";

function read(): BuiltWorkflow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? (raw as BuiltWorkflow[]) : [];
  } catch {
    return [];
  }
}

function write(list: BuiltWorkflow[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function getBuiltWorkflows(): BuiltWorkflow[] {
  return read().sort((a, b) => b.createdAt - a.createdAt);
}

export function saveBuiltWorkflow(wf: BuiltWorkflow) {
  const list = read();
  const i = list.findIndex((x) => x.id === wf.id);
  if (i >= 0) list[i] = wf;
  else list.push(wf);
  write(list);
}

export function deleteBuiltWorkflow(id: string) {
  write(read().filter((x) => x.id !== id));
}

/** Subscribe to changes (same-tab). Returns an unsubscribe fn. */
export function onBuiltWorkflowsChanged(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

/** Slug → a stable id, so re-saving the same name updates rather than duplicates. */
export function builtId(name: string) {
  return (
    "wf-built-" +
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  );
}

/** Rehydrate a stored workflow into the WorkshopItem shape the studio equips. */
export function toWorkshopItem(wf: BuiltWorkflow): WorkshopItem {
  const produces = wf.steps.find((s) => s.kind === "artifact");
  return {
    id: wf.id,
    name: wf.name,
    description: wf.description,
    tab: "workflows",
    icon: Workflow,
    provenance: wf.platform ? "imported" : "built",
    workflow: {
      source: wf.platform ? "imported" : "twynity",
      platform: wf.platform,
      fidelity: wf.fidelity,
      steps: wf.steps,
      trigger: wf.trigger,
      requires: wf.requires,
      produces: produces ? wf.id : undefined,
      // Built here, but there's no real backend yet — be honest in the run board.
      demo: true,
    },
  };
}

/** Every built workflow, as equippable WorkshopItems. */
export function builtCatalog(): WorkshopItem[] {
  return getBuiltWorkflows().map(toWorkshopItem);
}

export const STEP_KINDS: {
  kind: WorkflowStepKind;
  label: string;
  hint: string;
  /** Plain-English name for the actor, shown as the step's tag. */
  tag: string;
}[] = [
  { kind: "tool", label: "Use a tool", hint: "Your twyn calls a connected app", tag: "tool" },
  { kind: "handoff", label: "Hand to another twyn", hint: "A specialist does this step", tag: "teammate" },
  { kind: "approval", label: "Wait for your OK", hint: "Pauses until you approve", tag: "your OK" },
  { kind: "artifact", label: "Produce the result", hint: "The thing you get at the end", tag: "result" },
];
