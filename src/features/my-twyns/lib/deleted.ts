// Tracks twyns the user has deleted (prototype — the seed list is static, so we
// hide deleted ids client-side). localStorage + same-tab broadcast, mirroring
// the purchases/payment stores.

const KEY = "twynity_deleted_twyns";
const EVENT = "twynity:deleted-twyns-changed";

export function getDeletedTwyns(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function deleteTwyn(id: string) {
  try {
    const next = Array.from(new Set([...getDeletedTwyns(), id]));
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function onDeletedTwynsChanged(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
