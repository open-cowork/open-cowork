/**
 * Capability view state persistence.
 *
 * Uses a lightweight wrapper around native storage APIs.
 * The "last view" persists across sessions (localStorage),
 * while the "pending view" is ephemeral (sessionStorage).
 */

const LAST_VIEW_KEY = "poco.capabilities.last_view";
const PENDING_VIEW_KEY = "poco.capabilities.pending_view";

function safeStorage(type: "local" | "session"): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return type === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function setLastCapabilityView(viewId: string): void {
  safeStorage("local")?.setItem(LAST_VIEW_KEY, viewId);
}

export function getLastCapabilityView(): string | null {
  return safeStorage("local")?.getItem(LAST_VIEW_KEY) ?? null;
}

export function setPendingCapabilityView(viewId: string): void {
  safeStorage("session")?.setItem(PENDING_VIEW_KEY, viewId);
}

export function consumePendingCapabilityView(): string | null {
  const storage = safeStorage("session");
  if (!storage) return null;
  const value = storage.getItem(PENDING_VIEW_KEY);
  if (value) storage.removeItem(PENDING_VIEW_KEY);
  return value;
}
