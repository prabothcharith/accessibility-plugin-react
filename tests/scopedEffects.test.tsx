import { describe, it, expect, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  TextScaleController,
  ResetController,
  resolveEffectScope,
  applyPageSession,
} from "../src";

describe("Issue #13: Scoped effects, strict CSP, and host compatibility", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = "";
    document.documentElement.className = "";

    container = document.createElement("div");
    container.id = "test-host-root";
    container.innerHTML = `
      <header id="external-header" style="position: fixed; top: 0; left: 0; font-size: 16px;">
        <h1>External Header</h1>
        <nav><a href="#home">Home</a></nav>
      </header>
      <main id="scoped-content" style="margin-top: 60px; font-size: 16px;">
        <h2 class="content-title">Scoped Main Content</h2>
        <p class="content-p" style="font-size: 16px; line-height: 24px;">This is scoped content.</p>
        <a href="#details" class="content-link">Details Link</a>
      </main>
      <footer id="external-footer" style="font-size: 14px;">
        <p>External Footer</p>
      </footer>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("resolveEffectScope helper", () => {
    it("resolves document.body when scope is omitted, null, or empty string", () => {
      expect(resolveEffectScope(undefined)).toBe(document.body);
      expect(resolveEffectScope(null)).toBe(document.body);
      expect(resolveEffectScope("")).toBe(document.body);
    });

    it("resolves CSS selector string to matching HTMLElement", () => {
      const resolved = resolveEffectScope("#scoped-content");
      expect(resolved).toBe(document.getElementById("scoped-content"));
    });

    it("resolves HTMLElement directly", () => {
      const el = document.getElementById("scoped-content") as HTMLElement;
      expect(resolveEffectScope(el)).toBe(el);
    });

    it("resolves React RefObject", () => {
      const ref = {
        current: document.getElementById("scoped-content") as HTMLElement,
      };
      expect(resolveEffectScope(ref)).toBe(ref.current);
    });

    it("falls back safely to document.body when selector does not match", () => {
      expect(resolveEffectScope("#non-existent-selector")).toBe(document.body);
    });
  });

  describe("Scoped element traversal and style isolation", () => {
    it("applies text scaling strictly to scoped container and leaves external elements untouched", async () => {
      const scopedMain = document.getElementById(
        "scoped-content",
      ) as HTMLElement;
      const externalHeader = document.getElementById(
        "external-header",
      ) as HTMLElement;
      const externalP = externalHeader.querySelector("h1") as HTMLElement;
      const scopedP = scopedMain.querySelector(".content-p") as HTMLElement;

      render(
        <AccessibilityPlugin
          persist={false}
          effectScope="#scoped-content"
          position="right"
        >
          <AccessibilityButton />
          <AccessibilityList>
            <TextScaleController />
            <ResetController />
          </AccessibilityList>
        </AccessibilityPlugin>,
      );

      // Open panel
      fireEvent.click(screen.getByRole("button", { name: /accessibility/i }));

      // Increase text size (+12.5%)
      const increaseBtn = screen.getByLabelText("Increase text size");
      fireEvent.click(increaseBtn);

      // Scoped paragraph is scaled (16 * 1.125 = 18px)
      expect(scopedP.style.fontSize).toMatch(/18px/);

      // External elements outside #scoped-content MUST NOT be styled
      expect(externalP.style.fontSize).toBe("");
      expect(externalHeader.style.fontSize).toBe("16px");

      // Reset restores scoped paragraph
      fireEvent.click(screen.getByRole("button", { name: "Reset All" }));
      expect(scopedP.style.fontSize).toBe("16px");
    });

    it("scopes CSS filter directly to container, protecting external fixed elements from stacking context bugs", () => {
      const scopedMain = document.getElementById(
        "scoped-content",
      ) as HTMLElement;
      const externalHeader = document.getElementById(
        "external-header",
      ) as HTMLElement;

      // Apply grayscale with effectScope targeting #scoped-content
      const session = applyPageSession(
        { grayscale: true },
        { effectScope: "#scoped-content" },
      );

      // Scoped container receives filter
      expect(scopedMain.style.filter).toContain("grayscale(1)");

      // External header (fixed navbar) does NOT receive filter, preserving fixed viewport positioning
      expect(externalHeader.style.filter).toBe("");

      // Undo cleanly removes filter from scoped container
      session.undo();
      expect(scopedMain.style.filter).toBe("");
    });
  });

  describe("Incremental mutations in scoped containers", () => {
    it("styles newly added children inside scope and ignores additions outside scope", () => {
      const session = applyPageSession(
        { textScale: 1.2 },
        { effectScope: "#scoped-content" },
      );

      const scopedMain = document.getElementById(
        "scoped-content",
      ) as HTMLElement;
      const externalHeader = document.getElementById(
        "external-header",
      ) as HTMLElement;

      // Add child to scopedMain
      const newScopedChild = document.createElement("p");
      newScopedChild.className = "new-scoped-child";
      newScopedChild.style.fontSize = "20px";
      scopedMain.appendChild(newScopedChild);

      // Add child to externalHeader (outside scope)
      const newExternalChild = document.createElement("p");
      newExternalChild.className = "new-external-child";
      newExternalChild.style.fontSize = "20px";
      externalHeader.appendChild(newExternalChild);

      // Process incremental additions
      session.applyIncremental([newScopedChild, newExternalChild]);

      // Scoped child is scaled (20 * 1.2 = 24px)
      expect(newScopedChild.style.fontSize).toBe("24px");

      // External child is ignored and retains original size
      expect(newExternalChild.style.fontSize).toBe("20px");

      session.undo();
      expect(newScopedChild.style.fontSize).toBe("20px");
    });
  });

  describe("Open Shadow DOM element traversal", () => {
    it("traverses open shadow roots inside scoped container", () => {
      const scopedMain = document.getElementById(
        "scoped-content",
      ) as HTMLElement;

      // Create a web component with open shadow root
      const customWidget = document.createElement("div");
      customWidget.id = "custom-shadow-widget";
      const shadowRoot = customWidget.attachShadow({ mode: "open" });
      const shadowP = document.createElement("p");
      shadowP.className = "shadow-text";
      shadowP.style.fontSize = "15px";
      shadowP.textContent = "Shadow DOM Paragraph";
      shadowRoot.appendChild(shadowP);

      scopedMain.appendChild(customWidget);

      const session = applyPageSession(
        { textScale: 1.2 },
        { effectScope: "#scoped-content" },
      );

      // Element inside open shadow root receives styling
      expect(shadowP.style.fontSize).toBe("18px"); // 15 * 1.2 = 18px

      session.undo();
      expect(shadowP.style.fontSize).toBe("15px");
    });
  });

  describe("Strict CSP nonce support", () => {
    it("propagates nonce attribute to injected focus highlight style tag", () => {
      const testNonce = "csp-nonce-abc-123";
      const session = applyPageSession(
        { highlightFocus: true },
        { nonce: testNonce },
      );

      const styleEl = document.getElementById(
        "arap-focus-highlight-style",
      ) as HTMLStyleElement | null;
      expect(styleEl).not.toBeNull();
      expect(styleEl?.nonce).toBe(testNonce);
      expect(styleEl?.getAttribute("nonce")).toBe(testNonce);

      session.undo();
      expect(document.getElementById("arap-focus-highlight-style")).toBeNull();
    });

    it("propagates nonce attribute to injected reduce motion style tag", () => {
      const testNonce = "csp-nonce-xyz-789";
      const session = applyPageSession(
        { reduceMotion: true },
        { nonce: testNonce },
      );

      const styleEl = document.getElementById(
        "arap-reduce-motion-style",
      ) as HTMLStyleElement | null;
      expect(styleEl).not.toBeNull();
      expect(styleEl?.nonce).toBe(testNonce);
      expect(styleEl?.getAttribute("nonce")).toBe(testNonce);

      session.undo();
      expect(document.getElementById("arap-reduce-motion-style")).toBeNull();
    });
  });
});
