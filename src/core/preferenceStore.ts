import { createStorageWriter, loadState } from "./storage";
import type { StorageMode } from "./preferences/types";

/** Cached external snapshot: SSR is empty; hydration restores storage after React attaches. */
export function createPreferenceStore(
  key: string | undefined,
  persist: boolean,
  storageMode?: StorageMode,
) {
  const resolvedMode: StorageMode = storageMode ?? (persist ? "local" : "none");
  const writer = createStorageWriter(key, resolvedMode);
  const empty: Record<string, unknown> = {};
  let snapshot: Record<string, unknown> | undefined;
  const listeners = new Set<() => void>();
  const getSnapshot = () => {
    snapshot ??=
      resolvedMode !== "none" ? (loadState(key, resolvedMode) ?? {}) : {};
    return snapshot;
  };
  return {
    getSnapshot,
    getServerSnapshot: () => empty,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update(
      update: (previous: Record<string, unknown>) => Record<string, unknown>,
    ) {
      snapshot = update(getSnapshot());
      if (resolvedMode !== "none") {
        if (Object.keys(snapshot).length) writer.schedule(snapshot);
        else writer.clear();
      }
      listeners.forEach((listener) => listener());
    },
    flush: writer.flush,
  };
}
