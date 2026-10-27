import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent, cleanup, render, waitFor, act } from "@testing-library/react";
import * as API from "../src";
import { Widget } from "./helpers";

describe("Smart Contrast Controller Widget (A11Y-407)", () => {
  let host: HTMLElement;

  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.body.innerHTML = "";
    host = document.createElement("main");
    host.id = "test-host";
    host.style.backgroundColor = "#ffffff";
    host.innerHTML = `
      <h1>Smart Contrast Heading</h1>
      <p id="faded-text" style="color: rgb(210, 210, 210);">Faded low contrast paragraph</p>
      <div id="gradient-box" style="background-image: linear-gradient(to right, #f00, #00f);">
        <span id="grad-text">Gradient text</span>
      </div>
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

  it("renders smart contrast controller with segmented levels and prototype pill", () => {
    renderWidget(<API.SmartContrastController />);

    expect(screen.getByRole("group", { name: "Smart Contrast" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Original/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /AA \(4\.5:1\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /AAA \(7\.0:1\)/i })).toBeInTheDocument();

    expect(screen.getByText("Prototype")).toBeInTheDocument();
    expect(screen.getByText(API.SMART_CONTRAST_DISCLAIMER)).toBeInTheDocument();

    const origBtn = screen.getByRole("button", { name: /Original/i });
    expect(origBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("activates AA smart contrast mode, enhances low-contrast elements, and restores on reset", async () => {
    renderWidget(<API.SmartContrastController />);

    const aaBtn = screen.getByRole("button", { name: /AA \(4\.5:1\)/i });
    fireEvent.click(aaBtn);

    expect(aaBtn).toHaveAttribute("aria-pressed", "true");

    const fadedP = document.getElementById("faded-text")!;
    await waitFor(() => {
      // Enhanced to high-contrast dark slate token on white background
      expect(fadedP.style.color).toBe("rgb(15, 23, 42)");
    });

    // Revert to original
    const origBtn = screen.getByRole("button", { name: /Original/i });
    fireEvent.click(origBtn);

    expect(origBtn).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => {
      expect(fadedP.style.color).toBe("rgb(210, 210, 210)");
    });
  });

  it("activates AAA smart contrast mode", async () => {
    renderWidget(<API.SmartContrastController />);

    const aaaBtn = screen.getByRole("button", { name: /AAA \(7\.0:1\)/i });
    fireEvent.click(aaaBtn);

    expect(aaaBtn).toHaveAttribute("aria-pressed", "true");
    const fadedP = document.getElementById("faded-text")!;
    await waitFor(() => {
      expect(fadedP.style.color).toBe("rgb(15, 23, 42)");
    });
  });

  it("displays live evaluation statistics and toggleable unsupported details", async () => {
    renderWidget(<API.SmartContrastController />);

    const aaBtn = screen.getByRole("button", { name: /AA \(4\.5:1\)/i });
    fireEvent.click(aaBtn);

    // Simulate smart contrast report event
    act(() => {
      document.dispatchEvent(
        new CustomEvent("arap:smart-contrast-report", {
          detail: {
            evaluatedCount: 2,
            adjustedCount: 1,
            sufficientCount: 0,
            unsupportedCount: 1,
            unsupportedElements: [
              {
                tag: "span",
                id: "grad-text",
                reason: "gradient",
                textSnippet: "Gradient text",
              },
            ],
            durationMs: 4.2,
            targetLevel: "aa",
            targetRatioNormal: 4.5,
            targetRatioLarge: 3.0,
            disclaimer: API.SMART_CONTRAST_DISCLAIMER,
          },
        }),
      );
    });

    await waitFor(() => {
      const statsEl = document.querySelector(".arap-smart-contrast-stats");
      expect(statsEl).not.toBeNull();
      expect(statsEl).toHaveTextContent(/adjusted/i);
      expect(statsEl).toHaveTextContent(/unsupported/i);
    });

    // Toggle unsupported details
    const detailsToggle = screen.getByRole("button", {
      name: /Show unsupported elements/i,
    });
    fireEvent.click(detailsToggle);

    expect(screen.getByRole("list", { name: "Unsupported elements" })).toBeInTheDocument();
    expect(screen.getByText("gradient")).toBeInTheDocument();

    // Toggle hide
    fireEvent.click(
      screen.getByRole("button", { name: /Hide unsupported details/i }),
    );
    expect(
      screen.queryByRole("list", { name: "Unsupported elements" }),
    ).not.toBeInTheDocument();
  });

  it("displays forced-colors notice and respects operating system theme", () => {
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

    renderWidget(<API.SmartContrastController />);

    expect(
      screen.getByText(/operating system high contrast/i),
    ).toBeInTheDocument();

    window.matchMedia = originalMatchMedia;
  });
});
