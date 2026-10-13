import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  ResetController,
} from "../src";
import { loadState, saveState } from "../src/core/storage";
import { PLACEMENT_KEY, validPlacement } from "../src/core/widgetPlacement";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const widget = (persist = true) => (
  <AccessibilityPlugin persist={persist}>
    <AccessibilityButton description="Display options" />
    <AccessibilityList>
      <FontSizeController />
      <div>
        <ResetController />
      </div>
    </AccessibilityList>
  </AccessibilityPlugin>
);
it("validates persisted normalized coordinates and corner choices", () => {
  expect(validPlacement({ kind: "point", x: 0.2, y: 0.7 })).toBe(true);
  for (const bad of [
    { kind: "point", x: NaN, y: 0 },
    { kind: "point", x: 2, y: 0 },
    { kind: "point", x: 0, y: -1 },
    { kind: "corner", corner: "outside" },
    null,
    [],
  ])
    expect(validPlacement(bad)).toBe(false);
});
it("restores placement, pins a nested reset action and preserves placement on settings reset", () => {
  saveState({
    fontSize: 120,
    [PLACEMENT_KEY]: { kind: "corner", corner: "top-left" },
  });
  render(widget());
  const trigger = screen.getByLabelText("Accessibility");
  expect(trigger).toHaveAttribute("data-corner", "top-left");
  fireEvent.click(trigger);
  const reset = screen.getByRole("button", { name: "Reset All" });
  expect(reset.closest(".arap-actions")).not.toBeNull();
  expect(reset.closest(".arap-tools")).toBeNull();
  fireEvent.click(reset);
  act(() => vi.advanceTimersByTime(250));
  expect(loadState()).toEqual({
    [PLACEMENT_KEY]: { kind: "corner", corner: "top-left" },
  });
  expect(
    screen.getByRole("group", { name: "Font Size" }).querySelector("output"),
  ).toHaveTextContent("100%");
});
it("saves position independently and provides a separate placement reset", () => {
  render(widget());
  fireEvent.click(screen.getByLabelText("Accessibility"));
  fireEvent.click(screen.getByRole("button", { name: "Move button" }));
  fireEvent.change(screen.getByLabelText("Accessibility button position"), {
    target: { value: "top-right" },
  });
  act(() => vi.advanceTimersByTime(250));
  expect(loadState()?.[PLACEMENT_KEY]).toEqual({
    kind: "corner",
    corner: "top-right",
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Reset button position" }),
  );
  act(() => vi.advanceTimersByTime(250));
  expect(loadState()).toBeNull();
});
it("ignores malformed placement and persist=false never restores or writes position", () => {
  saveState({ [PLACEMENT_KEY]: { kind: "point", x: 999, y: 0 } });
  const mount = render(widget());
  expect(screen.getByLabelText("Accessibility")).toHaveAttribute(
    "data-corner",
    "bottom-right",
  );
  mount.unmount();
  localStorage.clear();
  render(widget(false));
  fireEvent.click(screen.getByLabelText("Accessibility"));
  fireEvent.click(screen.getByRole("button", { name: "Move button" }));
  fireEvent.change(screen.getByLabelText("Accessibility button position"), {
    target: { value: "top-left" },
  });
  act(() => vi.advanceTimersByTime(250));
  expect(loadState()).toBeNull();
});
it("trigger and panel descriptions have distinct IDs", () => {
  render(widget());
  fireEvent.click(screen.getByLabelText("Accessibility"));
  const trigger = screen.getByLabelText("Accessibility"),
    panel = screen.getByRole("region");
  expect(trigger.getAttribute("aria-describedby")).not.toBe(
    panel.getAttribute("aria-describedby"),
  );
  expect(
    document.querySelectorAll(
      `#${CSS.escape(trigger.getAttribute("aria-describedby")!)}`,
    ),
  ).toHaveLength(1);
});
