import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent, cleanup, act } from "@testing-library/react";
import * as API from "../src";
import { renderFeatures } from "./helpers";

describe("A11Y-302: Accessible Tooltips from authored descriptions", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
    document.body.innerHTML = "";
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("registers tooltips feature with false default and toggles via TooltipsController", () => {
    renderFeatures(<API.TooltipsController />);
    const toggle = screen.getByRole("button", { name: "Accessible Tooltips" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("extracts authored alt text on hover and cleans up on pointer leave", () => {
    const { host } = renderFeatures(<API.TooltipsController />);
    host.innerHTML = `
      <div>
        <img id="test-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Quarterly Revenue Graph" />
      </div>
    `;

    // Enable tooltips
    fireEvent.click(
      screen.getByRole("button", { name: "Accessible Tooltips" }),
    );

    const img = host.querySelector("#test-img")!;
    fireEvent.pointerOver(img);

    const tooltip = document.querySelector(".arap-accessible-tooltip");
    expect(tooltip).not.toBeNull();
    expect(tooltip?.getAttribute("data-visible")).toBe("true");
    expect(tooltip?.textContent).toBe("Quarterly Revenue Graph");

    // Pointer leaves target
    fireEvent.pointerOut(img);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(tooltip?.getAttribute("data-visible")).toBeNull();
  });

  it("extracts aria-label on focus when differing from text or on icon buttons", () => {
    const { host } = renderFeatures(<API.TooltipsController />);
    host.innerHTML = `
      <div>
        <button id="close-btn" aria-label="Close dialog">
          <svg><path d="M0 0" /></svg>
        </button>
      </div>
    `;

    fireEvent.click(
      screen.getByRole("button", { name: "Accessible Tooltips" }),
    );

    const btn = host.querySelector("#close-btn")!;
    fireEvent.focusIn(btn);

    const tooltip = document.querySelector(".arap-accessible-tooltip");
    expect(tooltip?.getAttribute("data-visible")).toBe("true");
    expect(tooltip?.textContent).toBe("Close dialog");

    // Focus out hides immediately
    fireEvent.focusOut(btn);
    expect(tooltip?.getAttribute("data-visible")).toBeNull();
  });

  it("does not show redundant tooltips when aria-label matches visible text", () => {
    const { host } = renderFeatures(<API.TooltipsController />);
    host.innerHTML = `
      <div>
        <button id="save-btn" aria-label="Save changes">Save changes</button>
      </div>
    `;

    fireEvent.click(
      screen.getByRole("button", { name: "Accessible Tooltips" }),
    );

    const btn = host.querySelector("#save-btn")!;
    fireEvent.pointerOver(btn);

    const tooltip = document.querySelector(".arap-accessible-tooltip");
    expect(tooltip?.getAttribute("data-visible")).toBeNull();
  });

  it("extracts multi-id aria-describedby and aria-description", () => {
    const { host } = renderFeatures(<API.TooltipsController />);
    host.innerHTML = `
      <div>
        <input id="username" type="text" aria-describedby="desc-rule desc-len" />
        <span id="desc-rule">Must start with a letter.</span>
        <span id="desc-len">At least 5 characters.</span>
        <button id="copy-btn" aria-description="Copies token to clipboard">Copy</button>
      </div>
    `;

    fireEvent.click(
      screen.getByRole("button", { name: "Accessible Tooltips" }),
    );

    // Input describedby
    const input = host.querySelector("#username")!;
    fireEvent.focusIn(input);

    let tooltip = document.querySelector(".arap-accessible-tooltip");
    expect(tooltip?.getAttribute("data-visible")).toBe("true");
    expect(tooltip?.textContent).toBe(
      "Must start with a letter. At least 5 characters.",
    );

    // Button aria-description
    const copyBtn = host.querySelector("#copy-btn")!;
    fireEvent.focusIn(copyBtn);
    tooltip = document.querySelector(".arap-accessible-tooltip");
    expect(tooltip?.getAttribute("data-visible")).toBe("true");
    expect(tooltip?.textContent).toBe("Copies token to clipboard");
  });

  it("protects private and sensitive fields from leaking descriptions", () => {
    const { host } = renderFeatures(<API.TooltipsController />);
    host.innerHTML = `
      <div>
        <input id="pw" type="password" aria-label="Secret Master Password" />
        <input id="curr-pw" type="text" autocomplete="current-password" aria-label="Current Password" />
        <input id="card" type="text" autocomplete="cc-number" aria-describedby="card-desc" />
        <span id="card-desc">16 digit card number</span>
        <button id="pin-btn" data-sensitive="true" aria-label="Reveal PIN">Show</button>
      </div>
    `;

    fireEvent.click(
      screen.getByRole("button", { name: "Accessible Tooltips" }),
    );

    for (const id of ["#pw", "#curr-pw", "#card", "#pin-btn"]) {
      const el = host.querySelector(id)!;
      fireEvent.focusIn(el);
      const tooltip = document.querySelector(".arap-accessible-tooltip");
      expect(tooltip?.getAttribute("data-visible")).toBeNull();
    }
  });

  it("ignores decorative images with empty alt, aria-hidden, or role presentation", () => {
    const { host } = renderFeatures(<API.TooltipsController />);
    host.innerHTML = `
      <div>
        <img id="dec-1" src="blank.png" alt="" />
        <img id="dec-2" src="icon.png" alt="Icon" aria-hidden="true" />
        <img id="dec-3" src="dot.png" alt="Dot" role="presentation" />
        <img id="dec-4" src="box.png" alt="Box" role="none" />
      </div>
    `;

    fireEvent.click(
      screen.getByRole("button", { name: "Accessible Tooltips" }),
    );

    for (const id of ["#dec-1", "#dec-2", "#dec-3", "#dec-4"]) {
      const el = host.querySelector(id)!;
      fireEvent.pointerOver(el);
      const tooltip = document.querySelector(".arap-accessible-tooltip");
      expect(tooltip?.getAttribute("data-visible")).toBeNull();
    }
  });

  it("WCAG 1.4.13 Dismissible: Escape key dismisses active tooltip without losing focus", () => {
    const { host } = renderFeatures(<API.TooltipsController />);
    host.innerHTML = `
      <div>
        <button id="esc-btn" aria-label="Settings configuration">
          <svg />
        </button>
      </div>
    `;

    fireEvent.click(
      screen.getByRole("button", { name: "Accessible Tooltips" }),
    );

    const btn = host.querySelector("#esc-btn") as HTMLElement;
    btn.focus();
    fireEvent.focusIn(btn);

    const tooltip = document.querySelector(".arap-accessible-tooltip")!;
    expect(tooltip.getAttribute("data-visible")).toBe("true");

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape" });
    expect(tooltip.getAttribute("data-visible")).toBeNull();
    // Focus remains strictly on the button
    expect(document.activeElement).toBe(btn);

    // Moving pointer over the dismissed element does not reopen it until focus/pointer leaves
    fireEvent.pointerOver(btn);
    expect(tooltip.getAttribute("data-visible")).toBeNull();

    // Leaving and returning resets dismissal
    fireEvent.focusOut(btn);
    fireEvent.focusIn(btn);
    expect(tooltip.getAttribute("data-visible")).toBe("true");
  });

  it("WCAG 1.4.13 Hoverable: pointer can move over tooltip without closing", () => {
    const { host } = renderFeatures(<API.TooltipsController />);
    host.innerHTML = `
      <div>
        <button id="hover-btn" aria-label="Extended Help Info">Info</button>
      </div>
    `;

    fireEvent.click(
      screen.getByRole("button", { name: "Accessible Tooltips" }),
    );

    const btn = host.querySelector("#hover-btn")!;
    fireEvent.pointerOver(btn);

    const tooltip = document.querySelector(
      ".arap-accessible-tooltip",
    ) as HTMLElement;
    expect(tooltip.getAttribute("data-visible")).toBe("true");

    // Move pointer out of button towards tooltip
    fireEvent.pointerOut(btn, { relatedTarget: tooltip });
    // Pointer enters tooltip before grace period expires
    fireEvent.pointerOver(tooltip);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Tooltip stays open!
    expect(tooltip.getAttribute("data-visible")).toBe("true");

    // When pointer leaves tooltip entirely
    fireEvent.pointerOut(tooltip, { relatedTarget: document.body });
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(tooltip.getAttribute("data-visible")).toBeNull();
  });

  it("maintains presentation role and aria-hidden to prevent redundant AT announcements", () => {
    const { host } = renderFeatures(<API.TooltipsController />);
    host.innerHTML = `
      <div>
        <button id="at-btn" aria-label="User Profile"><svg /></button>
      </div>
    `;

    fireEvent.click(
      screen.getByRole("button", { name: "Accessible Tooltips" }),
    );

    const btn = host.querySelector("#at-btn")!;
    fireEvent.focusIn(btn);

    const tooltip = document.querySelector(".arap-accessible-tooltip");
    expect(tooltip?.getAttribute("role")).toBe("presentation");
    expect(tooltip?.getAttribute("aria-hidden")).toBe("true");
    expect(tooltip?.getAttribute("data-arap-ui")).toBe("true");
    expect(tooltip?.getAttribute("tabindex")).toBeNull();
  });

  it("clamps tooltip position within viewport and flips when near top boundary", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const tooltip = document.createElement("div");
    document.body.appendChild(tooltip);

    // Mock target near top: rect.top = 10, rect.bottom = 30
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
      top: 10,
      bottom: 30,
      left: 100,
      right: 200,
      width: 100,
      height: 20,
      x: 100,
      y: 10,
      toJSON: () => {},
    });

    // Mock tooltip size
    vi.spyOn(tooltip, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 30,
      left: 0,
      right: 150,
      width: 150,
      height: 30,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    API.positionTooltip(tooltip, target);

    // Flips to bottom because top (10 - 30 - 8 = -28) < gap (8)
    expect(tooltip.getAttribute("data-placement")).toBe("bottom");
    expect(tooltip.style.top).toBe("38px"); // 30 + 8
    expect(tooltip.style.left).toBe("75px"); // 100 + (100 - 150)/2 = 75

    target.remove();
    tooltip.remove();
  });

  it("removes tooltip DOM and event listeners on disable and unmount", () => {
    const { unmount } = renderFeatures(<API.TooltipsController />);
    const toggle = screen.getByRole("button", { name: "Accessible Tooltips" });

    fireEvent.click(toggle);
    expect(document.querySelector(".arap-accessible-tooltip")).not.toBeNull();

    // Disable feature
    fireEvent.click(toggle);
    expect(document.querySelector(".arap-accessible-tooltip")).toBeNull();

    // Enable again then unmount
    fireEvent.click(toggle);
    expect(document.querySelector(".arap-accessible-tooltip")).not.toBeNull();

    unmount();
    expect(document.querySelector(".arap-accessible-tooltip")).toBeNull();
  });
});
