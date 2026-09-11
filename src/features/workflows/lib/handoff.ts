// The hand-off: how a workflow authored in the external Workflow Builder reaches Twynity.
//
// Three transports, worst → best. The prototype models all three so the cost of
// each is visible rather than argued about.
//
//  1. FILE      — user downloads JSON, uploads it here. Two copies from the
//                 moment of export; nothing keeps them in step. n8n's own docs
//                 note exports omit credentials (must be re-added by hand) and
//                 that exported IDs can silently overwrite existing workflows.
//  2. API SYNC  — Twynity holds a connection to the builder and pulls the list.
//                 One source of truth; edits upstream show up here.
//  3. EMBED     — no transport at all. The builder writes straight to our store,
//                 because it never left the page.

export type Transport = "file" | "sync" | "embed";

const KEY = "twynity_builder_drafts";
const EVENT = "twynity:builder-drafts-changed";

export type BuilderDraft = { name: string; savedAt: number };

function read(): BuilderDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? (raw as BuilderDraft[]) : [];
  } catch {
    return [];
  }
}

function write(list: BuilderDraft[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

/** Called by the external Workflow Builder on save — the thing Twynity later discovers. */
export function markBuilderDrafts(name: string) {
  const list = read().filter((d) => d.name !== name);
  list.push({ name, savedAt: new Date().getTime() });
  write(list);
}

export function getBuilderDrafts(): BuilderDraft[] {
  return read();
}

export function clearBuilderDrafts() {
  write([]);
}

export function onBuilderDraftsChanged(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
