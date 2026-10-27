import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  parseColor,
  calculateRelativeLuminance,
  calculateContrastRatio,
  compositeRgba,
  isLargeText,
  isEligibleForSmartContrast,
  resolveEffectiveBackdrop,
  evaluateSmartContrast,
  applySmartContrast,
  SMART_CONTRAST_DISCLAIMER,
  TARGET_RATIOS,
  HIGH_CONTRAST_TOKENS,
} from "../src";

describe("Smart Contrast Research Engine (A11Y-407)", () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  describe("Color Parsing & Luminance Calculations", () => {
    it("parses various CSS color formats correctly", () => {
      expect(parseColor("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(parseColor("#000000")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
      expect(parseColor("rgb(10, 20, 30)")).toEqual({
        r: 10,
        g: 20,
        b: 30,
        a: 1,
      });
      expect(parseColor("rgba(10, 20, 30, 0.5)")).toEqual({
        r: 10,
        g: 20,
        b: 30,
        a: 0.5,
      });
      expect(parseColor("transparent")).toEqual({ r: 0, g: 0, b: 0, a: 0 });
      expect(parseColor("rgba(0, 0, 0, 0)")).toEqual({
        r: 0,
        g: 0,
        b: 0,
        a: 0,
      });
      expect(parseColor("white")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(parseColor("black")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
      expect(parseColor("invalid-color-string")).toBeNull();
    });

    it("calculates WCAG 2.1 relative luminance accurately", () => {
      expect(calculateRelativeLuminance(0, 0, 0)).toBe(0);
      expect(calculateRelativeLuminance(255, 255, 255)).toBe(1);

      // Mid-tones
      const grayLuminance = calculateRelativeLuminance(128, 128, 128);
      expect(grayLuminance).toBeGreaterThan(0.2);
      expect(grayLuminance).toBeLessThan(0.3);
    });

    it("exports standard high contrast replacement tokens", () => {
      expect(HIGH_CONTRAST_TOKENS.onLight).toBe("#0f172a");
      expect(HIGH_CONTRAST_TOKENS.onDark).toBe("#ffffff");
    });

    it("calculates WCAG 2.1 contrast ratios accurately", () => {
      const blackLum = calculateRelativeLuminance(0, 0, 0);
      const whiteLum = calculateRelativeLuminance(255, 255, 255);

      // Maximum contrast (black on white) is 21:1
      const maxContrast = calculateContrastRatio(whiteLum, blackLum);
      expect(maxContrast).toBeCloseTo(21, 1);

      // Identical colors have 1:1 contrast
      expect(calculateContrastRatio(whiteLum, whiteLum)).toBe(1);
      expect(calculateContrastRatio(blackLum, blackLum)).toBe(1);
    });

    it("composites semi-transparent colors using Porter-Duff source-over blending", () => {
      // 50% black over 100% white -> ~128 gray
      const fg = { r: 0, g: 0, b: 0, a: 0.5 };
      const bg = { r: 255, g: 255, b: 255, a: 1 };
      const blended = compositeRgba(fg, bg);
      expect(blended.r).toBeCloseTo(128, 0);
      expect(blended.g).toBeCloseTo(128, 0);
      expect(blended.b).toBeCloseTo(128, 0);
      expect(blended.a).toBe(1);

      // 100% opaque fg completely covers bg
      expect(compositeRgba({ r: 10, g: 20, b: 30, a: 1 }, bg)).toEqual({
        r: 10,
        g: 20,
        b: 30,
        a: 1,
      });

      // 0% transparent fg shows 100% bg
      expect(compositeRgba({ r: 0, g: 0, b: 0, a: 0 }, bg)).toEqual(bg);
    });

    it("determines large text according to WCAG 2.1 specs", () => {
      // >= 24px is large regardless of weight
      expect(isLargeText(24, "normal")).toBe(true);
      expect(isLargeText(28, 400)).toBe(true);

      // >= 18.66px and bold is large
      expect(isLargeText(18.66, "bold")).toBe(true);
      expect(isLargeText(20, 700)).toBe(true);
      expect(isLargeText(18.66, 400)).toBe(false);

      // < 18.66px is not large even if bold
      expect(isLargeText(16, "bold")).toBe(false);
      expect(isLargeText(16, 700)).toBe(false);
    });
  });

  describe("Element Eligibility & Boundary Protections", () => {
    it("excludes internal plugin UI and exempt trees", () => {
      const pluginEl = document.createElement("div");
      pluginEl.setAttribute("data-arap-ui", "true");
      pluginEl.textContent = "Plugin text";
      container.appendChild(pluginEl);

      const exemptEl = document.createElement("div");
      exemptEl.setAttribute("data-arap-exempt", "true");
      exemptEl.textContent = "Exempt text";
      container.appendChild(exemptEl);

      expect(isEligibleForSmartContrast(pluginEl)).toBe(false);
      expect(isEligibleForSmartContrast(exemptEl)).toBe(false);
    });

    it("excludes non-text tags and media elements", () => {
      const img = document.createElement("img");
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const canvas = document.createElement("canvas");
      const script = document.createElement("script");

      expect(isEligibleForSmartContrast(img)).toBe(false);
      expect(isEligibleForSmartContrast(svg as unknown as HTMLElement)).toBe(
        false,
      );
      expect(isEligibleForSmartContrast(canvas)).toBe(false);
      expect(isEligibleForSmartContrast(script)).toBe(false);
    });

    it("protects disabled and invalid interactive controls", () => {
      const disabledBtn = document.createElement("button");
      disabledBtn.disabled = true;
      disabledBtn.textContent = "Disabled Action";

      const ariaDisabledBtn = document.createElement("button");
      ariaDisabledBtn.setAttribute("aria-disabled", "true");
      ariaDisabledBtn.textContent = "Aria Disabled";

      const invalidInput = document.createElement("input");
      invalidInput.setAttribute("aria-invalid", "true");
      invalidInput.value = "Error value";

      expect(isEligibleForSmartContrast(disabledBtn)).toBe(false);
      expect(isEligibleForSmartContrast(ariaDisabledBtn)).toBe(false);
      expect(isEligibleForSmartContrast(invalidInput)).toBe(false);
    });

    it("allows standard visible content elements", () => {
      const p = document.createElement("p");
      p.textContent = "Readable paragraph";

      const heading = document.createElement("h2");
      heading.textContent = "Section Heading";

      const link = document.createElement("a");
      link.href = "#";
      link.textContent = "Link Text";

      expect(isEligibleForSmartContrast(p)).toBe(true);
      expect(isEligibleForSmartContrast(heading)).toBe(true);
      expect(isEligibleForSmartContrast(link)).toBe(true);
    });
  });

  describe("Backdrop Compositing and Unsupported Element Detection", () => {
    it("blends parent background colors up to document root", () => {
      const card = document.createElement("div");
      card.style.backgroundColor = "rgb(15, 23, 42)"; // Dark slate
      container.appendChild(card);

      const text = document.createElement("p");
      text.textContent = "Card content";
      text.style.backgroundColor = "transparent";
      card.appendChild(text);

      const res = resolveEffectiveBackdrop(text);
      expect(res.isUnsupported).toBe(false);
      expect(res.backdrop.r).toBe(15);
      expect(res.backdrop.g).toBe(23);
      expect(res.backdrop.b).toBe(42);
      expect(res.backdrop.a).toBe(1);
    });

    it("identifies linear-gradient backgrounds as unsupported", () => {
      const gradientBox = document.createElement("div");
      gradientBox.style.backgroundImage =
        "linear-gradient(to right, red, blue)";
      container.appendChild(gradientBox);

      const text = document.createElement("p");
      text.textContent = "Gradient overlay";
      gradientBox.appendChild(text);

      const res = resolveEffectiveBackdrop(text);
      expect(res.isUnsupported).toBe(true);
      expect(res.reason).toBe("gradient");
    });

    it("identifies background images as unsupported", () => {
      const imgBox = document.createElement("div");
      imgBox.style.backgroundImage = "url('https://example.com/photo.jpg')";
      container.appendChild(imgBox);

      const text = document.createElement("p");
      text.textContent = "Photo text";
      imgBox.appendChild(text);

      const res = resolveEffectiveBackdrop(text);
      expect(res.isUnsupported).toBe(true);
      expect(res.reason).toBe("background-image");
    });

    it("identifies backdrop-filter as unsupported", () => {
      const frostedBox = document.createElement("div");
      frostedBox.style.backdropFilter = "blur(10px)";
      container.appendChild(frostedBox);

      const text = document.createElement("p");
      text.textContent = "Frosted glass text";
      frostedBox.appendChild(text);

      const res = resolveEffectiveBackdrop(text);
      expect(res.isUnsupported).toBe(true);
      expect(res.reason).toBe("backdrop-filter");
    });
  });

  describe("Measured Evaluation & Batched Application", () => {
    it("evaluates low-contrast text elements and generates accurate statistics", () => {
      container.style.backgroundColor = "#ffffff";

      // Sufficient contrast: #000 on #fff (ratio 21:1)
      const goodText = document.createElement("p");
      goodText.id = "good-p";
      goodText.style.color = "rgb(0, 0, 0)";
      goodText.textContent = "Good contrast text";
      container.appendChild(goodText);

      // Low contrast: #ccc on #fff (ratio ~1.6:1, fails 4.5:1)
      const lowText = document.createElement("p");
      lowText.id = "low-p";
      lowText.style.color = "rgb(204, 204, 204)";
      lowText.textContent = "Low contrast text";
      container.appendChild(lowText);

      // Gradient text: unsupported
      const gradientBox = document.createElement("div");
      gradientBox.style.backgroundImage = "linear-gradient(135deg, #f06, #9f6)";
      const gradText = document.createElement("span");
      gradText.style.color = "rgb(0, 0, 0)";
      gradText.textContent = "Gradient span";
      gradientBox.appendChild(gradText);
      container.appendChild(gradientBox);

      const report = evaluateSmartContrast({
        root: container,
        targetLevel: "aa",
      });

      expect(report.evaluatedCount).toBe(3);
      expect(report.adjustedCount).toBe(1);
      expect(report.sufficientCount).toBe(1);
      expect(report.unsupportedCount).toBe(1);
      expect(report.unsupportedElements[0].reason).toBe("gradient");
      expect(report.disclaimer).toBe(SMART_CONTRAST_DISCLAIMER);
      expect(report.targetRatioNormal).toBe(TARGET_RATIOS.aa.normal);
    });

    it("applies smart high-contrast colors and restores completely on undo()", () => {
      container.style.backgroundColor = "#ffffff";

      const lowText = document.createElement("p");
      lowText.id = "low-contrast-text";
      lowText.style.color = "rgb(200, 200, 200)";
      lowText.textContent = "Faded gray text";
      container.appendChild(lowText);

      const { report, undo } = applySmartContrast({
        root: container,
        targetLevel: "aa",
      });

      expect(report.adjustedCount).toBe(1);
      // Low text on light backdrop receives dark token
      expect(lowText.style.color).toBe("rgb(15, 23, 42)");
      expect(lowText.getAttribute("data-arap-smart-contrast")).toBe("true");

      // Non-destructive restoration
      undo();
      expect(lowText.style.color).toBe("rgb(200, 200, 200)");
      expect(lowText.hasAttribute("data-arap-smart-contrast")).toBe(false);

      // Idempotent undo: multiple calls do not throw or corrupt styles
      undo();
      expect(lowText.style.color).toBe("rgb(200, 200, 200)");
    });

    it("applies light token on dark backgrounds", () => {
      const darkContainer = document.createElement("div");
      darkContainer.style.backgroundColor = "rgb(15, 23, 42)";
      document.body.appendChild(darkContainer);

      const darkFaded = document.createElement("p");
      darkFaded.style.color = "rgb(30, 41, 59)"; // Dark on dark
      darkFaded.textContent = "Hard to see dark text";
      darkContainer.appendChild(darkFaded);

      const { report, undo } = applySmartContrast({
        root: darkContainer,
        targetLevel: "aa",
      });
      expect(report.adjustedCount).toBe(1);
      // Dark text on dark backdrop receives light token
      expect(darkFaded.style.color).toBe("rgb(255, 255, 255)");

      undo();
      expect(darkFaded.style.color).toBe("rgb(30, 41, 59)");
      darkContainer.remove();
    });

    it("honors AAA threshold when targetLevel is aaa", () => {
      container.style.backgroundColor = "#ffffff";

      // Contrast ratio ~5.5:1 (passes AA 4.5:1, but fails AAA 7.0:1)
      const midText = document.createElement("p");
      midText.style.color = "rgb(110, 110, 110)";
      midText.textContent = "Borderline AAA text";
      container.appendChild(midText);

      const reportAA = evaluateSmartContrast({
        root: container,
        targetLevel: "aa",
      });
      expect(reportAA.adjustedCount).toBe(0);
      expect(reportAA.sufficientCount).toBe(1);

      const reportAAA = evaluateSmartContrast({
        root: container,
        targetLevel: "aaa",
      });
      expect(reportAAA.adjustedCount).toBe(1);
      expect(reportAAA.sufficientCount).toBe(0);
      expect(reportAAA.targetRatioNormal).toBe(7.0);
    });

    it("dispatches custom event with report details", () => {
      const eventSpy = vi.fn();
      document.addEventListener("arap:smart-contrast-report", eventSpy);

      applySmartContrast({ root: container });

      expect(eventSpy).toHaveBeenCalledTimes(1);
      const customEvent = eventSpy.mock.calls[0][0] as CustomEvent;
      expect(customEvent.detail).toBeDefined();
      expect(customEvent.detail.disclaimer).toBe(SMART_CONTRAST_DISCLAIMER);

      document.removeEventListener("arap:smart-contrast-report", eventSpy);
    });
  });
});
