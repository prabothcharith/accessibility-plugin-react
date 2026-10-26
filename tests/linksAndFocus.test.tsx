import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent, cleanup, render } from "@testing-library/react";
import * as API from "../src";
import { findMainLandmark, SkipToMainLink } from "../src";
import { Widget } from "./helpers";

describe("Link Highlighting and Focus Visibility (A11Y-205)", () => {
  let host: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    host = document.createElement("main");
    host.id = "main-landmark";
    host.innerHTML = `
      <h1>Links and Focus Test</h1>
      <p id="test-p">Text with <a href="https://example.com" id="active-link">active link</a>.</p>
      <p><a id="no-href-link">Anchor without href</a></p>
      <p><a href="https://example.com" id="disabled-link" aria-disabled="true">Disabled link</a></p>
      <button id="active-btn" type="button">Active Button</button>
      <button id="disabled-btn" type="button" disabled>Disabled Button</button>
      <input id="active-input" type="text" value="Input" />
    `;
    document.body.appendChild(host);
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    const style = document.getElementById("arap-focus-highlight-style");
    if (style) style.remove();
    vi.restoreAllMocks();
  });

  it("findMainLandmark correctly identifies native <main> or role='main'", () => {
    expect(findMainLandmark()).toBe(host);

    host.remove();
    expect(findMainLandmark()).toBeNull();

    const roleMain = document.createElement("div");
    roleMain.setAttribute("role", "main");
    document.body.appendChild(roleMain);
    expect(findMainLandmark()).toBe(roleMain);
  });

  it("SkipToMainLink only renders when a real main landmark exists", () => {
    // 1. With main present:
    const { unmount } = render(
      <API.AccessibilityPlugin>
        <SkipToMainLink />
      </API.AccessibilityPlugin>,
    );
    const skipLink = screen.getByRole("link", {
      name: /skip to main content/i,
    });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.getAttribute("href")).toBe("#main-landmark");

    unmount();

    // 2. Remove main:
    host.remove();
    render(
      <API.AccessibilityPlugin>
        <SkipToMainLink />
      </API.AccessibilityPlugin>,
    );
    expect(
      screen.queryByRole("link", { name: /skip to main content/i }),
    ).toBeNull();
  });

  it("SkipToMainLink activation focuses main landmark safely", () => {
    render(
      <API.AccessibilityPlugin>
        <SkipToMainLink />
      </API.AccessibilityPlugin>,
    );

    const skipLink = screen.getByRole("link", {
      name: /skip to main content/i,
    });
    const focusSpy = vi.spyOn(host, "focus");
    const scrollSpy = vi.fn();
    host.scrollIntoView = scrollSpy;

    fireEvent.click(skipLink);

    expect(host.getAttribute("tabindex")).toBe("-1");
    expect(focusSpy).toHaveBeenCalled();
    expect(scrollSpy).toHaveBeenCalled();
  });

  function renderWidget(children: React.ReactNode) {
    const result = render(<Widget>{children}</Widget>);
    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    return result;
  }

  it("LinkHighlightController toggles link highlighting with non-color underline cues", () => {
    renderWidget(<API.LinkHighlightController />);

    const toggle = screen.getByRole("button", { name: "Link Highlight" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    const activeLink = document.getElementById("active-link") as HTMLElement;
    expect(activeLink.style.textDecoration).toBe("underline");
    expect(activeLink.style.textUnderlineOffset).toBe("3px");
    expect(activeLink.style.textDecorationThickness).toBe("2px");
    expect(activeLink.style.backgroundColor).not.toBe("");
  });

  it("LinkHighlightController does NOT alter disabled links or links without href", () => {
    renderWidget(<API.LinkHighlightController />);

    const toggle = screen.getByRole("button", { name: "Link Highlight" });
    fireEvent.click(toggle);

    const disabledLink = document.getElementById(
      "disabled-link",
    ) as HTMLElement;
    const noHrefLink = document.getElementById("no-href-link") as HTMLElement;

    // Disabled semantics must be preserved: no active background or forced styling
    expect(disabledLink.style.backgroundColor).toBe("");
    expect(noHrefLink.style.backgroundColor).toBe("");
  });

  it("HighlightFocusController injects high-visibility focus styles and cleans up on toggle and reset", () => {
    renderWidget(<API.HighlightFocusController />);

    const toggle = screen.getByRole("button", { name: "Highlight Focus" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(document.getElementById("arap-focus-highlight-style")).toBeNull();

    // Toggle ON
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    const styleEl = document.getElementById(
      "arap-focus-highlight-style",
    ) as HTMLStyleElement;
    expect(styleEl).not.toBeNull();
    expect(styleEl.textContent).toContain(
      "outline: 3px solid #2563eb !important",
    );
    expect(styleEl.textContent).toContain("outline-offset: 3px !important");
    expect(styleEl.textContent).toContain(
      "box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.9) !important",
    );
    // Ensure disabled controls are protected from receiving focus outlines
    expect(styleEl.textContent).toContain("*:disabled:focus-visible");
    expect(styleEl.textContent).toContain(
      '*[aria-disabled="true"]:focus-visible',
    );
    expect(styleEl.textContent).toContain("outline: none !important");
    // Ensure forced-colors uses system Highlight
    expect(styleEl.textContent).toContain(
      "outline: 3px solid Highlight !important",
    );

    // Toggle OFF
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(document.getElementById("arap-focus-highlight-style")).toBeNull();

    // Toggle ON again, then test Reset All
    fireEvent.click(toggle);
    expect(
      document.getElementById("arap-focus-highlight-style"),
    ).not.toBeNull();

    const resetBtn = screen.getByRole("button", { name: /reset all/i });
    fireEvent.click(resetBtn);
    expect(document.getElementById("arap-focus-highlight-style")).toBeNull();
  });

  it("link highlighting respects forced-colors: active using system LinkText", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("forced-colors: active"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    renderWidget(<API.LinkHighlightController />);

    const toggle = screen.getByRole("button", { name: "Link Highlight" });
    fireEvent.click(toggle);

    const activeLink = document.getElementById("active-link") as HTMLElement;
    expect(activeLink.style.color.toLowerCase()).toBe("linktext");
    expect(activeLink.style.textDecoration).toBe("underline");
    // Should NOT override background color with hardcoded color when forced colors is active
    expect(activeLink.style.backgroundColor).toBe("");
  });
});
