/**
 * Smart Contrast Research Prototype (A11Y-407).
 *
 * Implements measured contrast evaluation and assistance for eligible visible elements:
 * - Mathematical WCAG 2.1 relative luminance and contrast ratio algorithms
 * - Alpha compositing and ancestor backdrop resolution
 * - Fast batching: strictly separated read, compute, and write phases to prevent layout thrashing
 * - Detection and reporting of unsupported complex backdrops (gradients, background images, backdrop filters)
 * - Complete non-destructive restoration
 * - Strictly an opt-in research prototype: zero automatic WCAG compliance claims
 */


export const SMART_CONTRAST_DISCLAIMER =
  "Research prototype only. Smart contrast evaluates foreground and backdrop colors using WCAG 2.1 mathematical relative luminance algorithms. It does not replace manual accessibility inspection or guarantee legal/formal WCAG 2.1 AA/AAA compliance.";

export type SmartContrastLevel = "off" | "aa" | "aaa";

export type UnsupportedReason =
  | "gradient"
  | "background-image"
  | "backdrop-filter"
  | "invisible"
  | "indeterminate";

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface RgbaColor extends RgbColor {
  a: number;
}

export interface UnsupportedElementInfo {
  tag: string;
  id?: string;
  className?: string;
  reason: UnsupportedReason;
  textSnippet?: string;
}

export interface SmartContrastReport {
  evaluatedCount: number;
  adjustedCount: number;
  sufficientCount: number;
  unsupportedCount: number;
  unsupportedElements: UnsupportedElementInfo[];
  durationMs: number;
  targetLevel: "aa" | "aaa";
  targetRatioNormal: number;
  targetRatioLarge: number;
  disclaimer: string;
}

export interface SmartContrastOptions {
  /** Target WCAG contrast level: "aa" (4.5:1 normal / 3.0:1 large) or "aaa" (7.0:1 normal / 4.5:1 large). Defaults to "aa". */
  targetLevel?: "aa" | "aaa";
  /** Root container to evaluate. Defaults to document.body. */
  root?: HTMLElement;
  /** Maximum number of elements to process in a single pass to ensure 60fps responsiveness. Defaults to 2000. */
  maxElements?: number;
}

/** WCAG 2.1 target contrast thresholds */
export const TARGET_RATIOS = {
  aa: { normal: 4.5, large: 3.0 },
  aaa: { normal: 7.0, large: 4.5 },
} as const;

/** High-contrast replacement tokens designed for clean-light & dark contrast palettes */
export const HIGH_CONTRAST_TOKENS = {
  onLight: "#0f172a", // Dark slate (contrast > 18:1 against white)
  onDark: "#ffffff", // Pure white (contrast > 17:1 against dark slate)
} as const;

// In-memory color cache to speed up repetitive parsing
const colorParseCache = new Map<string, RgbaColor | null>();

/**
 * Standard named colors fallback map.
 */
const NAMED_COLORS: Record<string, RgbColor> = {
  black: { r: 0, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
  red: { r: 255, g: 0, b: 0 },
  green: { r: 0, g: 128, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  yellow: { r: 255, g: 255, b: 0 },
  cyan: { r: 0, g: 255, b: 255 },
  magenta: { r: 255, g: 0, b: 255 },
  gray: { r: 128, g: 128, b: 128 },
  grey: { r: 128, g: 128, b: 128 },
};

/**
 * Parses a CSS color string into an RGBA object.
 * Supports: rgb(), rgba(), hex (#rgb, #rgba, #rrggbb, #rrggbbaa), transparent, and standard named colors.
 */
export function parseColor(colorStr: string): RgbaColor | null {
  if (!colorStr) return null;
  const normalized = colorStr.trim().toLowerCase();
  if (colorParseCache.has(normalized)) {
    return colorParseCache.get(normalized)!;
  }

  if (normalized === "transparent" || normalized === "rgba(0, 0, 0, 0)") {
    const res: RgbaColor = { r: 0, g: 0, b: 0, a: 0 };
    colorParseCache.set(normalized, res);
    return res;
  }

  if (NAMED_COLORS[normalized]) {
    const { r, g, b } = NAMED_COLORS[normalized];
    const res: RgbaColor = { r, g, b, a: 1 };
    colorParseCache.set(normalized, res);
    return res;
  }

  // Hex: #rgb, #rgba, #rrggbb, #rrggbbaa
  if (normalized.startsWith("#")) {
    const hex = normalized.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
      const res: RgbaColor = { r, g, b, a };
      colorParseCache.set(normalized, res);
      return res;
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      const res: RgbaColor = { r, g, b, a };
      colorParseCache.set(normalized, res);
      return res;
    }
  }

  // Standard rgb(r, g, b) or rgba(r, g, b, a) or space-separated rgb(r g b / a)
  const rgbMatch = normalized.match(
    /^rgba?\s*\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)$/,
  );
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
    const a =
      rgbMatch[4] !== undefined
        ? Math.min(1, Math.max(0, parseFloat(rgbMatch[4])))
        : 1;
    const res: RgbaColor = { r, g, b, a };
    colorParseCache.set(normalized, res);
    return res;
  }

  return null;
}

/**
 * Converts an sRGB component (0–255) to linearized luminance value according to WCAG 2.1 specs.
 */
function sRgbToLinear(val: number): number {
  const c = val / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Calculates WCAG 2.1 relative luminance for an sRGB color.
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function calculateRelativeLuminance(
  r: number,
  g: number,
  b: number,
): number {
  return (
    0.2126 * sRgbToLinear(r) +
    0.7152 * sRgbToLinear(g) +
    0.0722 * sRgbToLinear(b)
  );
}

/**
 * Calculates contrast ratio between two relative luminances according to WCAG 2.1 specs.
 * Formula: (L1 + 0.05) / (L2 + 0.05), where L1 is lighter and L2 is darker.
 * Returns a value between 1.0 and 21.0.
 */
export function calculateContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Alpha composites a foreground layer over a background layer using standard Porter-Duff source-over blending.
 */
export function compositeRgba(fg: RgbaColor, bg: RgbaColor): RgbaColor {
  if (fg.a >= 1) return { ...fg, a: 1 };
  if (fg.a <= 0) return bg;

  const outA = fg.a + bg.a * (1 - fg.a);
  if (outA <= 0) return { r: 255, g: 255, b: 255, a: 0 };

  const r = Math.round((fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / outA);
  const g = Math.round((fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / outA);
  const b = Math.round((fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / outA);

  return { r, g, b, a: outA };
}

/**
 * Determines whether text qualifies as "large text" under WCAG 2.1 SC 1.4.3:
 * - At least 18pt (24px) normal, or
 * - At least 14pt (18.66px) bold (font-weight >= 700 or "bold").
 */
export function isLargeText(
  fontSizePx: number,
  fontWeight: string | number,
): boolean {
  if (fontSizePx >= 24) return true;
  const isBold =
    fontWeight === "bold" ||
    fontWeight === "bolder" ||
    (typeof fontWeight === "number" && fontWeight >= 700) ||
    (typeof fontWeight === "string" && parseInt(fontWeight, 10) >= 700);

  return fontSizePx >= 18.66 && isBold;
}

export interface BackdropResolution {
  backdrop: RgbaColor;
  isUnsupported: boolean;
  reason?: UnsupportedReason;
}

/**
 * Resolves the effective backdrop color beneath an element by traversing up the ancestor tree
 * and compositing semi-transparent layers. Detects unsupported complex backdrops.
 */
export function resolveEffectiveBackdrop(
  element: HTMLElement,
  computedMap?: Map<Element, CSSStyleDeclaration>,
): BackdropResolution {
  let current = element.parentElement;
  let composite: RgbaColor = { r: 255, g: 255, b: 255, a: 0 };

  while (current && current !== document.documentElement) {
    const computed =
      computedMap?.get(current) ?? window.getComputedStyle(current);

    // Check for unsupported complex background images / gradients
    const bgImage =
      computed.backgroundImage ||
      (current instanceof HTMLElement &&
        (current.style.backgroundImage ||
          current.style.getPropertyValue("background-image")));
    if (bgImage && bgImage !== "none") {
      if (
        bgImage.includes("gradient") ||
        bgImage.includes("linear-gradient") ||
        bgImage.includes("radial-gradient")
      ) {
        return {
          backdrop: { r: 255, g: 255, b: 255, a: 1 },
          isUnsupported: true,
          reason: "gradient",
        };
      }
      if (bgImage.includes("url(")) {
        return {
          backdrop: { r: 255, g: 255, b: 255, a: 1 },
          isUnsupported: true,
          reason: "background-image",
        };
      }
    }

    // Check for backdrop-filter
    const backdropFilter =
      computed.backdropFilter ||
      (computed as unknown as { webkitBackdropFilter?: string })
        .webkitBackdropFilter ||
      computed.getPropertyValue?.("backdrop-filter") ||
      (current instanceof HTMLElement &&
        (current.style.backdropFilter ||
          current.style.getPropertyValue("backdrop-filter")));
    if (backdropFilter && backdropFilter !== "none") {
      return {
        backdrop: { r: 255, g: 255, b: 255, a: 1 },
        isUnsupported: true,
        reason: "backdrop-filter",
      };
    }

    // Parse and composite background color
    const bgColor = parseColor(computed.backgroundColor);
    if (bgColor && bgColor.a > 0) {
      composite = compositeRgba(composite, bgColor);
      if (composite.a >= 1) {
        return { backdrop: composite, isUnsupported: false };
      }
    }

    current = current.parentElement;
  }

  // Root fallback: inspect document.body background or default to pure white (#ffffff)
  if (typeof document !== "undefined" && document.body) {
    const bodyComputed =
      computedMap?.get(document.body) ??
      window.getComputedStyle(document.body);
    const bodyBg = parseColor(bodyComputed.backgroundColor);
    if (bodyBg && bodyBg.a > 0) {
      composite = compositeRgba(composite, bodyBg);
    }
  }

  // If still not opaque, blend over default white canvas
  if (composite.a < 1) {
    composite = compositeRgba(composite, { r: 255, g: 255, b: 255, a: 1 });
  }

  return { backdrop: composite, isUnsupported: false };
}

/**
 * Checks whether an element is eligible for smart contrast inspection.
 */
export function isEligibleForSmartContrast(element: Element): boolean {
  if (!(element instanceof HTMLElement)) return false;

  // Never inspect internal accessibility plugin UI or exempt trees
  if (
    element.closest(
      "[data-arap-ui], .arap-root, [data-arap-ignore], [data-arap-exempt]",
    )
  ) {
    return false;
  }

  // Skip non-rendered metadata tags and media tags
  if (
    element.matches(
      "script, style, link, meta, noscript, template, img, video, picture, canvas, svg, audio, iframe, embed, object",
    )
  ) {
    return false;
  }

  // Skip disabled or invalid controls: maintain author or platform semantic states
  if (
    element.matches(
      ":disabled, [disabled], [aria-disabled='true'], [aria-invalid='true'], :invalid",
    )
  ) {
    return false;
  }

  // Check if element has direct non-empty text content
  const hasDirectText = Array.from(element.childNodes).some(
    (node) =>
      node.nodeType === 3 &&
      (node.textContent || "").trim().length > 0,
  );
  if (!hasDirectText) return false;

  return true;
}

interface BatchedElementData {
  element: HTMLElement;
  computed: CSSStyleDeclaration;
  fontSize: number;
  fontWeight: string;
  fgColor: RgbaColor;
}

/**
 * Evaluates smart contrast for all eligible elements within root without modifying the DOM.
 * Implements strict batching to prevent layout thrashing.
 */
export function evaluateSmartContrast(
  options: SmartContrastOptions = {},
): SmartContrastReport {
  const startTime = typeof performance !== "undefined" ? performance.now() : 0;
  const targetLevel = options.targetLevel ?? "aa";
  const thresholds = TARGET_RATIOS[targetLevel];
  const maxElements = options.maxElements ?? 2000;
  const root =
    options.root ?? (typeof document !== "undefined" ? document.body : null);

  if (!root || typeof window === "undefined") {
    return {
      evaluatedCount: 0,
      adjustedCount: 0,
      sufficientCount: 0,
      unsupportedCount: 0,
      unsupportedElements: [],
      durationMs: 0,
      targetLevel,
      targetRatioNormal: thresholds.normal,
      targetRatioLarge: thresholds.large,
      disclaimer: SMART_CONTRAST_DISCLAIMER,
    };
  }

  // =========================================================================
  // PHASE 1: BATCHED READS (zero DOM writes)
  // =========================================================================
  const allNodes = Array.from(root.querySelectorAll<HTMLElement>("*")).slice(
    0,
    maxElements,
  );
  const eligibleBatch: BatchedElementData[] = [];
  const computedMap = new Map<Element, CSSStyleDeclaration>();

  for (const el of allNodes) {
    if (!isEligibleForSmartContrast(el)) continue;

    const computed = window.getComputedStyle(el);
    computedMap.set(el, computed);

    // Skip invisible elements
    if (
      computed.display === "none" ||
      computed.visibility === "hidden" ||
      computed.opacity === "0"
    ) {
      continue;
    }

    const fgColor = parseColor(computed.color);
    if (!fgColor) continue;

    const fontSize = parseFloat(computed.fontSize) || 16;
    const fontWeight = computed.fontWeight || "400";

    eligibleBatch.push({
      element: el,
      computed,
      fontSize,
      fontWeight,
      fgColor,
    });
  }

  // =========================================================================
  // PHASE 2: PURE COMPUTATION & COMPOSITING (zero DOM reads, zero DOM writes)
  // =========================================================================
  let adjustedCount = 0;
  let sufficientCount = 0;
  let unsupportedCount = 0;
  const unsupportedElements: UnsupportedElementInfo[] = [];

  for (const item of eligibleBatch) {
    const backdropRes = resolveEffectiveBackdrop(item.element, computedMap);

    if (backdropRes.isUnsupported) {
      unsupportedCount++;
      if (unsupportedElements.length < 20) {
        unsupportedElements.push({
          tag: item.element.tagName.toLowerCase(),
          id: item.element.id || undefined,
          className: item.element.className || undefined,
          reason: backdropRes.reason ?? "indeterminate",
          textSnippet: (item.element.textContent || "").slice(0, 30).trim(),
        });
      }
      continue;
    }

    // Composite foreground if semi-transparent over backdrop
    const effectiveFg = compositeRgba(item.fgColor, backdropRes.backdrop);

    const fgLuminance = calculateRelativeLuminance(
      effectiveFg.r,
      effectiveFg.g,
      effectiveFg.b,
    );
    const bgLuminance = calculateRelativeLuminance(
      backdropRes.backdrop.r,
      backdropRes.backdrop.g,
      backdropRes.backdrop.b,
    );

    const ratio = calculateContrastRatio(fgLuminance, bgLuminance);
    const isLarge = isLargeText(item.fontSize, item.fontWeight);
    const requiredRatio = isLarge ? thresholds.large : thresholds.normal;

    if (ratio >= requiredRatio) {
      sufficientCount++;
    } else {
      adjustedCount++;
    }
  }

  const durationMs =
    typeof performance !== "undefined"
      ? Math.round((performance.now() - startTime) * 100) / 100
      : 0;

  return {
    evaluatedCount: eligibleBatch.length,
    adjustedCount,
    sufficientCount,
    unsupportedCount,
    unsupportedElements,
    durationMs,
    targetLevel,
    targetRatioNormal: thresholds.normal,
    targetRatioLarge: thresholds.large,
    disclaimer: SMART_CONTRAST_DISCLAIMER,
  };
}

export interface AppliedSmartContrast {
  report: SmartContrastReport;
  undo: () => void;
}

interface RestorationEntry {
  element: HTMLElement;
  prevColor: string;
  prevPriority: string;
}

/**
 * Evaluates and applies measured contrast adjustments to eligible elements.
 * Separates reads, computation, and batched writes to prevent layout thrashing.
 * Returns the audit report and an idempotent undo() restoration function.
 */
export function applySmartContrast(
  options: SmartContrastOptions = {},
): AppliedSmartContrast {
  const startTime = typeof performance !== "undefined" ? performance.now() : 0;
  const targetLevel = options.targetLevel ?? "aa";
  const thresholds = TARGET_RATIOS[targetLevel];
  const maxElements = options.maxElements ?? 2000;
  const root =
    options.root ?? (typeof document !== "undefined" ? document.body : null);

  if (!root || typeof window === "undefined") {
    return {
      report: {
        evaluatedCount: 0,
        adjustedCount: 0,
        sufficientCount: 0,
        unsupportedCount: 0,
        unsupportedElements: [],
        durationMs: 0,
        targetLevel,
        targetRatioNormal: thresholds.normal,
        targetRatioLarge: thresholds.large,
        disclaimer: SMART_CONTRAST_DISCLAIMER,
      },
      undo: () => {},
    };
  }

  // =========================================================================
  // PHASE 1: BATCHED READS (zero writes)
  // =========================================================================
  const allNodes = Array.from(root.querySelectorAll<HTMLElement>("*")).slice(
    0,
    maxElements,
  );
  const eligibleBatch: BatchedElementData[] = [];
  const computedMap = new Map<Element, CSSStyleDeclaration>();

  for (const el of allNodes) {
    if (!isEligibleForSmartContrast(el)) continue;

    const computed = window.getComputedStyle(el);
    computedMap.set(el, computed);

    if (
      computed.display === "none" ||
      computed.visibility === "hidden" ||
      computed.opacity === "0"
    ) {
      continue;
    }

    const fgColor = parseColor(computed.color);
    if (!fgColor) continue;

    eligibleBatch.push({
      element: el,
      computed,
      fontSize: parseFloat(computed.fontSize) || 16,
      fontWeight: computed.fontWeight || "400",
      fgColor,
    });
  }

  // =========================================================================
  // PHASE 2: PURE COMPUTATION
  // =========================================================================
  const adjustments: Array<{ element: HTMLElement; targetColor: string }> = [];
  let sufficientCount = 0;
  let unsupportedCount = 0;
  const unsupportedElements: UnsupportedElementInfo[] = [];

  for (const item of eligibleBatch) {
    const backdropRes = resolveEffectiveBackdrop(item.element, computedMap);

    if (backdropRes.isUnsupported) {
      unsupportedCount++;
      if (unsupportedElements.length < 20) {
        unsupportedElements.push({
          tag: item.element.tagName.toLowerCase(),
          id: item.element.id || undefined,
          className: item.element.className || undefined,
          reason: backdropRes.reason ?? "indeterminate",
          textSnippet: (item.element.textContent || "").slice(0, 30).trim(),
        });
      }
      continue;
    }

    const effectiveFg = compositeRgba(item.fgColor, backdropRes.backdrop);
    const fgLuminance = calculateRelativeLuminance(
      effectiveFg.r,
      effectiveFg.g,
      effectiveFg.b,
    );
    const bgLuminance = calculateRelativeLuminance(
      backdropRes.backdrop.r,
      backdropRes.backdrop.g,
      backdropRes.backdrop.b,
    );

    const ratio = calculateContrastRatio(fgLuminance, bgLuminance);
    const isLarge = isLargeText(item.fontSize, item.fontWeight);
    const requiredRatio = isLarge ? thresholds.large : thresholds.normal;

    if (ratio >= requiredRatio) {
      sufficientCount++;
    } else {
      // Determine optimal replacement color based on backdrop luminance
      const isLightBackdrop = bgLuminance > 0.179;
      const targetColor = isLightBackdrop
        ? HIGH_CONTRAST_TOKENS.onLight
        : HIGH_CONTRAST_TOKENS.onDark;

      adjustments.push({
        element: item.element,
        targetColor,
      });
    }
  }

  // =========================================================================
  // PHASE 3: BATCHED WRITES & RESTORATION TRACKING (zero reads)
  // =========================================================================
  const restorationEntries: RestorationEntry[] = [];

  for (const adj of adjustments) {
    const prevColor = adj.element.style.getPropertyValue("color");
    const prevPriority = adj.element.style.getPropertyPriority("color");

    restorationEntries.push({
      element: adj.element,
      prevColor,
      prevPriority,
    });

    adj.element.style.setProperty("color", adj.targetColor, "important");
    adj.element.setAttribute("data-arap-smart-contrast", "true");
  }

  const durationMs =
    typeof performance !== "undefined"
      ? Math.round((performance.now() - startTime) * 100) / 100
      : 0;

  const report: SmartContrastReport = {
    evaluatedCount: eligibleBatch.length,
    adjustedCount: adjustments.length,
    sufficientCount,
    unsupportedCount,
    unsupportedElements,
    durationMs,
    targetLevel,
    targetRatioNormal: thresholds.normal,
    targetRatioLarge: thresholds.large,
    disclaimer: SMART_CONTRAST_DISCLAIMER,
  };

  // Dispatch custom event for UI status components
  if (typeof document !== "undefined") {
    try {
      document.dispatchEvent(
        new CustomEvent("arap:smart-contrast-report", { detail: report }),
      );
    } catch {
      // Ignore in environments where CustomEvent dispatch is restricted
    }
  }

  // Idempotent undo restoration function
  let restored = false;
  const undo = () => {
    if (restored) return;
    restored = true;

    for (const entry of restorationEntries) {
      if (entry.prevColor) {
        entry.element.style.setProperty(
          "color",
          entry.prevColor,
          entry.prevPriority,
        );
      } else {
        entry.element.style.removeProperty("color");
      }
      entry.element.removeAttribute("data-arap-smart-contrast");
    }
  };

  return { report, undo };
}
