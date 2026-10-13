export const DEFAULT_STORAGE_KEY = "react-accessibility-plugin:state";
const forbidden = new Set(["__proto__", "constructor", "prototype"]);
export function validKey(key: string): boolean {
  return typeof key === "string" && key.length > 0 && !forbidden.has(key);
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
export function loadState(
  key = DEFAULT_STORAGE_KEY,
): Record<string, unknown> | null {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(key) || "null");
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
): void {
  try {
    localStorage.setItem(key, JSON.stringify({ version: 1, features: state }));
  } catch {
    /* Storage is optional. */
  }
}
export function clearState(key = DEFAULT_STORAGE_KEY): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* Storage is optional. */
  }
}
/** Every provider owns a writer. Reset cancels pending work; teardown flushes it. */
export function createStorageWriter(key = DEFAULT_STORAGE_KEY) {
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
    if (next) saveState(next, key);
  };
  return {
    schedule(state: Record<string, unknown>) {
      cancel();
      pending = state;
      timer = setTimeout(flush, 200);
    },
    clear() {
      cancel();
      clearState(key);
    },
    cancel,
    flush,
  };
}
