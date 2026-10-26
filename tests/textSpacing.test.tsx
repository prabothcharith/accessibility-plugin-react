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
  LineHeightController,
  LetterSpacingController,
  WordSpacingController,
  ParagraphSpacingController,
  ResetController,
  LINE_HEIGHT_STEPS,
  LINE_HEIGHT_RATIOS,
  TEXT_SPACING_EXCLUDED_SELECTOR,
  isProtectedFromTextSpacing,
  getScriptSpacingConstraints,
} from "../src";

describe("A11Y-202: Letter, word, paragraph spacing and line height", () => {
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

  it("exports standard line height presets and excluded selector", () => {
    expect(LINE_HEIGHT_STEPS).toEqual([100, 150, 175, 200]);
    expect(LINE_HEIGHT_RATIOS).toEqual([1.0, 1.5, 1.75, 2.0]);
    expect(TEXT_SPACING_EXCLUDED_SELECTOR).toContain("table");
    expect(TEXT_SPACING_EXCLUDED_SELECTOR).toContain("pre");
    expect(TEXT_SPACING_EXCLUDED_SELECTOR).toContain("code");
    expect(TEXT_SPACING_EXCLUDED_SELECTOR).toContain("button");
    expect(TEXT_SPACING_EXCLUDED_SELECTOR).toContain("input");
    expect(TEXT_SPACING_EXCLUDED_SELECTOR).toContain("[data-arap-ui]");
  });

  it("identifies protected controls, code blocks, tables, and widget internals", () => {
    const table = document.createElement("table");
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    tr.appendChild(td);
    table.appendChild(tr);

    const pre = document.createElement("pre");
    const code = document.createElement("code");
    pre.appendChild(code);

    const button = document.createElement("button");
    const input = document.createElement("input");
    const select = document.createElement("select");
    const textarea = document.createElement("textarea");

    const widget = document.createElement("div");
    widget.setAttribute("data-arap-ui", "");

    const p = document.createElement("p");
    const h2 = document.createElement("h2");
    const span = document.createElement("span");

    expect(isProtectedFromTextSpacing(table)).toBe(true);
    expect(isProtectedFromTextSpacing(td)).toBe(true);
    expect(isProtectedFromTextSpacing(pre)).toBe(true);
    expect(isProtectedFromTextSpacing(code)).toBe(true);
    expect(isProtectedFromTextSpacing(button)).toBe(true);
    expect(isProtectedFromTextSpacing(input)).toBe(true);
    expect(isProtectedFromTextSpacing(select)).toBe(true);
    expect(isProtectedFromTextSpacing(textarea)).toBe(true);
    expect(isProtectedFromTextSpacing(widget)).toBe(true);

    expect(isProtectedFromTextSpacing(p)).toBe(false);
    expect(isProtectedFromTextSpacing(h2)).toBe(false);
    expect(isProtectedFromTextSpacing(span)).toBe(false);
  });

  it("enforces script-aware letter spacing limits for RTL, cursive, and Indic scripts", () => {
    // 1. Arabic / RTL
    const arabicByLang = document.createElement("p");
    arabicByLang.setAttribute("lang", "ar");
    arabicByLang.textContent = "مرحبا بالعالم";

    const urduByLang = document.createElement("p");
    urduByLang.setAttribute("lang", "ur");

    const rtlByDir = document.createElement("p");
    rtlByDir.setAttribute("dir", "rtl");

    const arabicByText = document.createElement("p");
    arabicByText.textContent = "العربية";

    expect(getScriptSpacingConstraints(arabicByLang).allowLetterSpacing).toBe(
      false,
    );
    expect(getScriptSpacingConstraints(urduByLang).allowLetterSpacing).toBe(
      false,
    );
    expect(getScriptSpacingConstraints(rtlByDir).allowLetterSpacing).toBe(
      false,
    );
    expect(getScriptSpacingConstraints(arabicByText).allowLetterSpacing).toBe(
      false,
    );

    // 2. Indic / Sinhala / Tamil
    const sinhalaByLang = document.createElement("p");
    sinhalaByLang.setAttribute("lang", "si");
    sinhalaByLang.textContent = "ආයුබෝවන්";

    const tamilByLang = document.createElement("p");
    tamilByLang.setAttribute("lang", "ta");
    tamilByLang.textContent = "வணக்கம்";

    const hindiByText = document.createElement("p");
    hindiByText.textContent = "नमस्ते दुनिया";

    const sinhalaConstraints = getScriptSpacingConstraints(sinhalaByLang);
    expect(sinhalaConstraints.allowLetterSpacing).toBe(true);
    expect(sinhalaConstraints.maxLetterSpacingPx).toBe(1);

    const tamilConstraints = getScriptSpacingConstraints(tamilByLang);
    expect(tamilConstraints.allowLetterSpacing).toBe(true);
    expect(tamilConstraints.maxLetterSpacingPx).toBe(1);

    const hindiConstraints = getScriptSpacingConstraints(hindiByText);
    expect(hindiConstraints.allowLetterSpacing).toBe(true);
    expect(hindiConstraints.maxLetterSpacingPx).toBe(1);

    // 3. Standard Latin
    const latin = document.createElement("p");
    latin.setAttribute("lang", "en");
    latin.textContent = "Accessible Typography";
    const latinConstraints = getScriptSpacingConstraints(latin);
    expect(latinConstraints.allowLetterSpacing).toBe(true);
    expect(latinConstraints.maxLetterSpacingPx).toBe(Infinity);
  });

  it("steps LineHeightController through 1.5, 1.75, 2.0 options when stepPresets is enabled", () => {
    render(
      <AccessibilityPlugin persist={false}>
        <AccessibilityButton />
        <AccessibilityList>
          <LineHeightController stepPresets />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));

    const group = screen.getByRole("group", { name: "Line Height" });
    const decBtn = group.querySelector(
      'button[aria-label="Decrease line height"]',
    )!;
    const incBtn = group.querySelector(
      'button[aria-label="Increase line height"]',
    )!;
    const output = group.querySelector("output")!;

    expect(output).toHaveTextContent("100%");
    expect(decBtn).toBeDisabled();

    // Step 1: 100% -> 150% (1.5x)
    fireEvent.click(incBtn);
    expect(output).toHaveTextContent("150%");
    expect(decBtn).not.toBeDisabled();

    // Step 2: 150% -> 175% (1.75x)
    fireEvent.click(incBtn);
    expect(output).toHaveTextContent("175%");

    // Step 3: 175% -> 200% (2.0x)
    fireEvent.click(incBtn);
    expect(output).toHaveTextContent("200%");
    expect(incBtn).toBeDisabled();

    // Step back down
    fireEvent.click(decBtn);
    expect(output).toHaveTextContent("175%");
  });

  it("increments and decrements WordSpacingController", () => {
    render(
      <AccessibilityPlugin persist={false}>
        <AccessibilityButton />
        <AccessibilityList>
          <WordSpacingController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));

    const group = screen.getByRole("group", { name: "Word Spacing" });
    const decBtn = group.querySelector(
      'button[aria-label="Decrease word spacing"]',
    )!;
    const incBtn = group.querySelector(
      'button[aria-label="Increase word spacing"]',
    )!;
    const output = group.querySelector("output")!;

    expect(output).toHaveTextContent("0px");
    expect(decBtn).toBeDisabled();

    fireEvent.click(incBtn);
    expect(output).toHaveTextContent("1px");
    expect(decBtn).not.toBeDisabled();

    fireEvent.click(incBtn);
    expect(output).toHaveTextContent("2px");

    fireEvent.click(decBtn);
    expect(output).toHaveTextContent("1px");
  });

  it("increments and decrements ParagraphSpacingController", () => {
    render(
      <AccessibilityPlugin persist={false}>
        <AccessibilityButton />
        <AccessibilityList>
          <ParagraphSpacingController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));

    const group = screen.getByRole("group", { name: "Paragraph Spacing" });
    const decBtn = group.querySelector(
      'button[aria-label="Decrease paragraph spacing"]',
    )!;
    const incBtn = group.querySelector(
      'button[aria-label="Increase paragraph spacing"]',
    )!;
    const output = group.querySelector("output")!;

    expect(output).toHaveTextContent("0px");
    expect(decBtn).toBeDisabled();

    // Default step is 4px
    fireEvent.click(incBtn);
    expect(output).toHaveTextContent("4px");

    fireEvent.click(incBtn);
    expect(output).toHaveTextContent("8px");

    fireEvent.click(decBtn);
    expect(output).toHaveTextContent("4px");
  });

  it("applies text spacing exclusions to controls, code, and tables while modifying paragraphs", async () => {
    const p = document.createElement("p");
    p.textContent = "Accessible text paragraph";
    hostContainer.appendChild(p);

    const table = document.createElement("table");
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.textContent = "Cell data";
    tr.appendChild(td);
    table.appendChild(tr);
    hostContainer.appendChild(table);

    const button = document.createElement("button");
    button.textContent = "Action Button";
    hostContainer.appendChild(button);

    const code = document.createElement("pre");
    code.textContent = "const x = 42;";
    hostContainer.appendChild(code);

    render(
      <AccessibilityPlugin persist={false}>
        <AccessibilityButton />
        <AccessibilityList>
          <LineHeightController stepPresets />
          <LetterSpacingController />
          <WordSpacingController />
          <ParagraphSpacingController />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));

    // 1. Apply Line Height 1.5x (150%)
    const lineHeightInc = screen.getByRole("button", {
      name: "Increase line height",
    });
    fireEvent.click(lineHeightInc);

    // 2. Apply Letter Spacing +3px
    const letterInc = screen.getByRole("button", {
      name: "Increase letter spacing",
    });
    fireEvent.click(letterInc);
    fireEvent.click(letterInc);
    fireEvent.click(letterInc);

    // 3. Apply Word Spacing +2px
    const wordInc = screen.getByRole("button", {
      name: "Increase word spacing",
    });
    fireEvent.click(wordInc);
    fireEvent.click(wordInc);

    // 4. Apply Paragraph Spacing +8px
    const paraInc = screen.getByRole("button", {
      name: "Increase paragraph spacing",
    });
    fireEvent.click(paraInc);
    fireEvent.click(paraInc);

    await waitFor(() => {
      // Paragraph should have all text spacing applied
      expect(p.style.lineHeight).not.toBe("");
      expect(p.style.letterSpacing).toBe("3px");
      expect(p.style.wordSpacing).toBe("2px");
      expect(p.style.marginBottom).not.toBe("");
    });

    // Controls, Code, and Tables must be excluded from text spacing overrides
    expect(["", "normal"]).toContain(td.style.letterSpacing);
    expect(["", "normal"]).toContain(td.style.wordSpacing);
    expect(["", "normal"]).toContain(button.style.letterSpacing);
    expect(["", "normal"]).toContain(button.style.wordSpacing);
    expect(["", "normal"]).toContain(code.style.letterSpacing);
    expect(["", "normal"]).toContain(code.style.wordSpacing);

    // Reset All restores everything
    const resetBtn = screen.getByRole("button", {
      name: "Reset All",
    });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(p.style.letterSpacing).toBe("");
      expect(p.style.wordSpacing).toBe("");
      expect(p.style.lineHeight).toBe("");
      expect(p.style.marginBottom).toBe("");
    });
  });

  it("respects multilingual limits: suppresses letter spacing on Arabic and clamps on Sinhala", async () => {
    const arabicP = document.createElement("p");
    arabicP.setAttribute("lang", "ar");
    arabicP.textContent = "مرحبا بالعالم العربي";
    hostContainer.appendChild(arabicP);

    const sinhalaP = document.createElement("p");
    sinhalaP.setAttribute("lang", "si");
    sinhalaP.textContent = "හෙළකුරු බසින් ලියූ වදන් පෙළ";
    hostContainer.appendChild(sinhalaP);

    const englishP = document.createElement("p");
    englishP.setAttribute("lang", "en");
    englishP.textContent = "Standard English typography text";
    hostContainer.appendChild(englishP);

    render(
      <AccessibilityPlugin persist={false}>
        <AccessibilityButton />
        <AccessibilityList>
          <LetterSpacingController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));

    const letterInc = screen.getByRole("button", {
      name: "Increase letter spacing",
    });
    // Increase to 4px
    fireEvent.click(letterInc);
    fireEvent.click(letterInc);
    fireEvent.click(letterInc);
    fireEvent.click(letterInc);

    await waitFor(() => {
      // Arabic cursive: completely suppressed / isolated to prevent breaking cursive ligatures
      expect(["", "normal"]).toContain(arabicP.style.letterSpacing);

      // Sinhala: clamped to safe limit (1px) to preserve conjuncts/vowel signs
      expect(sinhalaP.style.letterSpacing).toBe("1px");

      // English: full 4px applied
      expect(englishP.style.letterSpacing).toBe("4px");
    });
  });
});
