import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent, cleanup, render } from "@testing-library/react";
import * as API from "../src";
import { isForcedColorsActive, isProtectedFromContrast } from "../src";
import { Widget } from "./helpers";

describe("Contrast Modes and Forced Colors Protection", () => {
  let host: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    host = document.createElement("main");
    host.id = "test-host";
    host.innerHTML = `
      <h1>Contrast Test Heading</h1>
      <p id="test-p">Standard paragraph</p>
      <a href="#" id="test-link">Accessible link</a>
      <button id="test-btn" type="button">Active Button</button>
      <button id="test-btn-disabled" type="button" disabled>Disabled Button</button>
      <input id="test-input-invalid" type="text" aria-invalid="true" value="Wrong" />
      <img id="test-img" alt="Sample photo" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3C/svg%3E" />
      <svg id="test-svg" width="20" height="20"><circle cx="10" cy="10" r="8" fill="red"/></svg>
      <span data-icon id="test-icon">★</span>
      <div id="test-chart" role="img" aria-label="Sales Chart">Chart Area</div>
    `;
    document.body.appendChild(host);
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  function renderWidget(children: React.ReactNode) {
    const result = render(<Widget>{children}</Widget>);
    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    return result;
  }

  describe("Semantic Contrast Modes", () => {
    it("applies Dark contrast mode tokens and restores on reset", () => {
      renderWidget(<API.ContrastModeController />);
      const darkBtn = screen.getByRole("button", { name: /Dark/i });
      fireEvent.click(darkBtn);

      const p = document.getElementById("test-p")!;
      expect(p.style.color).toBe("rgb(248, 250, 252)"); // #f8fafc
      expect(host.style.backgroundColor).toBe("rgb(15, 23, 42)"); // #0f172a

      const origBtn = screen.getByRole("button", { name: /Original/i });
      fireEvent.click(origBtn);

      expect(p.style.color).toBe("");
      expect(host.style.backgroundColor).toBe("");
    });

    it("applies Light contrast mode tokens", () => {
      renderWidget(<API.ContrastModeController />);
      const lightBtn = screen.getByRole("button", { name: /Light/i });
      fireEvent.click(lightBtn);

      const p = document.getElementById("test-p")!;
      expect(p.style.color).toBe("rgb(15, 23, 42)"); // #0f172a
      expect(host.style.backgroundColor).toBe("rgb(255, 255, 255)"); // #ffffff
    });

    it("applies High contrast mode tokens with distinct link color", () => {
      renderWidget(<API.ContrastModeController />);
      const highBtn = screen.getByRole("button", { name: /High/i });
      fireEvent.click(highBtn);

      const p = document.getElementById("test-p")!;
      const link = document.getElementById("test-link")!;
      expect(p.style.color).toBe("rgb(255, 255, 255)"); // #ffffff
      expect(host.style.backgroundColor).toBe("rgb(0, 0, 0)"); // #000000
      expect(link.style.color).toBe("rgb(147, 197, 253)"); // #93c5fd
    });

    it("applies Invert mode to page while countering inversion on media elements", () => {
      renderWidget(<API.ContrastModeController />);
      const invertBtn = screen.getByRole("button", { name: /Invert/i });
      fireEvent.click(invertBtn);

      expect(host.style.filter).toContain("invert(1)");

      // Media elements must be counter-inverted to preserve original colors
      const img = document.getElementById("test-img")!;
      const chart = document.getElementById("test-chart")!;
      expect(img.style.filter).toBe("invert(1)");
      expect(chart.style.filter).toBe("invert(1)");

      const origBtn = screen.getByRole("button", { name: /Original/i });
      fireEvent.click(origBtn);

      expect(host.style.filter).not.toContain("invert(1)");
      expect(img.style.filter).toBe("");
      expect(chart.style.filter).toBe("");
    });
  });

  describe("Protected Elements & Validation Preservation", () => {
    it("preserves images, svgs, and icons from background/color overrides", () => {
      renderWidget(<API.ContrastModeController />);
      const highBtn = screen.getByRole("button", { name: /High/i });
      fireEvent.click(highBtn);

      const img = document.getElementById("test-img")!;
      const svg = document.getElementById("test-svg")!;
      const icon = document.getElementById("test-icon")!;

      expect(isProtectedFromContrast(img)).toBe(true);
      expect(isProtectedFromContrast(svg)).toBe(true);
      expect(isProtectedFromContrast(icon)).toBe(true);

      expect(img.style.backgroundColor).toBe("");
      expect(svg.style.backgroundColor).toBe("");
      expect(icon.style.backgroundColor).toBe("");
    });

    it("preserves form validation error states", () => {
      renderWidget(<API.ContrastModeController />);
      const highBtn = screen.getByRole("button", { name: /High/i });
      fireEvent.click(highBtn);

      const invalidInput = document.getElementById("test-input-invalid")!;
      expect(isProtectedFromContrast(invalidInput)).toBe(true);
      expect(invalidInput.style.color).toBe("");
      expect(invalidInput.style.backgroundColor).toBe("");
    });

    it("preserves disabled control states", () => {
      renderWidget(<API.ContrastModeController />);
      const highBtn = screen.getByRole("button", { name: /High/i });
      fireEvent.click(highBtn);

      const disabledBtn = document.getElementById("test-btn-disabled")!;
      expect(isProtectedFromContrast(disabledBtn)).toBe(true);
      expect(disabledBtn.style.color).toBe("");
    });
  });

  describe("Native Forced-Colors (High Contrast) Protection", () => {
    it("detects forced-colors and avoids overriding native OS colors", () => {
      // Mock window.matchMedia for forced-colors: active
      const originalMatchMedia = window.matchMedia;
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

      expect(isForcedColorsActive()).toBe(true);

      renderWidget(<API.ContrastModeController />);

      // Notice should be visible informing user that OS forced colors is active
      expect(
        screen.getByText(/operating system high contrast/i),
      ).toBeInTheDocument();

      // Triggering dark mode should NOT inject inline colors or filters over OS forced-colors
      const darkBtn = screen.getByRole("button", { name: /Dark/i });
      fireEvent.click(darkBtn);

      const p = document.getElementById("test-p")!;
      expect(p.style.color).toBe("");
      expect(host.style.backgroundColor).toBe("");
      expect(host.style.filter).toBe("");

      window.matchMedia = originalMatchMedia;
    });
  });
});
