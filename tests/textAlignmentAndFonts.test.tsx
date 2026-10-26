import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, cleanup, render } from "@testing-library/react";
import * as API from "../src";
import {
  LEGIBLE_FONT_STACK,
  DYSLEXIA_FONT_STACK,
  isProtectedFromTextAlign,
  isProtectedFromFontFamily,
} from "../src";
import { Widget } from "./helpers";

describe("Text Alignment and Font Family", () => {
  let host: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    host = document.createElement("main");
    host.id = "test-host";
    host.innerHTML = `
      <h1>Main Heading</h1>
      <p id="test-p">Sample paragraph text</p>
      <blockquote id="test-quote">Quoted block</blockquote>
      <ul><li id="test-li">List item</li></ul>
      <table id="test-table">
        <thead><tr><th id="test-th">Header</th></tr></thead>
        <tbody><tr><td id="test-td">Data</td></tr></tbody>
      </table>
      <button id="test-btn" type="button">Button text</button>
      <input id="test-input" type="text" value="Input text" />
      <pre id="test-pre"><code id="test-code">const x = 42;</code></pre>
      <span data-icon id="test-icon">★</span>
      <div id="test-div">Generic container</div>
    `;
    document.body.appendChild(host);
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  function renderWidget(children: React.ReactNode) {
    const result = render(<Widget>{children}</Widget>);
    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    return result;
  }

  describe("TextAlignController & Scoped Alignment", () => {
    it("scopes text alignment strictly to logical text blocks", () => {
      renderWidget(<API.TextAlignController />);
      const rightBtn = screen.getByRole("button", { name: /right/i });
      fireEvent.click(rightBtn);

      const p = document.getElementById("test-p")!;
      const h1 = host.querySelector("h1")!;
      const quote = document.getElementById("test-quote")!;
      const li = document.getElementById("test-li")!;

      expect(p.style.textAlign).toBe("right");
      expect(h1.style.textAlign).toBe("right");
      expect(quote.style.textAlign).toBe("right");
      expect(li.style.textAlign).toBe("right");

      // Protected elements must NOT have text-align forced
      const th = document.getElementById("test-th")!;
      const td = document.getElementById("test-td")!;
      const btn = document.getElementById("test-btn")!;
      const input = document.getElementById("test-input")!;
      const code = document.getElementById("test-code")!;

      expect(th.style.textAlign).toBe("");
      expect(td.style.textAlign).toBe("");
      expect(btn.style.textAlign).toBe("");
      expect(input.style.textAlign).toBe("");
      expect(code.style.textAlign).toBe("");
    });

    it("displays an accessible advisory warning only when Justify is active", () => {
      renderWidget(<API.TextAlignController />);

      expect(screen.queryByRole("note")).toBeNull();

      const justifyBtn = screen.getByRole("button", { name: /justify/i });
      fireEvent.click(justifyBtn);

      const warning = screen.getByRole("note");
      expect(warning).toBeInTheDocument();
      expect(warning).toHaveTextContent(/rivers of white/i);

      const leftBtn = screen.getByRole("button", { name: /left/i });
      fireEvent.click(leftBtn);

      expect(screen.queryByRole("note")).toBeNull();
    });

    it("restores original alignment when reset to default", () => {
      renderWidget(<API.TextAlignController />);
      const centerBtn = screen.getByRole("button", { name: /center/i });
      fireEvent.click(centerBtn);

      const p = document.getElementById("test-p")!;
      expect(p.style.textAlign).toBe("center");

      const defaultBtn = screen.getByRole("button", { name: /default/i });
      fireEvent.click(defaultBtn);
      expect(p.style.textAlign).toBe("");
    });
  });

  describe("FontFamilyController & Script Fallbacks", () => {
    it("renders segmented controls with Default, Legible, and Dyslexia", () => {
      renderWidget(<API.FontFamilyController />);
      expect(
        screen.getByRole("button", { name: /Default/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Legible/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Dyslexia/i }),
      ).toBeInTheDocument();
    });

    it("applies LEGIBLE_FONT_STACK containing Sinhala and Tamil fallbacks", () => {
      renderWidget(<API.FontFamilyController />);
      const legibleBtn = screen.getByRole("button", { name: /Legible/i });
      fireEvent.click(legibleBtn);

      const p = document.getElementById("test-p")!;
      expect(p.style.fontFamily).toBe(LEGIBLE_FONT_STACK);
      expect(LEGIBLE_FONT_STACK).toContain("Noto Sans Sinhala");
      expect(LEGIBLE_FONT_STACK).toContain("Iskoola Pota");
      expect(LEGIBLE_FONT_STACK).toContain("Noto Sans Tamil");
      expect(LEGIBLE_FONT_STACK).toContain("Latha");
    });

    it("applies DYSLEXIA_FONT_STACK containing OpenDyslexic and script fallbacks", () => {
      renderWidget(<API.FontFamilyController />);
      const dyslexiaBtn = screen.getByRole("button", { name: /Dyslexia/i });
      fireEvent.click(dyslexiaBtn);

      const p = document.getElementById("test-p")!;
      expect(p.style.fontFamily).toBe(DYSLEXIA_FONT_STACK);
      expect(DYSLEXIA_FONT_STACK).toContain("OpenDyslexic");
      expect(DYSLEXIA_FONT_STACK).toContain("Noto Sans Sinhala");
      expect(DYSLEXIA_FONT_STACK).toContain("Noto Sans Tamil");
    });

    it("protects code and monospace elements from font family overrides", () => {
      renderWidget(<API.FontFamilyController />);
      const dyslexiaBtn = screen.getByRole("button", { name: /Dyslexia/i });
      fireEvent.click(dyslexiaBtn);

      const code = document.getElementById("test-code")!;
      const pre = document.getElementById("test-pre")!;

      expect(isProtectedFromFontFamily(code)).toBe(true);
      expect(isProtectedFromFontFamily(pre)).toBe(true);
      expect(code.style.fontFamily).not.toBe(DYSLEXIA_FONT_STACK);
      expect(code.style.fontFamily).toContain("monospace");
    });

    it("restores original fonts on reset", () => {
      renderWidget(<API.FontFamilyController />);
      const legibleBtn = screen.getByRole("button", { name: /Legible/i });
      fireEvent.click(legibleBtn);

      const p = document.getElementById("test-p")!;
      expect(p.style.fontFamily).toBe(LEGIBLE_FONT_STACK);

      const defaultBtn = screen.getByRole("button", { name: /Default/i });
      fireEvent.click(defaultBtn);
      expect(p.style.fontFamily).toBe("");
    });
  });

  describe("Element Protection Predicates", () => {
    it("correctly identifies protected elements for text alignment", () => {
      const table = document.getElementById("test-table")!;
      const td = document.getElementById("test-td")!;
      const btn = document.getElementById("test-btn")!;
      const p = document.getElementById("test-p")!;

      expect(isProtectedFromTextAlign(table)).toBe(true);
      expect(isProtectedFromTextAlign(td)).toBe(true);
      expect(isProtectedFromTextAlign(btn)).toBe(true);
      expect(isProtectedFromTextAlign(p)).toBe(false);
    });

    it("correctly identifies protected elements for font family", () => {
      const code = document.getElementById("test-code")!;
      const icon = document.getElementById("test-icon")!;
      const p = document.getElementById("test-p")!;

      expect(isProtectedFromFontFamily(code)).toBe(true);
      expect(isProtectedFromFontFamily(icon)).toBe(true);
      expect(isProtectedFromFontFamily(p)).toBe(false);
    });
  });
});
