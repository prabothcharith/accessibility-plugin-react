import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  AccessibilityPlugin,
  BigCursorController,
  ReadingMaskController,
  ReadingGuideController,
  hasFinePointer,
  ResetController,
} from "../src";

function TestFixture({ children }: { children?: React.ReactNode }) {
  return (
    <AccessibilityPlugin>
      <div data-testid="host-content">
        <h1>Heading for Reading Aid</h1>
        <p data-testid="test-paragraph">
          This is readable host paragraph text that should remain selectable and
          clickable at all times without overlay obstruction.
        </p>
        <button data-testid="host-btn" type="button" onClick={() => {}}>
          Host Action Button
        </button>
        <a data-testid="host-link" href="#section">
          Host Navigation Link
        </a>
      </div>
      {children}
    </AccessibilityPlugin>
  );
}

describe("A11Y-301: Cursor enlargement, reading mask and reading guide", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    cleanup();
    localStorage.clear();
    originalMatchMedia = window.matchMedia;
    document
      .querySelectorAll(".arap-reading-mask, .arap-reading-guide")
      .forEach((el) => el.remove());
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    window.matchMedia = originalMatchMedia;
    document
      .querySelectorAll(".arap-reading-mask, .arap-reading-guide")
      .forEach((el) => el.remove());
  });

  describe("Capability-aware big cursor", () => {
    it("detects fine pointer capability accurately", () => {
      // Default in test environment (fine pointer)
      expect(hasFinePointer()).toBe(true);

      // Explicit coarse-only device mock (mobile touch)
      window.matchMedia = vi.fn().mockImplementation((query: string) => {
        if (query === "(pointer: fine)") {
          return {
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          };
        }
        if (query === "(pointer: coarse)") {
          return {
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          };
        }
        return {
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      });

      expect(hasFinePointer()).toBe(false);

      // Laptop with touchscreen + trackpad
      window.matchMedia = vi.fn().mockImplementation((query: string) => {
        if (query === "(pointer: fine)") {
          return {
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          };
        }
        if (query === "(pointer: coarse)") {
          return {
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          };
        }
        return {
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      });

      expect(hasFinePointer()).toBe(true);
    });

    it("applies cursor to body and host elements when fine pointer is active", () => {
      render(
        <TestFixture>
          <BigCursorController />
        </TestFixture>,
      );

      const toggle = screen.getByRole("button", { name: "Big Cursor" });
      fireEvent.click(toggle);

      const link = screen.getByTestId("host-link");
      expect(document.body.style.cursor).toContain("data:image/svg+xml");
      expect(link.style.cursor).toContain("data:image/svg+xml");

      // Toggle off restores baseline
      fireEvent.click(toggle);
      expect(document.body.style.cursor).toBe("");
      expect(link.style.cursor).toBe("");
    });

    it("suppresses custom cursor styling on touch-only hardware", () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => {
        if (query === "(pointer: fine)") {
          return {
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          };
        }
        if (query === "(pointer: coarse)") {
          return {
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          };
        }
        return {
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
      });

      render(
        <TestFixture>
          <BigCursorController />
        </TestFixture>,
      );

      const toggle = screen.getByRole("button", { name: "Big Cursor" });
      fireEvent.click(toggle);

      // Cursor styling should NOT be injected on touch-only devices
      const link = screen.getByTestId("host-link");
      expect(document.body.style.cursor).toBe("");
      expect(link.style.cursor).toBe("");

      // Shows capability hint
      expect(screen.getByText("(Mouse)")).toBeDefined();
    });
  });

  describe("Pointer-events-none Reading Guide", () => {
    it("renders with pointer-events: none and does not block clicks, text selection or focus", () => {
      const clickHandler = vi.fn();
      render(
        <TestFixture>
          <ReadingGuideController />
        </TestFixture>,
      );

      const hostBtn = screen.getByTestId("host-btn");
      hostBtn.onclick = clickHandler;

      const toggle = screen.getByRole("button", { name: "Reading Guide" });
      fireEvent.click(toggle);

      const guide = document.querySelector(
        ".arap-reading-guide",
      ) as HTMLElement;
      expect(guide).not.toBeNull();
      expect(guide).toHaveAttribute("aria-hidden", "true");
      expect(guide.style.pointerEvents).toBe("none");

      // Clicking through overlay directly triggers host action
      fireEvent.click(hostBtn);
      expect(clickHandler).toHaveBeenCalledTimes(1);

      // Focus sequence reaches host button without interference
      hostBtn.focus();
      expect(document.activeElement).toBe(hostBtn);
    });

    it("tracks pointer and touch movements across viewport", () => {
      render(
        <TestFixture>
          <ReadingGuideController />
        </TestFixture>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Reading Guide" }));
      const guide = document.querySelector(
        ".arap-reading-guide",
      ) as HTMLElement;
      expect(guide).not.toBeNull();

      // Mousemove tracks Y coordinate
      fireEvent.mouseMove(document, { clientY: 250 });
      expect(guide.style.top).toBe("250px");

      // Touch alternative moves guide on touchmove
      fireEvent.touchMove(document, {
        touches: [{ clientY: 380 } as Touch],
      });
      expect(guide.style.top).toBe("380px");
    });

    it("tracks keyboard focusin and updates viewport position during scroll", () => {
      render(
        <TestFixture>
          <ReadingGuideController />
        </TestFixture>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Reading Guide" }));
      const guide = document.querySelector(
        ".arap-reading-guide",
      ) as HTMLElement;

      const hostBtn = screen.getByTestId("host-btn");
      vi.spyOn(hostBtn, "getBoundingClientRect").mockReturnValue({
        top: 200,
        height: 40,
        bottom: 240,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 200,
        toJSON: () => {},
      });

      // Focus in on host button centers guide on button vertical center (200 + 20 = 220)
      fireEvent.focusIn(hostBtn);
      expect(guide.style.top).toBe("220px");

      // Scroll event while button has focus updates tracking position
      vi.spyOn(hostBtn, "getBoundingClientRect").mockReturnValue({
        top: 150,
        height: 40,
        bottom: 190,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 150,
        toJSON: () => {},
      });
      fireEvent.scroll(window);
      expect(guide.style.top).toBe("170px");
    });

    it("Escape key dismisses the guide and updates toggle state", () => {
      render(
        <TestFixture>
          <ReadingGuideController />
        </TestFixture>,
      );

      const toggle = screen.getByRole("button", { name: "Reading Guide" });
      fireEvent.click(toggle);
      expect(document.querySelector(".arap-reading-guide")).not.toBeNull();
      expect(toggle).toHaveAttribute("aria-pressed", "true");

      // Press Escape on page
      fireEvent.keyDown(window, { key: "Escape" });
      expect(document.querySelector(".arap-reading-guide")).toBeNull();
    });

    it("supports keyboard nudging via Alt+ArrowUp and Alt+ArrowDown and controller buttons", () => {
      render(
        <TestFixture>
          <ReadingGuideController />
        </TestFixture>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Reading Guide" }));
      const guide = document.querySelector(
        ".arap-reading-guide",
      ) as HTMLElement;

      fireEvent.mouseMove(document, { clientY: 300 });
      const topBefore = parseInt(guide.style.top, 10);

      // Keyboard Alt+ArrowDown nudges down by 30px
      fireEvent.keyDown(window, { key: "ArrowDown", altKey: true });
      expect(parseInt(guide.style.top, 10)).toBe(topBefore + 30);

      // Keyboard Alt+ArrowUp nudges up by 30px
      fireEvent.keyDown(window, { key: "ArrowUp", altKey: true });
      expect(parseInt(guide.style.top, 10)).toBe(topBefore);

      // Nudge Up button in controller
      fireEvent.click(
        screen.getByRole("button", { name: "Move reading guide up" }),
      );
      expect(parseInt(guide.style.top, 10)).toBe(topBefore - 30);

      // Nudge Down button in controller
      fireEvent.click(
        screen.getByRole("button", { name: "Move reading guide down" }),
      );
      expect(parseInt(guide.style.top, 10)).toBe(topBefore);
    });
  });

  describe("Adjustable Reading Mask", () => {
    it("renders with transparent aperture and surrounding viewport shadow", () => {
      render(
        <TestFixture>
          <ReadingMaskController />
        </TestFixture>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Reading Mask" }));
      const mask = document.querySelector(".arap-reading-mask") as HTMLElement;
      expect(mask).not.toBeNull();
      expect(mask).toHaveAttribute("aria-hidden", "true");
      expect(mask.style.pointerEvents).toBe("none");
      expect(mask.style.background).toBe("transparent");
      expect(mask.style.boxShadow).toContain("200vmax");
      expect(mask.style.height).toBe("100px"); // default aperture
    });

    it("allows adjusting mask window height via stepper buttons", () => {
      render(
        <TestFixture>
          <ReadingMaskController minHeight={40} maxHeight={200} step={20} />
        </TestFixture>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Reading Mask" }));
      const mask = document.querySelector(".arap-reading-mask") as HTMLElement;
      expect(mask.style.height).toBe("100px");

      const increase = screen.getByRole("button", {
        name: "Increase reading mask height",
      });
      const decrease = screen.getByRole("button", {
        name: "Decrease reading mask height",
      });

      // Increase height: 100 -> 120px
      fireEvent.click(increase);
      const updatedMask1 = document.querySelector(
        ".arap-reading-mask",
      ) as HTMLElement;
      expect(updatedMask1.style.height).toBe("120px");

      // Decrease height: 120 -> 100 -> 80px
      fireEvent.click(decrease);
      fireEvent.click(decrease);
      const updatedMask2 = document.querySelector(
        ".arap-reading-mask",
      ) as HTMLElement;
      expect(updatedMask2.style.height).toBe("80px");
    });

    it("tracks pointer and touch movements and Escape dismisses cleanly", () => {
      render(
        <TestFixture>
          <ReadingMaskController />
        </TestFixture>,
      );

      const toggle = screen.getByRole("button", { name: "Reading Mask" });
      fireEvent.click(toggle);
      const mask = document.querySelector(".arap-reading-mask") as HTMLElement;

      fireEvent.mouseMove(document, { clientY: 200 });
      // 200 - 50 (half of 100px) = 150px
      expect(mask.style.top).toBe("150px");

      // Touch dragging moves mask
      fireEvent.touchMove(document, {
        touches: [{ clientY: 350 } as Touch],
      });
      expect(mask.style.top).toBe("300px");

      // Escape key dismisses mask
      fireEvent.keyDown(window, { key: "Escape" });
      expect(document.querySelector(".arap-reading-mask")).toBeNull();
    });

    it("preserves clickability and text selection on underlying content", () => {
      const clickHandler = vi.fn();
      render(
        <TestFixture>
          <ReadingMaskController />
        </TestFixture>,
      );

      const hostBtn = screen.getByTestId("host-btn");
      hostBtn.onclick = clickHandler;

      fireEvent.click(screen.getByRole("button", { name: "Reading Mask" }));

      // Clicking host button through reading mask overlay
      fireEvent.click(hostBtn);
      expect(clickHandler).toHaveBeenCalledTimes(1);

      // Verify pointer events remains none on mask
      const mask = document.querySelector(".arap-reading-mask") as HTMLElement;
      expect(mask.style.pointerEvents).toBe("none");
    });

    it("supports nudge buttons for keyboard/touch positioning", () => {
      render(
        <TestFixture>
          <ReadingMaskController />
        </TestFixture>,
      );

      fireEvent.click(screen.getByRole("button", { name: "Reading Mask" }));
      const mask = document.querySelector(".arap-reading-mask") as HTMLElement;

      fireEvent.mouseMove(document, { clientY: 300 });
      const topBefore = parseInt(mask.style.top, 10);

      // Move window down
      fireEvent.click(
        screen.getByRole("button", { name: "Move reading mask down" }),
      );
      expect(parseInt(mask.style.top, 10)).toBe(topBefore + 30);

      // Move window up
      fireEvent.click(
        screen.getByRole("button", { name: "Move reading mask up" }),
      );
      expect(parseInt(mask.style.top, 10)).toBe(topBefore);
    });
  });

  describe("Lifecycle and Reset", () => {
    it("cleans up overlays and listeners completely on Reset All", () => {
      render(
        <TestFixture>
          <ReadingGuideController />
          <ReadingMaskController />
          <ResetController />
        </TestFixture>,
      );

      // Enable guide
      fireEvent.click(screen.getByRole("button", { name: "Reading Guide" }));
      expect(document.querySelector(".arap-reading-guide")).not.toBeNull();

      // Reset All removes guide overlay
      fireEvent.click(screen.getByRole("button", { name: "Reset All" }));
      expect(document.querySelector(".arap-reading-guide")).toBeNull();
      expect(document.querySelector(".arap-reading-mask")).toBeNull();
    });
  });
});
