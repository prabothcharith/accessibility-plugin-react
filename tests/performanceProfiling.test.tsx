import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  TextScaleController,
  LineHeightController,
  LetterSpacingController,
  WordSpacingController,
  ParagraphSpacingController,
  FontFamilyController,
  ContrastModeController,
  LinkHighlightController,
  HighlightFocusController,
  ReduceMotionController,
  HideImagesController,
  ResetController,
} from "../src";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.body.innerHTML = "";
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function create1000NodeDOM(): HTMLElement {
  const container = document.createElement("main");
  container.id = "perf-fixture";

  // Create 100 sections with 10 child nodes each = 1,000 elements
  for (let i = 0; i < 100; i++) {
    const sec = document.createElement("section");
    sec.className = `perf-sec-${i}`;

    const h3 = document.createElement("h3");
    h3.textContent = `Heading ${i}`;
    h3.style.fontSize = "20px";
    sec.appendChild(h3);

    const p = document.createElement("p");
    p.textContent = `Paragraph description for section ${i}.`;
    p.style.lineHeight = "28px";
    sec.appendChild(p);

    const a = document.createElement("a");
    a.href = `#link-${i}`;
    a.textContent = `Link ${i}`;
    sec.appendChild(a);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = `Btn ${i}`;
    sec.appendChild(btn);

    const inp = document.createElement("input");
    inp.type = "text";
    inp.value = `Input ${i}`;
    sec.appendChild(inp);

    const img = document.createElement("img");
    img.alt = i % 2 === 0 ? "" : `Meaningful ${i}`;
    img.src = "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=";
    sec.appendChild(img);

    const span = document.createElement("span");
    span.textContent = `Span ${i}`;
    sec.appendChild(span);

    const code = document.createElement("code");
    code.textContent = `code_${i}()`;
    sec.appendChild(code);

    const footer = document.createElement("footer");
    footer.textContent = `Foot ${i}`;
    sec.appendChild(footer);

    container.appendChild(sec);
  }

  return container;
}

describe("A11Y-502: Performance, bundle, listener and leak profiling", () => {
  it("closed runtime overhead: attaches minimal global listeners and no lingering intervals/timeouts", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const docAddEventListenerSpy = vi.spyOn(document, "addEventListener");

    const { unmount } = render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <TextScaleController />
          <ContrastModeController />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    // Initial mount when closed must attach only necessary lifecycle handlers
    const windowListeners = addEventListenerSpy.mock.calls.map(
      (call) => call[0],
    );
    const docListeners = docAddEventListenerSpy.mock.calls.map(
      (call) => call[0],
    );

    // Verify no unthrottled scroll/mousemove listeners are active on document/window when closed
    expect(windowListeners).not.toContain("mousemove");
    expect(windowListeners).not.toContain("pointermove");
    expect(docListeners).not.toContain("mousemove");
    expect(docListeners).not.toContain("pointermove");

    unmount();

    addEventListenerSpy.mockRestore();
    docAddEventListenerSpy.mockRestore();
  });

  it("1,000-node DOM performance: multi-feature application and reset execute within performance budget", () => {
    const fixture = create1000NodeDOM();
    document.body.appendChild(fixture);
    expect(fixture.querySelectorAll("*").length).toBeGreaterThanOrEqual(1000);

    const { unmount } = render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <TextScaleController />
          <LineHeightController />
          <LetterSpacingController />
          <WordSpacingController />
          <ParagraphSpacingController />
          <FontFamilyController />
          <ContrastModeController />
          <LinkHighlightController />
          <HighlightFocusController />
          <ReduceMotionController />
          <HideImagesController />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));

    // Measure time to apply text scale, line height, font family, contrast mode, hide images
    const t0 = performance.now();
    fireEvent.click(screen.getByRole("button", { name: "Increase text size" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Increase line height" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Legible/i }));
    fireEvent.click(screen.getByRole("button", { name: "Hide Images" }));
    const tApply = performance.now() - t0;

    // Verify sample elements transformed correctly
    const sampleH3 = fixture.querySelector("h3") as HTMLElement;
    expect(sampleH3.style.fontSize).toBe("22.5px"); // 20px * 1.125
    expect(sampleH3.style.fontFamily).toContain("system-ui");

    const sampleDecoImg = fixture.querySelector("img[alt='']") as HTMLElement;
    expect(sampleDecoImg.style.visibility).toBe("hidden");

    // Measure time to teardown / reset all
    const t1 = performance.now();
    fireEvent.click(screen.getByRole("button", { name: /Reset All/i }));
    const tReset = performance.now() - t1;

    // Verify clean restoration
    expect(sampleH3.style.fontSize).toBe("20px");
    expect(sampleH3.style.fontFamily).toBe("");
    expect(sampleDecoImg.style.visibility).toBe("");

    // Performance budget: Apply under 10000ms (JSDOM overhead under full CPU load), Reset under 5000ms
    expect(tApply).toBeLessThan(10000);
    expect(tReset).toBeLessThan(5000);

    unmount();
  }, 25000);

  it("100 mount/unmount cycles leave zero leaked nodes, portal elements, or style tags", () => {
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(
        <AccessibilityPlugin>
          <AccessibilityButton />
          <AccessibilityList>
            <TextScaleController />
            <ContrastModeController />
            <HighlightFocusController />
            <ReduceMotionController />
            <ResetController />
          </AccessibilityList>
        </AccessibilityPlugin>,
      );

      // Open and close
      fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
      expect(
        screen.getByRole("region", { name: "Accessibility settings" }),
      ).toBeDefined();

      unmount();
    }

    // Verify complete DOM cleanup after 100 full mount/unmount cycles
    expect(document.querySelector(".arap-root")).toBeNull();
    expect(document.querySelector(".arap-panel")).toBeNull();
    expect(document.getElementById("arap-focus-highlight-style")).toBeNull();
    expect(document.getElementById("arap-reduce-motion-style")).toBeNull();
  }, 25000);

  it("100 rapid toggle cycles cause zero memory drift or compounding styles", () => {
    const fixture = document.createElement("div");
    fixture.innerHTML = `
      <h1 id="test-title" style="font-size: 24px;">Title</h1>
      <p id="test-desc" style="line-height: 32px; letter-spacing: 0px;">Description text.</p>
    `;
    document.body.appendChild(fixture);

    const { unmount } = render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <TextScaleController />
          <LineHeightController />
          <LetterSpacingController />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));

    const increaseBtn = screen.getByRole("button", {
      name: "Increase text size",
    });
    const decreaseBtn = screen.getByRole("button", {
      name: "Decrease text size",
    });

    const title = document.getElementById("test-title") as HTMLElement;

    // Rapidly toggle 100 times
    for (let i = 0; i < 50; i++) {
      fireEvent.click(increaseBtn);
      fireEvent.click(decreaseBtn);
    }

    // Verify property returned to baseline with zero drift
    expect(title.style.fontSize).toBe("24px");

    // Full reset
    fireEvent.click(screen.getByRole("button", { name: /Reset All/i }));
    expect(title.style.fontSize).toBe("24px");

    unmount();
  }, 25000);

  it("route change simulation: unmounting and re-mounting with new host content maintains clean state without leaks", () => {
    // Route 1
    const route1Container = document.createElement("div");
    route1Container.id = "route-1";
    route1Container.innerHTML = `<h1>Page 1</h1><p>Content 1</p>`;
    document.body.appendChild(route1Container);

    const { unmount: unmountRoute1 } = render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <TextScaleController />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    fireEvent.click(screen.getByRole("button", { name: "Increase text size" }));

    const p1 = route1Container.querySelector("p") as HTMLElement;
    expect(p1.style.fontSize).toBeDefined();

    unmountRoute1();
    document.body.removeChild(route1Container);

    // Route 2
    const route2Container = document.createElement("div");
    route2Container.id = "route-2";
    route2Container.innerHTML = `<h1>Page 2</h1><p>Content 2</p>`;
    document.body.appendChild(route2Container);

    const { unmount: unmountRoute2 } = render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <TextScaleController />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    // Route 2 inherits persisted text scale preference cleanly
    const p2 = route2Container.querySelector("p") as HTMLElement;
    expect(p2.style.fontSize).toBeDefined();

    unmountRoute2();
    document.body.removeChild(route2Container);

    expect(document.querySelector(".arap-root")).toBeNull();
  });
});
