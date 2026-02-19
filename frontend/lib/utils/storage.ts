/**
 * Type-safe storage wrappers for localStorage and sessionStorage.
 *
 * All keys are automatically prefixed with `poco_` to avoid collisions
 * with other applications sharing the same origin.
 */

const PREFIX = "poco_";

// ---------------------------------------------------------------------------
// Key types
// ---------------------------------------------------------------------------

export type LocalStorageKey =
  | "session_prompt"
  | "user_preferences"
  | "draft_message"
  | "chat_history"
  | "connector_state";

export type SessionStorageKey =
  | "temp_state"
  | "navigation_state"
  | "filter_state";

// ---------------------------------------------------------------------------
// Generic helpers (private)
// ---------------------------------------------------------------------------

function getItem<T>(
  storage: Storage | undefined,
  key: string,
): T | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(`${PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setItem<T>(
  storage: Storage | undefined,
  key: string,
  value: T,
): void {
  if (!storage) return;
  try {
    storage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  } catch (error) {
    console.error(`[Storage] Failed to write key "${key}":`, error);
  }
}

function removeItem(storage: Storage | undefined, key: string): void {
  if (!storage) return;
  try {
    storage.removeItem(`${PREFIX}${key}`);
  } catch (error) {
    console.error(`[Storage] Failed to remove key "${key}":`, error);
  }
}

function getStorage(type: "local" | "session"): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return type === "local" ? window.localStorage : window.sessionStorage;
}

// ---------------------------------------------------------------------------
// localStorage
// ---------------------------------------------------------------------------

export function getLocalStorage<T>(key: LocalStorageKey): T | null {
  return getItem<T>(getStorage("local"), key);
}

export function setLocalStorage<T>(key: LocalStorageKey, value: T): void {
  setItem(getStorage("local"), key, value);
}

export function removeLocalStorage(key: LocalStorageKey): void {
  removeItem(getStorage("local"), key);
}

/** Remove all Poco-prefixed entries from localStorage. */
export function clearLocalStorage(): void {
  const storage = getStorage("local");
  if (!storage) return;
  try {
    Object.keys(storage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => storage.removeItem(k));
  } catch (error) {
    console.error("[Storage] Failed to clear localStorage:", error);
  }
}

// ---------------------------------------------------------------------------
// sessionStorage
// ---------------------------------------------------------------------------

export function getSessionStorage<T>(key: SessionStorageKey): T | null {
  return getItem<T>(getStorage("session"), key);
}

export function setSessionStorage<T>(key: SessionStorageKey, value: T): void {
  setItem(getStorage("session"), key, value);
}

export function removeSessionStorage(key: SessionStorageKey): void {
  removeItem(getStorage("session"), key);
}
