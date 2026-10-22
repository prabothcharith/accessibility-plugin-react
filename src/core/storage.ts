import type { StorageMode } from "./preferences/types";

export const DEFAULT_STORAGE_KEY = "react-accessibility-plugin:state";
const forbidden = new Set(["__proto__", "constructor", "prototype"]);
export function validKey(key: string): boolean {
  return typeof key === "string" && key.length > 0 && !forbidden.has(key);
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function getStorage(mode: StorageMode = "local"): Storage | null {
  if (mode === "none" || typeof window === "undefined") return null;
  try {
    return mode === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function loadState(
  key = DEFAULT_STORAGE_KEY,
  mode: StorageMode = "local",
): Record<string, unknown> | null {
  const storage = getStorage(mode);
  if (!storage) return null;
  try {
    const raw: unknown = JSON.parse(storage.getItem(key) || "null");
    if (!isRecord(raw)) return null;
    // Accept the unversioned 0.1.0 format, reject unknown future envelopes.
    const features =
      "version" in raw ? (raw.version === 1 ? raw.features : null) : raw;
    if (!isRecord(features)) return null;
    return Object.fromEntries(
      Object.entries(features).filter(([name]) => validKey(name)),
    );
  } catch {
    return null;
  }
}
export function saveState(
  state: Record<string, unknown>,
  key = DEFAULT_STORAGE_KEY,
  mode: StorageMode = "local",
): void {
  const storage = getStorage(mode);
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify({ version: 1, features: state }));
  } catch {
    /* Storage is optional. */
  }
}
export function clearState(
  key = DEFAULT_STORAGE_KEY,
  mode: StorageMode = "local",
): void {
  const storage = getStorage(mode);
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* Storage is optional. */
  }
}
/** Every provider owns a writer. Reset cancels pending work; teardown flushes it. */
export function createStorageWriter(
  key = DEFAULT_STORAGE_KEY,
  mode: StorageMode = "local",
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: Record<string, unknown> | undefined;
  const cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };
  const flush = () => {
    const next = pending;
    cancel();
    if (next) saveState(next, key, mode);
  };
  return {
    schedule(state: Record<string, unknown>) {
      cancel();
      pending = state;
      timer = setTimeout(flush, 200);
    },
    clear() {
      cancel();
      clearState(key, mode);
    },
    cancel,
    flush,
  };
}
