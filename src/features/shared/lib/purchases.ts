// Shared purchase store — marketplace purchases persist (localStorage) so they
// show up in the twyn editor's "Add more → Purchased" tab on a different route.

export type PurchaseType = "capabilities" | "skills" | "interconnectors" | "knowledge" | "packs";

export type PurchasedItem = {
  id: string;
  name: string;
  description: string;
  type: PurchaseType;
  pricePerYear: number;
};

const KEY = "twynity_purchases";
const EVENT = "twynity:purchases-changed";

type Store = Record<string, PurchasedItem[]>; // twynId -> purchased items

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as Store;
  } catch {
    return {};
  }
}

function write(store: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function getPurchases(twynId: string): PurchasedItem[] {
  return read()[twynId] ?? [];
}

export function addPurchase(twynIds: string[], item: PurchasedItem) {
  const store = read();
  for (const id of twynIds) {
    const list = store[id] ?? [];
    if (!list.some((x) => x.id === item.id)) list.push(item);
    store[id] = list;
  }
  write(store);
}

/** Subscribe to purchase changes (same-tab). Returns an unsubscribe fn. */
export function onPurchasesChanged(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
