import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  TextScaleController,
  ResetController,
  TEXT_SCALE_STEPS,
  TEXT_SCALE_PROTECTED_SELECTOR,
  isProtectedFromTextScale,
} from "../src";

describe("A11Y-201: Bigger text and reflow-safe scaling", () => {
  let hostContainer: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = "";

    hostContainer = document.createElement("main");
    hostContainer.id = "host-root";
    document.body.appendChild(hostContainer);
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("exports standard WCAG reflow scale steps [1.0, 1.125, 1.25, 1.5, 2.0]", () => {
    expect(TEXT_SCALE_STEPS).toEqual([1.0, 1.125, 1.25, 1.5, 2.0]);
    expect(TEXT_SCALE_PROTECTED_SELECTOR).toContain("input");
    expect(TEXT_SCALE_PROTECTED_SELECTOR).toContain("code");
    expect(TEXT_SCALE_PROTECTED_SELECTOR).toContain("svg");
  });

  it("identifies protected form, label, code, icon, and exempt elements", () => {
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const select = document.createElement("select");
    const button = document.createElement("button");
    const label = document.createElement("label");
    const legend = document.createElement("legend");
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    pre.appendChild(code);
    const kbd = document.createElement("kbd");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const ignored = document.createElement("div");
    ignored.setAttribute("data-arap-ignore", "");

    const p = document.createElement("p");
    const h1 = document.createElement("h1");
    const a = document.createElement("a");

    expect(isProtectedFromTextScale(input)).toBe(true);
    expect(isProtectedFromTextScale(textarea)).toBe(true);
    expect(isProtectedFromTextScale(select)).toBe(true);
    expect(isProtectedFromTextScale(button)).toBe(true);
    expect(isProtectedFromTextScale(label)).toBe(true);
    expect(isProtectedFromTextScale(legend)).toBe(true);
    expect(isProtectedFromTextScale(pre)).toBe(true);
    expect(isProtectedFromTextScale(code)).toBe(true);
    expect(isProtectedFromTextScale(kbd)).toBe(true);
    expect(isProtectedFromTextScale(svg as unknown as HTMLElement)).toBe(true);
    expect(isProtectedFromTextScale(ignored)).toBe(true);

    expect(isProtectedFromTextScale(p)).toBe(false);
    expect(isProtectedFromTextScale(h1)).toBe(false);
    expect(isProtectedFromTextScale(a)).toBe(false);
  });

  it("TextScaleController steps up from 100% to 200% and clamps at boundaries", () => {
    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <TextScaleController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));

    const decreaseBtn = screen.getByLabelText("Decrease text size");
    const increaseBtn = screen.getByLabelText("Increase text size");
    const output = document.querySelector(".arap-value") as HTMLElement;

    // Initially at 100% (1.0), decrease should be disabled
    expect(output).toHaveTextContent("100%");
    expect(decreaseBtn).toBeDisabled();
    expect(increaseBtn).not.toBeDisabled();

    // Step 1: 1.125 -> 113%
    fireEvent.click(increaseBtn);
    expect(output).toHaveTextContent("113%");
    expect(decreaseBtn).not.toBeDisabled();

    // Step 2: 1.25 -> 125%
    fireEvent.click(increaseBtn);
    expect(output).toHaveTextContent("125%");

    // Step 3: 1.5 -> 150%
    fireEvent.click(increaseBtn);
    expect(output).toHaveTextContent("150%");

    // Step 4: 2.0 -> 200%
    fireEvent.click(increaseBtn);
    expect(output).toHaveTextContent("200%");
    expect(increaseBtn).toBeDisabled();

    // Step down back to 150%
    fireEvent.click(decreaseBtn);
    expect(output).toHaveTextContent("150%");
    expect(increaseBtn).not.toBeDisabled();
  });

  it("scales headings and paragraphs without modifying protected forms, labels, code, and icons", () => {
    hostContainer.innerHTML = `
      <h1 style="font-size: 20px;">Main Title</h1>
      <p id="content-para" style="font-size: 16px;">Readable body paragraph.</p>
      <form id="sample-form">
        <label id="test-label" style="font-size: 14px;">Form Label</label>
        <input id="test-input" type="text" style="font-size: 14px;" value="Input text" />
        <button id="test-btn" type="submit" style="font-size: 14px;">Submit</button>
      </form>
      <pre id="test-pre" style="font-size: 13px;"><code id="test-code">const a = 1;</code></pre>
      <div id="test-icon" class="icon-wrap" style="font-size: 16px;">
        <svg id="test-svg" width="24" height="24"></svg>
      </div>
      <div id="test-exempt" data-arap-ignore style="font-size: 15px;">Exempt panel</div>
    `;

    const h1 = hostContainer.querySelector("h1") as HTMLElement;
    const p = hostContainer.querySelector("#content-para") as HTMLElement;
    const label = hostContainer.querySelector("#test-label") as HTMLElement;
    const input = hostContainer.querySelector("#test-input") as HTMLElement;
    const button = hostContainer.querySelector("#test-btn") as HTMLElement;
    const pre = hostContainer.querySelector("#test-pre") as HTMLElement;
    const code = hostContainer.querySelector("#test-code") as HTMLElement;
    const exempt = hostContainer.querySelector("#test-exempt") as HTMLElement;

    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <TextScaleController />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));

    // Increase text size: 1.0 -> 1.125 -> 1.25 -> 1.5 (150%)
    const increaseBtn = screen.getByLabelText("Increase text size");
    fireEvent.click(increaseBtn); // 1.125
    fireEvent.click(increaseBtn); // 1.25
    fireEvent.click(increaseBtn); // 1.5

    // Eligible elements scale by 1.5x:
    // h1: 20px * 1.5 = 30px
    expect(h1.style.fontSize).toBe("30px");
    // p: 16px * 1.5 = 24px
    expect(p.style.fontSize).toBe("24px");

    // Protected elements MUST NOT have their authored font-size overwritten:
    expect(label.style.fontSize).toBe("14px");
    expect(input.style.fontSize).toBe("14px");
    expect(button.style.fontSize).toBe("14px");
    expect(pre.style.fontSize).toBe("13px");
    expect(code.style.fontSize).toBe("");
    expect(exempt.style.fontSize).toBe("15px");

    // Reset All restores authored styles on all modified elements
    fireEvent.click(screen.getByText("Reset All"));
    expect(h1.style.fontSize).toBe("20px");
    expect(p.style.fontSize).toBe("16px");
    expect(label.style.fontSize).toBe("14px");
    expect(input.style.fontSize).toBe("14px");
    expect(button.style.fontSize).toBe("14px");
    expect(pre.style.fontSize).toBe("13px");
  });

  it("avoids nested compounding when scaling deeply nested text elements", () => {
    hostContainer.innerHTML = `
      <section id="section-1" style="font-size: 16px;">
        <article id="article-1" style="font-size: 16px;">
          <p id="nested-p" style="font-size: 16px;">
            <span id="nested-span" style="font-size: 16px;">Nested text</span>
          </p>
        </article>
      </section>
    `;

    const section = hostContainer.querySelector("#section-1") as HTMLElement;
    const article = hostContainer.querySelector("#article-1") as HTMLElement;
    const p = hostContainer.querySelector("#nested-p") as HTMLElement;
    const span = hostContainer.querySelector("#nested-span") as HTMLElement;

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

    // Step to 200% (2.0x): 1.0 -> 1.125 -> 1.25 -> 1.5 -> 2.0
    fireEvent.click(increaseBtn);
    fireEvent.click(increaseBtn);
    fireEvent.click(increaseBtn);
    fireEvent.click(increaseBtn);

    // Each element should be 16px * 2.0 = 32px, NOT compounded exponentially (e.g. 16 * 2^4 = 256px)
    expect(section.style.fontSize).toBe("32px");
    expect(article.style.fontSize).toBe("32px");
    expect(p.style.fontSize).toBe("32px");
    expect(span.style.fontSize).toBe("32px");
  });

  it("FontSizeController with stepScale snaps to standard reflow scale steps", () => {
    hostContainer.innerHTML = `<p id="test-p" style="font-size: 20px;">Content</p>`;
    const p = hostContainer.querySelector("#test-p") as HTMLElement;

    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <FontSizeController stepScale />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));
    const increaseBtn = screen.getByLabelText("Increase font size");
    const output = document.querySelector(".arap-value") as HTMLElement;

    expect(output).toHaveTextContent("100%");

    // First click snaps to 112.5% (displayed as 113%)
    fireEvent.click(increaseBtn);
    expect(output).toHaveTextContent("113%");
    expect(parseFloat(p.style.fontSize)).toBeCloseTo(22.5, 1);

    // Second click snaps to 125%
    fireEvent.click(increaseBtn);
    expect(output).toHaveTextContent("125%");
    expect(p.style.fontSize).toBe("25px");

    // Reset restores authored 20px
    fireEvent.click(screen.getByText("Reset All"));
    expect(p.style.fontSize).toBe("20px");
  });

  it("handles dynamic route content insertions with active text scaling", async () => {
    hostContainer.innerHTML = `<p id="first-p" style="font-size: 20px;">First</p>`;

    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <TextScaleController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));
    // Step to 1.5x (150%)
    const increaseBtn = screen.getByLabelText("Increase text size");
    fireEvent.click(increaseBtn);
    fireEvent.click(increaseBtn);
    fireEvent.click(increaseBtn);

    expect(
      hostContainer.querySelector("#first-p")?.getAttribute("style"),
    ).toContain("font-size: 30px");

    // Simulate SPA dynamic route change
    const newPara = document.createElement("p");
    newPara.id = "second-p";
    newPara.style.fontSize = "18px";
    newPara.textContent = "Second";
    hostContainer.appendChild(newPara);

    await waitFor(() => {
      const second = hostContainer.querySelector("#second-p") as HTMLElement;
      expect(second?.style.fontSize).toBe("27px"); // 18 * 1.5 = 27
    });
  });
});
