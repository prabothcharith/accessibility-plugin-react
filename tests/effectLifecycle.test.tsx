import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { StrictMode } from "react";
import * as API from "../src";
import { Widget } from "./helpers";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("A11Y-102 Scoped effect manager and cleanup lifecycle", () => {
  it("enable -> update -> disable -> unmount -> remount leaves no stale effects or compounding", () => {
    // 1. Setup host container with initial inline styles
    const host = document.createElement("main");
    host.innerHTML = `
      <h1 style="font-size: 20px; line-height: 30px;">Heading</h1>
      <p style="font-size: 16px; line-height: 24px;">Paragraph</p>
    `;
    document.body.appendChild(host);

    const h1 = host.querySelector("h1") as HTMLElement;
    const p = host.querySelector("p") as HTMLElement;

    expect(h1.style.fontSize).toBe("20px");
    expect(h1.style.lineHeight).toBe("30px");
    expect(p.style.fontSize).toBe("16px");
    expect(p.style.lineHeight).toBe("24px");

    // 2. Mount widget with FontSizeController
    const { unmount: unmount1 } = render(
      <Widget>
        <API.FontSizeController />
      </Widget>,
    );

    const trigger = screen.getByLabelText("Accessibility");
    fireEvent.click(trigger);

    // 3. ENABLE: step up to 110%
    const increaseBtn = screen.getByLabelText("Increase font size");
    fireEvent.click(increaseBtn);
    expect(h1.style.fontSize).toBe("22px");
    expect(h1.style.lineHeight).toBe("33px");
    expect(parseFloat(p.style.fontSize)).toBeCloseTo(17.6, 2);
    expect(parseFloat(p.style.lineHeight)).toBeCloseTo(26.4, 2);

    // 4. UPDATE: step up further to 130% (two more clicks)
    fireEvent.click(increaseBtn);
    fireEvent.click(increaseBtn);
    expect(h1.style.fontSize).toBe("26px");
    expect(h1.style.lineHeight).toBe("39px");
    expect(parseFloat(p.style.fontSize)).toBeCloseTo(20.8, 2);
    expect(parseFloat(p.style.lineHeight)).toBeCloseTo(31.2, 2);

    // 5. DISABLE: Reset all preferences
    const resetBtn = screen.getByText("Reset All");
    fireEvent.click(resetBtn);

    // Baseline styles must be precisely restored, not compounded or stale
    expect(h1.style.fontSize).toBe("20px");
    expect(h1.style.lineHeight).toBe("30px");
    expect(p.style.fontSize).toBe("16px");
    expect(p.style.lineHeight).toBe("24px");

    // 6. UNMOUNT: Unmount provider
    unmount1();
    expect(h1.style.fontSize).toBe("20px");
    expect(h1.style.lineHeight).toBe("30px");
    expect(p.style.fontSize).toBe("16px");
    expect(p.style.lineHeight).toBe("24px");

    // 7. REMOUNT: Remount provider with clean default state
    const { unmount: unmount2 } = render(
      <Widget>
        <API.FontSizeController />
      </Widget>,
    );
    expect(h1.style.fontSize).toBe("20px");
    expect(h1.style.lineHeight).toBe("30px");
    expect(p.style.fontSize).toBe("16px");
    expect(p.style.lineHeight).toBe("24px");

    unmount2();
  });

  it("filters compose deterministically and restore host filter on disable and unmount", () => {
    const host = document.createElement("section");
    host.style.filter = "brightness(0.9)";
    host.innerHTML = "<span>Content</span>";
    document.body.appendChild(host);

    const { unmount } = render(
      <Widget>
        <API.ContrastController />
        <API.GrayscaleController />
        <API.InvertColorsController />
      </Widget>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));

    // Enable grayscale
    fireEvent.click(screen.getByRole("button", { name: "Grayscale" }));
    expect(host.style.filter).toBe("brightness(0.9) grayscale(1)");

    // Update with contrast high
    fireEvent.click(screen.getByText("High"));
    expect(host.style.filter).toBe(
      "brightness(0.9) contrast(1.5) grayscale(1)",
    );

    // Update with invert colors
    fireEvent.click(screen.getByRole("button", { name: "Invert Colors" }));
    expect(host.style.filter).toBe(
      "brightness(0.9) contrast(1.5) invert(1) grayscale(1)",
    );

    // Disable grayscale
    fireEvent.click(screen.getByRole("button", { name: "Grayscale" }));
    expect(host.style.filter).toBe("brightness(0.9) contrast(1.5) invert(1)");

    // Reset all
    fireEvent.click(screen.getByText("Reset All"));
    expect(host.style.filter).toBe("brightness(0.9)");

    unmount();
    expect(host.style.filter).toBe("brightness(0.9)");
  });

  it("reading aids clean up overlays and listeners completely on toggle, unmount, and StrictMode", () => {
    const { unmount } = render(
      <StrictMode>
        <Widget>
          <API.ReadingGuideController />
          <API.ReadingMaskController />
        </Widget>
      </StrictMode>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));

    // Enable reading guide
    fireEvent.click(screen.getByRole("button", { name: "Reading Guide" }));
    const guide = document.querySelector(".arap-reading-guide") as HTMLElement;
    expect(guide).not.toBeNull();
    expect(guide).toHaveAttribute("aria-hidden", "true");

    // Switching to reading mask cleans up guide and mounts mask
    fireEvent.click(screen.getByRole("button", { name: "Reading Guide" }));
    fireEvent.click(screen.getByRole("button", { name: "Reading Mask" }));
    expect(document.querySelector(".arap-reading-guide")).toBeNull();
    const mask = document.querySelector(".arap-reading-mask") as HTMLElement;
    expect(mask).not.toBeNull();

    // Disable reading mask
    fireEvent.click(screen.getByRole("button", { name: "Reading Mask" }));
    expect(document.querySelector(".arap-reading-mask")).toBeNull();

    // Re-enable and verify unmount cleanup
    fireEvent.click(screen.getByRole("button", { name: "Reading Guide" }));
    expect(document.querySelector(".arap-reading-guide")).not.toBeNull();
    unmount();
    expect(document.querySelector(".arap-reading-guide")).toBeNull();
  });

  it("excludes template, noscript, and arap UI elements from host styling", () => {
    const host = document.createElement("div");
    host.innerHTML = `
      <template><p style="font-size: 14px">In template</p></template>
      <noscript><p style="font-size: 14px">In noscript</p></noscript>
      <p style="font-size: 14px">Regular paragraph</p>
    `;
    document.body.appendChild(host);

    render(
      <Widget>
        <API.FontSizeController />
      </Widget>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));
    fireEvent.click(screen.getByLabelText("Increase font size"));

    const regularP = host.querySelector(
      "p:not(template p):not(noscript p)",
    ) as HTMLElement;
    expect(parseFloat(regularP.style.fontSize)).toBeCloseTo(15.4, 2);

    const templateContent = host.querySelector("template")?.content;
    const templateP = templateContent?.querySelector("p");
    if (templateP) {
      expect(templateP.style.fontSize).toBe("14px");
    }
  });

  it("custom effect apply and cleanup cycle works reliably across state changes and unmount", () => {
    const cleanups: string[] = [];
    const applies: string[] = [];

    function CustomTestComponent() {
      const { value, setValue } = API.useAccessibility("custom-lifecycle", 1, {
        apply: (val) => {
          applies.push(`apply-${val}`);
          return () => {
            cleanups.push(`cleanup-${val}`);
          };
        },
      });

      return (
        <button onClick={() => setValue(Number(value) + 1)}>
          Increment Custom {String(value)}
        </button>
      );
    }

    const { unmount } = render(
      <API.AccessibilityPlugin>
        <CustomTestComponent />
      </API.AccessibilityPlugin>,
    );

    expect(applies).toContain("apply-1");
    expect(cleanups).toHaveLength(0);

    // Update state
    fireEvent.click(screen.getByText("Increment Custom 1"));
    expect(cleanups).toContain("cleanup-1");
    expect(applies).toContain("apply-2");

    // Unmount
    unmount();
    expect(cleanups).toContain("cleanup-2");
  });
});
