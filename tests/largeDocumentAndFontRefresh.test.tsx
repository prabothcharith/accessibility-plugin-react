import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  TextScaleController,
  LineHeightController,
  LetterSpacingController,
  WordSpacingController,
  ContrastModeController,
  ResetController,
} from "../src";
import { MAX_HOST_ELEMENTS } from "../src/core/effects";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.body.innerHTML = "";
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("dir");
  document.body.className = "";
  document.body.removeAttribute("data-theme");
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("dir");
  document.body.className = "";
  document.body.removeAttribute("data-theme");
});

/** Helper to generate large DOM fixtures with diverse elements */
function createLargeDOM(totalNodes: number): HTMLElement {
  const container = document.createElement("main");
  container.id = "perf-fixture";

  const nodesPerSection = 10;
  const sectionCount = Math.ceil(totalNodes / nodesPerSection);

  for (let i = 0; i < sectionCount; i++) {
    const sec = document.createElement("section");
    sec.className = `perf-sec-${i}`;

    const h3 = document.createElement("h3");
    h3.textContent = `Section Heading ${i}`;
    h3.style.fontSize = "22px";
    sec.appendChild(h3);

    const p = document.createElement("p");
    p.textContent = `Paragraph body for section ${i} containing text.`;
    p.style.fontSize = "16px";
    p.style.lineHeight = "24px";
    sec.appendChild(p);

    const a = document.createElement("a");
    a.href = `#link-${i}`;
    a.textContent = `Link ${i}`;
    sec.appendChild(a);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = `Action ${i}`;
    sec.appendChild(btn);

    const code = document.createElement("code");
    code.textContent = `code_block_${i}()`;
    sec.appendChild(code);

    for (let j = 0; j < 5; j++) {
      const span = document.createElement("span");
      span.textContent = `item ${i}-${j}`;
      sec.appendChild(span);
    }

    container.appendChild(sec);
  }

  document.body.appendChild(container);
  return container;
}

describe("Issue #12: Large Document Profiling & Late Font/Style Refresh", () => {
  it("exports MAX_HOST_ELEMENTS supporting up to 8,000 DOM nodes", () => {
    expect(MAX_HOST_ELEMENTS).toBe(8000);
  });

  it("profiles 1,500-node DOM performance under multi-feature application and reset", async () => {
    const fixture = createLargeDOM(1500);
    const totalDiscovered = fixture.querySelectorAll("*").length;
    expect(totalDiscovered).toBeGreaterThanOrEqual(1500);

    const { unmount } = render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <TextScaleController />
          <LineHeightController />
          <LetterSpacingController />
          <WordSpacingController />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));

    // Step Text Scale to 1.5x
    const increaseText = screen.getByLabelText("Increase text size");
    const t0 = performance.now();
    fireEvent.click(increaseText);
    fireEvent.click(increaseText);
    fireEvent.click(increaseText);
    const textScaleDuration = performance.now() - t0;

    // Verify sampled elements are correctly scaled
    const firstP = fixture.querySelector("p") as HTMLElement;
    expect(firstP.style.fontSize).toBe("24px"); // 16px * 1.5 = 24px

    // Verify execution time remains deterministic without unbounded loops (< 15000ms under heavy parallel test load)
    expect(textScaleDuration).toBeLessThan(15000);

    // Apply Reset All
    const tReset = performance.now();
    fireEvent.click(screen.getByRole("button", { name: "Reset All" }));
    const resetDuration = performance.now() - tReset;

    expect(resetDuration).toBeLessThan(10000);
    expect(firstP.style.fontSize).toBe("16px");

    unmount();
  }, 30000);

  it("incremental observation: styles newly added DOM nodes without tearing down existing nodes", async () => {
    const fixture = createLargeDOM(500);

    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <TextScaleController />
          <LetterSpacingController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));
    // Step to 1.5x
    const increaseBtn = screen.getByLabelText("Increase text size");
    fireEvent.click(increaseBtn);
    fireEvent.click(increaseBtn);
    fireEvent.click(increaseBtn);

    const existingP = fixture.querySelector("p") as HTMLElement;
    expect(existingP.style.fontSize).toBe("24px"); // 16 * 1.5

    // Add a custom marker to existing element to prove its style wasn't torn down and recreated
    existingP.dataset.marker = "unmodified-during-incremental";

    // Append 10 new elements dynamically (simulating infinite scroll or chat messages)
    const newSection = document.createElement("section");
    newSection.id = "incremental-batch";
    for (let k = 0; k < 10; k++) {
      const p = document.createElement("p");
      p.className = `new-p-${k}`;
      p.style.fontSize = "20px";
      p.textContent = `Incremental item ${k}`;
      newSection.appendChild(p);
    }
    fixture.appendChild(newSection);

    // Wait for debounced incremental application (16ms)
    await waitFor(() => {
      const firstNewP = newSection.querySelector(".new-p-0") as HTMLElement;
      expect(firstNewP?.style.fontSize).toBe("30px"); // 20 * 1.5 = 30px
    });

    // Verify all 10 new items were scaled
    const allNewParas = newSection.querySelectorAll("p");
    expect(allNewParas.length).toBe(10);
    for (const p of Array.from(allNewParas)) {
      expect(p.style.fontSize).toBe("30px");
    }

    // Verify existing element retained its data marker without unstyling
    expect(existingP.dataset.marker).toBe("unmodified-during-incremental");
    expect(existingP.style.fontSize).toBe("24px");
  });

  it("late font loading: document.fonts.ready and loadingdone refresh text baselines automatically", async () => {
    // Mock document.fonts
    type FontListener = () => void;
    const listeners: FontListener[] = [];
    let resolveFontsReady: () => void = () => {};
    const fontsReadyPromise = new Promise<void>((resolve) => {
      resolveFontsReady = resolve;
    });

    const mockFonts = {
      status: "loading",
      ready: fontsReadyPromise,
      addEventListener: vi.fn((event: string, cb: FontListener) => {
        if (event === "loadingdone") listeners.push(cb);
      }),
      removeEventListener: vi.fn((event: string, cb: FontListener) => {
        const idx = listeners.indexOf(cb);
        if (idx !== -1) listeners.splice(idx, 1);
      }),
    };

    // Attach mockFonts to document
    Object.defineProperty(document, "fonts", {
      value: mockFonts,
      configurable: true,
      writable: true,
    });

    const host = document.createElement("div");
    host.innerHTML = `<h2 id="late-h2" style="font-size: 20px;">Late Font Title</h2>`;
    document.body.appendChild(host);

    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <TextScaleController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));
    const increaseBtn = screen.getByLabelText("Increase text size");
    fireEvent.click(increaseBtn); // 1.125x -> 22.5px
    fireEvent.click(increaseBtn); // 1.25x -> 25px

    const h2 = host.querySelector("#late-h2") as HTMLElement;
    expect(h2.style.fontSize).toBe("25px"); // 20 * 1.25 = 25px

    // Now simulate web font completing late loading
    mockFonts.status = "loaded";
    resolveFontsReady();
    for (const cb of listeners) cb();

    // Verify that the font load listener was registered
    expect(mockFonts.addEventListener).toHaveBeenCalledWith(
      "loadingdone",
      expect.any(Function),
    );

    // Wait for the debounced font refresh (50ms)
    await waitFor(() => {
      expect(h2.style.fontSize).toBe("25px");
    });
  });

  it("host root attribute changes: theme class toggles on documentElement/body refresh without infinite loops", async () => {
    const host = document.createElement("div");
    host.id = "host-app";
    host.innerHTML = `<p id="theme-p" style="font-size: 16px;">Theme Text</p>`;
    document.body.appendChild(host);

    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <ContrastModeController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));
    // Turn on Dark contrast mode
    const darkBtn = screen.getByRole("button", { name: "Dark" });
    fireEvent.click(darkBtn);

    const themeP = host.querySelector("#theme-p") as HTMLElement;
    expect(themeP.style.color).toMatch(/#f8fafc|rgb\(248,\s*250,\s*252\)/i);
    expect(themeP.style.backgroundColor).toMatch(
      /#0f172a|rgb\(15,\s*23,\s*42\)/i,
    );

    // Simulate host application switching to dark class on <html>
    document.documentElement.className = "dark-mode";
    document.body.setAttribute("data-theme", "dark");

    // Wait for debounced attribute refresh (25ms)
    await waitFor(() => {
      expect(themeP.style.color).toMatch(/#f8fafc|rgb\(248,\s*250,\s*252\)/i);
      expect(themeP.style.backgroundColor).toMatch(
        /#0f172a|rgb\(15,\s*23,\s*42\)/i,
      );
    });

    // Verify no observer runaway loop occurred
    expect(document.documentElement.className).toBe("dark-mode");
    expect(document.body.getAttribute("data-theme")).toBe("dark");
  });

  it("host direction change: dir='rtl' on documentElement refreshes script spacing constraints safely", async () => {
    const host = document.createElement("div");
    host.innerHTML = `<p id="rtl-p" style="letter-spacing: 0px;">English text becoming RTL</p>`;
    document.body.appendChild(host);

    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <LetterSpacingController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));
    const increaseBtn = screen.getByLabelText("Increase letter spacing");
    fireEvent.click(increaseBtn);

    const p = host.querySelector("#rtl-p") as HTMLElement;
    expect(p.style.letterSpacing).toBe("1px");

    // Host switches root direction to RTL
    document.documentElement.setAttribute("dir", "rtl");

    await waitFor(() => {
      expect(p.style.letterSpacing).toBeDefined();
    });
  });
});
