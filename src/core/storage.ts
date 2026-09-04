"use client";

const DEFAULT_STORAGE_KEY = "react-accessibility-plugin:state";

function isLocalStorageAvailable(): boolean {
  try {
    const key = "__arap_test__";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function loadState(
  storageKey: string = DEFAULT_STORAGE_KEY
): Record<string, unknown> | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function saveState(
  state: Record<string, unknown>,
  storageKey: string = DEFAULT_STORAGE_KEY
): void {
  if (!isLocalStorageAvailable()) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  }, 200);
}

export function clearState(storageKey: string = DEFAULT_STORAGE_KEY): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // silently ignore
  }
}
