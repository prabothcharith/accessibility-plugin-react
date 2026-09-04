import { describe, it, expect, beforeEach } from "vitest";
import { loadState, saveState, clearState } from "../src/core/storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when no state is saved", () => {
    expect(loadState()).toBeNull();
  });

  it("saves and loads state", () => {
    const state = { fontSize: 120, contrast: 2 };
    saveState(state);
    // Wait for debounce
    setTimeout(() => {
      const loaded = loadState();
      expect(loaded).toEqual(state);
    }, 300);
  });

  it("clears state", () => {
    saveState({ fontSize: 120 });
    setTimeout(() => {
      clearState();
      expect(loadState()).toBeNull();
    }, 300);
  });

  it("uses custom storage key", () => {
    const customKey = "custom-test-key";
    saveState({ test: true }, customKey);
    setTimeout(() => {
      expect(loadState(customKey)).toEqual({ test: true });
      clearState(customKey);
    }, 300);
  });
});
