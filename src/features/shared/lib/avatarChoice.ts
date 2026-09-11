// Remembers the avatar a user picked during onboarding so the studio shows THAT
// image instead of the seed portrait — and whether it came from the user's OWN
// video (we already hold footage we can process on upgrade) or a stock replica
// (no footage yet → they must record/upload to make it move).
// localStorage + same-tab broadcast.

const KEY = "twynity_avatar_choice";
const EVENT = "twynity:avatar-choice-changed";

type Choice = { image: string; ownFootage: boolean };
// Legacy records were a bare image string; read() normalises them to Choice.
type Store = Record<string, Choice | string>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}") as Store;
  } catch {
    return {};
  }
}

function normalise(v: Choice | string | undefined): Choice | null {
  if (!v) return null;
  return typeof v === "string" ? { image: v, ownFootage: false } : v;
}

export function getChosenAvatar(twynId: string): string | null {
  return normalise(read()[twynId])?.image ?? null;
}

// Whether we already hold the user's own footage for this twyn (recorded /
// uploaded their video). Stock replicas return false — we have nothing to animate.
export function hasOwnFootage(twynId: string): boolean {
  return normalise(read()[twynId])?.ownFootage ?? false;
}

export function setChosenAvatar(twynId: string, image: string, ownFootage = false) {
  try {
    const store = read();
    store[twynId] = { image, ownFootage };
    window.localStorage.setItem(KEY, JSON.stringify(store));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

export function onAvatarChoiceChanged(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
