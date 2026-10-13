import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import {
  loadState,
  saveState,
  clearState,
  createStorageWriter,
} from "../src/core/storage";
describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());
  it("saves versioned state and loads legacy state", () => {
    saveState({ fontSize: 120 });
    expect(loadState()).toEqual({ fontSize: 120 });
    localStorage.setItem("legacy", JSON.stringify({ contrast: 2 }));
    expect(loadState("legacy")).toEqual({ contrast: 2 });
  });
  it.each([
    "[]",
    "null",
    "2",
    '"hello"',
    "{",
    '{"version":99,"features":{}}',
    '{"version":1,"features":[]}',
  ])("rejects malformed or obsolete %s", (raw) => {
    localStorage.setItem("test", raw);
    expect(loadState("test")).toBeNull();
  });
  it("ignores dangerous keys", () => {
    localStorage.setItem(
      "test",
      '{"__proto__":{"polluted":true},"constructor":1,"ok":true}',
    );
    expect(loadState("test")).toEqual({ ok: true });
  });
  it("debounces deterministically and isolates writers", () => {
    const a = createStorageWriter("a"),
      b = createStorageWriter("b");
    a.schedule({ x: 1 });
    b.schedule({ x: 2 });
    a.schedule({ x: 3 });
    vi.advanceTimersByTime(199);
    expect(loadState("a")).toBeNull();
    vi.advanceTimersByTime(1);
    expect(loadState("a")).toEqual({ x: 3 });
    expect(loadState("b")).toEqual({ x: 2 });
  });
  it("reset cancels stale writes; teardown can flush or cancel", () => {
    const writer = createStorageWriter();
    writer.schedule({ x: 1 });
    writer.clear();
    vi.runAllTimers();
    expect(loadState()).toBeNull();
    writer.schedule({ x: 2 });
    writer.flush();
    expect(loadState()).toEqual({ x: 2 });
    writer.schedule({ x: 3 });
    writer.cancel();
    vi.runAllTimers();
    expect(loadState()).toEqual({ x: 2 });
    clearState();
    expect(loadState()).toBeNull();
  });
  it("tolerates blocked reads and writes", () => {
    const read = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    const write = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota");
      });
    expect(loadState()).toBeNull();
    expect(() => saveState({ x: 1 })).not.toThrow();
    read.mockRestore();
    write.mockRestore();
  });
});
