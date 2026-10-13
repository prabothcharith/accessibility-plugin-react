import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  screen,
  fireEvent,
  within,
  waitFor,
  cleanup,
} from "@testing-library/react";
import * as API from "../src";
import { renderFeatures } from "./helpers";
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const steppers = [
  {
    Component: API.FontSizeController,
    label: "font size",
    initial: 100,
    min: 50,
    max: 200,
    step: 10,
    property: "fontSize",
    expected: "22px",
  },
  {
    Component: API.LineHeightController,
    label: "line height",
    initial: 100,
    min: 50,
    max: 200,
    step: 10,
    property: "lineHeight",
    expected: "33px",
  },
  {
    Component: API.LetterSpacingController,
    label: "letter spacing",
    initial: 0,
    min: 0,
    max: 10,
    step: 1,
    property: "letterSpacing",
    expected: "1px",
  },
] as const;
describe.each(steppers)(
  "$label",
  ({ Component, label, initial, min, max, step, property, expected }) => {
    it("applies a step, clamps buttons at both bounds, restores host styles", () => {
      const { host, unmount } = renderFeatures(<Component />);
      fireEvent.click(screen.getByLabelText(`Increase ${label}`));
      expect((host.querySelector("h1") as HTMLElement).style[property]).toBe(
        expected,
      );
      for (let i = initial; i <= max; i += step)
        fireEvent.click(screen.getByLabelText(`Increase ${label}`));
      expect(screen.getByLabelText(`Increase ${label}`)).toBeDisabled();
      for (let i = max; i > min; i -= step)
        fireEvent.click(screen.getByLabelText(`Decrease ${label}`));
      expect(screen.getByLabelText(`Decrease ${label}`)).toBeDisabled();
      unmount();
      expect(host.querySelector("h1")?.getAttribute("style")).toContain(
        "font-size: 20px",
      );
    });
  },
);
it("composes every filter in a stable order and retains host filter", () => {
  const { host } = renderFeatures(
    <>
      <API.ContrastController />
      <API.SaturationController />
      <API.GrayscaleController />
      <API.InvertColorsController />
    </>,
  );
  host.style.filter = "brightness(0.8)";
  fireEvent.click(
    within(screen.getByRole("group", { name: "Contrast" })).getByText("High"),
  );
  fireEvent.click(
    within(screen.getByRole("group", { name: "Saturation" })).getByText("Low"),
  );
  fireEvent.click(screen.getByRole("button", { name: "Invert Colors" }));
  fireEvent.click(screen.getByRole("button", { name: "Grayscale" }));
  expect(host.style.filter).toBe(
    "brightness(0.8) contrast(1.5) saturate(0.2) invert(1) grayscale(1)",
  );
  fireEvent.click(
    within(screen.getByRole("group", { name: "Contrast" })).getByText("Off"),
  );
  expect(host.style.filter).toBe(
    "brightness(0.8) saturate(0.2) invert(1) grayscale(1)",
  );
  fireEvent.click(screen.getByText("Reset All"));
  expect(host.style.filter).toBe("brightness(0.8)");
});
it.each([
  ["Reduced", "contrast(0.5)"],
  ["Low", "contrast(1.25)"],
  ["High", "contrast(1.5)"],
  ["Extra", "contrast(2)"],
])("contrast %s works", (label, expected) => {
  const { host } = renderFeatures(<API.ContrastController />);
  fireEvent.click(screen.getByText(label));
  expect(host.style.filter).toBe(expected);
});
it.each(["Yellow on black", "White on black", "Blue on yellow"])(
  "restores legacy palette %s",
  (label) => {
    const { host } = renderFeatures(<API.ContrastController />);
    fireEvent.click(screen.getByText(label));
    expect(host.style.backgroundColor).not.toBe("");
    fireEvent.click(screen.getByText("Off"));
    expect(host.style.backgroundColor).toBe("");
  },
);
it.each(["default", "left", "center", "right", "justify"])(
  "text alignment %s",
  (value) => {
    const { host } = renderFeatures(<API.TextAlignController />);
    fireEvent.click(screen.getByText(value));
    expect(host.style.textAlign).toBe(value === "default" ? "" : value);
  },
);
it.each([
  [API.HideImagesController, "Hide Images", "img", "visibility", "hidden"],
  [API.HideVideosController, "Hide Videos", "video", "visibility", "hidden"],
  [API.BigCursorController, "Big Cursor", "a", "cursor", "data:image/svg+xml"],
  [
    API.LinkHighlightController,
    "Link Highlight",
    "a",
    "text-decoration",
    "underline",
  ],
] as const)(
  "toggle %s applies and resets",
  (Component, label, selector, property, expected) => {
    const { host } = renderFeatures(<Component />);
    const button = screen.getByRole("button", { name: label });
    fireEvent.click(button);
    expect(
      (host.querySelector(selector) as HTMLElement).style.getPropertyValue(
        property,
      ),
    ).toContain(expected);
    expect(host.querySelector("iframe")?.style.visibility).toBe("");
    fireEvent.click(button);
    expect(
      (host.querySelector(selector) as HTMLElement).style.getPropertyValue(
        property,
      ),
    ).toBe("");
  },
);
it.each(["yellow on black", "blue on yellow", "black on white"])(
  "link palette %s",
  (label) => {
    const { host } = renderFeatures(<API.LinkHighlightController />);
    fireEvent.click(screen.getByText(label));
    expect(host.querySelector("a")?.style.backgroundColor).not.toBe("");
  },
);
it.each([
  [API.ReadingMaskController, "Reading Mask", ".arap-reading-mask"],
  [API.ReadingGuideController, "Reading Guide", ".arap-reading-guide"],
] as const)("reading aid %s cleans up", (Component, label, selector) => {
  const { unmount } = renderFeatures(<Component />);
  fireEvent.click(screen.getByRole("button", { name: label }));
  const aid = document.querySelector(selector) as HTMLElement;
  expect(aid).toHaveAttribute("aria-hidden", "true");
  expect(aid.style.pointerEvents).toBe("none");
  if (label === "Reading Mask") {
    expect(aid.style.background).toBe("transparent");
    expect(aid.style.boxShadow).toContain("200vmax");
  }
  unmount();
  expect(document.querySelector(selector)).toBeNull();
});
it("keeps effects while closed, reopened and after dynamic route content", async () => {
  const { host } = renderFeatures(
    <>
      <API.FontSizeController />
      <API.GrayscaleController />
    </>,
  );
  fireEvent.click(screen.getByLabelText("Increase font size"));
  fireEvent.click(screen.getByRole("button", { name: "Grayscale" }));
  fireEvent.click(screen.getByLabelText("Close accessibility settings"));
  expect(host.style.filter).toBe("grayscale(1)");
  host.innerHTML = '<p style="font-size:30px">New route</p>';
  await waitFor(() =>
    expect(host.querySelector("p")?.style.fontSize).toBe("33px"),
  );
  fireEvent.click(screen.getByLabelText("Accessibility"));
  expect(screen.getByRole("button", { name: "Grayscale" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(document.querySelector(".arap-btn")?.getAttribute("style")).toBeNull();
});
it.each([
  ["Off", ""],
  ["Low", "saturate(0.2)"],
  ["High", "saturate(2)"],
])("saturation %s", (label, filter) => {
  const { host } = renderFeatures(<API.SaturationController />);
  fireEvent.click(screen.getByText(label));
  expect(host.style.filter).toBe(filter);
});
it("preserves inline priority and a newer host mutation on cleanup", () => {
  const { host, unmount } = renderFeatures(<API.LetterSpacingController />);
  host.style.setProperty("letter-spacing", "2px", "important");
  fireEvent.click(screen.getByLabelText("Increase letter spacing"));
  fireEvent.click(screen.getByText("Reset All"));
  expect(host.style.getPropertyValue("letter-spacing")).toBe("2px");
  expect(host.style.getPropertyPriority("letter-spacing")).toBe("important");
  fireEvent.click(screen.getByLabelText("Increase letter spacing"));
  host.style.letterSpacing = "4px";
  unmount();
  expect(host.style.letterSpacing).toBe("4px");
});
it("restores omitted persisted features only once registered", () => {
  localStorage.setItem(
    "react-accessibility-plugin:state",
    JSON.stringify({ grayscale: true }),
  );
  const { host } = renderFeatures(<API.FontSizeController />);
  expect(host.style.filter).toBe("");
});
