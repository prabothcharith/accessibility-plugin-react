import { createStorageWriter, loadState } from "./storage";
/** Cached external snapshot: SSR is empty; hydration restores storage after React attaches. */
export function createPreferenceStore(
  key: string | undefined,
  persist: boolean,
) {
  const writer = createStorageWriter(key);
  const empty: Record<string, unknown> = {};
  let snapshot: Record<string, unknown> | undefined;
  const listeners = new Set<() => void>();
  const getSnapshot = () => {
    snapshot ??= persist ? (loadState(key) ?? {}) : {};
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
      if (persist) {
        if (Object.keys(snapshot).length) writer.schedule(snapshot);
        else writer.clear();
      }
      listeners.forEach((listener) => listener());
    },
    flush: writer.flush,
  };
}
