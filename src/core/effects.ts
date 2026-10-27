import { useEffect } from "react";
import { builtins } from "./featureSchema";
import { applySmartContrast } from "./smartContrast";
import type { FeatureRegistration } from "./types";

const EXCLUDED =
  "[data-arap-ui], [data-arap-ui] *, script, style, link, meta, noscript, template";
const MAX_HOST_ELEMENTS = 4000;
const cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M4 2v32l9-9 7 13 6-3-7-12h14z' fill='black' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 4 2, auto`;
/** Detects whether the user's operating system has forced colors / high contrast active. */
export function isForcedColorsActive(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(forced-colors: active)").matches;
  } catch {
    return false;
  }
}

export function subscribeForcedColors(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  try {
    const mql = window.matchMedia("(forced-colors: active)");
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  } catch {
    return () => {};
  }
}

/** Detects whether the user's operating system has prefers-reduced-motion active. */
export function isReducedMotionActive(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function subscribeReducedMotion(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  try {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  } catch {
    return () => {};
  }
}

/** Detects whether the device supports a fine pointer (mouse, trackpad, pen). */
export function hasFinePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  try {
    const fine = window.matchMedia("(pointer: fine)");
    if (fine.matches) return true;
    const coarse = window.matchMedia("(pointer: coarse)");
    if (coarse.matches && !fine.matches) return false;
    return true;
  } catch {
    return true;
  }
}

export function subscribeFinePointer(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  try {
    const mql = window.matchMedia("(pointer: fine)");
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  } catch {
    return () => {};
  }
}

export interface ContrastPalette {
  text: string;
  background: string;
  border?: string;
  link?: string;
}

export const CONTRAST_PALETTES: Record<string, ContrastPalette> = {
  light: {
    text: "#0f172a",
    background: "#ffffff",
    border: "#94a3b8",
    link: "#0284c7",
  },
  dark: {
    text: "#f8fafc",
    background: "#0f172a",
    border: "#475569",
    link: "#38bdf8",
  },
  high: {
    text: "#ffffff",
    background: "#000000",
    border: "#ffffff",
    link: "#93c5fd",
  },
  "yellow-on-black": {
    text: "#ffff00",
    background: "#000000",
    border: "#ffff00",
    link: "#00ffff",
  },
  "white-on-black": {
    text: "#ffffff",
    background: "#000000",
    border: "#ffffff",
    link: "#ffff00",
  },
  "blue-on-yellow": {
    text: "#005a9c",
    background: "#ffd740",
    border: "#005a9c",
    link: "#002b49",
  },
  "black-on-white": {
    text: "#000000",
    background: "#ffffff",
    border: "#000000",
    link: "#0000ee",
  },
};

const palette: Record<string, [string, string]> = {
  "yellow-on-black": ["#ffff00", "#000000"],
  "white-on-black": ["#ffffff", "#000000"],
  "blue-on-yellow": ["#005a9c", "#ffd740"],
  "black-on-white": ["#000000", "#ffffff"],
  light: ["#0f172a", "#ffffff"],
  dark: ["#f8fafc", "#0f172a"],
  high: ["#ffffff", "#000000"],
};

/** One deterministic composition, independent of controller render order. */
export function composeFilter(values: Record<string, unknown>): string {
  if (isForcedColorsActive()) return "";

  const contrast =
    values.contrast === "reduced"
      ? 0.5
      : ([1, 1.25, 1.5, 2][Number(values.contrast)] ?? 1);
  const isInvert =
    Boolean(values.invertColors) ||
    values.contrast === "invert" ||
    values.contrastMode === "invert";

  const isLowSat = values.saturation === 1 || values.saturation === "low";
  const isHighSat = values.saturation === 2 || values.saturation === "high";
  const isGrayscale =
    Boolean(values.grayscale) ||
    values.saturation === 3 ||
    values.saturation === "grayscale";

  return [
    contrast !== 1 && `contrast(${contrast})`,
    isLowSat && "saturate(0.2)",
    isHighSat && "saturate(2)",
    isInvert && "invert(1)",
    isGrayscale && "grayscale(1)",
  ]
    .filter(Boolean)
    .join(" ");
}

export const CONTRAST_PROTECTED_SELECTOR = [
  "img",
  "picture",
  "picture *",
  "video",
  "canvas",
  "svg",
  "svg *",
  "[role='img']",
  "[role='img'] *",
  "[role='graphics-document']",
  "[role='graphics-document'] *",
  "[role='graphics-symbol']",
  "[role='graphics-symbol'] *",
  "[data-icon]",
  "[data-icon] *",
  'i[class*="icon"]',
  'span[class*="icon"]',
  'i[class*="fa-"]',
  'span[class*="fa-"]',
  'i[class*="material-symbols"]',
  'span[class*="material-symbols"]',
  'i[class*="lucide"]',
  'span[class*="lucide"]',
  '[aria-invalid="true"]',
  '[aria-invalid="true"] *',
  ":invalid",
  ".is-invalid",
  ".invalid-feedback",
  ":disabled",
  "[aria-disabled='true']",
  "[disabled]",
  "[data-arap-ignore]",
  "[data-arap-ignore] *",
  "[data-arap-exempt]",
  "[data-arap-exempt] *",
  "[data-arap-ui]",
  "[data-arap-ui] *",
  ".arap-root",
  ".arap-root *",
].join(", ");

export function isProtectedFromContrast(element: HTMLElement): boolean {
  try {
    if (element.matches(EXCLUDED)) return true;
    if (element.matches(CONTRAST_PROTECTED_SELECTOR)) return true;
    if (
      element.closest(
        "svg, [role='img'], [data-icon], [aria-invalid='true'], :disabled, [aria-disabled='true'], [data-arap-ignore], [data-arap-exempt], [data-arap-ui], .arap-root",
      )
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export const TEXT_SCALE_PROTECTED_SELECTOR = [
  "input",
  "textarea",
  "select",
  "select *",
  "option",
  "optgroup",
  "button",
  "button *",
  "datalist",
  "output",
  "progress",
  "meter",
  "label",
  "label *",
  "legend",
  "legend *",
  "pre",
  "pre *",
  "code",
  "kbd",
  "samp",
  "var",
  "svg",
  "svg *",
  "[data-icon]",
  "[data-icon] *",
  'i[class*="icon"]',
  'span[class*="icon"]',
  'i[class*="fa-"]',
  'span[class*="fa-"]',
  'i[class*="material-symbols"]',
  'span[class*="material-symbols"]',
  'i[class*="lucide"]',
  'span[class*="lucide"]',
  "[data-arap-ignore]",
  "[data-arap-ignore] *",
  "[data-arap-exempt]",
  "[data-arap-exempt] *",
].join(", ");

export function isProtectedFromTextScale(element: HTMLElement): boolean {
  try {
    if (element.matches(EXCLUDED)) return true;
    if (element.matches(TEXT_SCALE_PROTECTED_SELECTOR)) return true;
    if (
      element.closest(
        "pre, button, label, legend, select, [data-arap-ignore], [data-arap-exempt], [data-arap-ui]",
      )
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export const TEXT_SPACING_EXCLUDED_SELECTOR = [
  "input",
  "textarea",
  "select",
  "select *",
  "option",
  "optgroup",
  "button",
  "button *",
  "datalist",
  "output",
  "progress",
  "meter",
  "label",
  "label *",
  "legend",
  "legend *",
  '[role="button"]',
  '[role="button"] *',
  '[role="checkbox"]',
  '[role="combobox"]',
  '[role="menuitem"]',
  '[role="tab"]',
  "pre",
  "pre *",
  "code",
  "kbd",
  "samp",
  "var",
  "table",
  "table *",
  "thead",
  "thead *",
  "tbody",
  "tbody *",
  "tfoot",
  "tfoot *",
  "tr",
  "tr *",
  "th",
  "th *",
  "td",
  "td *",
  "caption",
  "colgroup",
  "col",
  '[role="table"]',
  '[role="table"] *',
  '[role="grid"]',
  '[role="grid"] *',
  '[role="row"]',
  '[role="row"] *',
  '[role="cell"]',
  '[role="cell"] *',
  '[role="columnheader"]',
  '[role="columnheader"] *',
  '[role="rowheader"]',
  '[role="rowheader"] *',
  "svg",
  "svg *",
  "[data-icon]",
  "[data-icon] *",
  'i[class*="icon"]',
  'span[class*="icon"]',
  'i[class*="fa-"]',
  'span[class*="fa-"]',
  'i[class*="material-symbols"]',
  'span[class*="material-symbols"]',
  'i[class*="lucide"]',
  'span[class*="lucide"]',
  "[data-arap-ignore]",
  "[data-arap-ignore] *",
  "[data-arap-exempt]",
  "[data-arap-exempt] *",
  "[data-arap-ui]",
  "[data-arap-ui] *",
  ".arap-root",
  ".arap-root *",
].join(", ");

export function isProtectedFromTextSpacing(element: HTMLElement): boolean {
  try {
    if (element.matches(EXCLUDED)) return true;
    if (element.matches(TEXT_SPACING_EXCLUDED_SELECTOR)) return true;
    if (
      element.closest(
        "pre, button, label, legend, select, textarea, [role='button'], table, [role='table'], [role='grid'], [data-arap-ignore], [data-arap-exempt], [data-arap-ui], .arap-root",
      )
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export const TEXT_ALIGN_BLOCK_SELECTOR = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "blockquote",
  "dt",
  "dd",
  "figcaption",
  '[role="paragraph"]',
  '[role="heading"]',
].join(", ");

export function isProtectedFromTextAlign(element: HTMLElement): boolean {
  try {
    if (element.matches(EXCLUDED)) return true;
    if (element.matches(TEXT_SPACING_EXCLUDED_SELECTOR)) return true;
    if (
      element.closest(
        "pre, code, kbd, samp, var, button, input, select, textarea, [role='button'], table, [role='table'], [role='grid'], [data-arap-ignore], [data-arap-exempt], [data-arap-ui], .arap-root",
      )
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Standard legible font stack with Sinhala ("Noto Sans Sinhala", "Iskoola Pota")
 * and Tamil ("Noto Sans Tamil", "Latha", "Nirmala UI") script fallbacks.
 */
export const LEGIBLE_FONT_STACK = [
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Roboto",
  '"Helvetica Neue"',
  "Arial",
  '"Noto Sans Sinhala"',
  '"Iskoola Pota"',
  '"Noto Sans Tamil"',
  '"Latha"',
  '"Nirmala UI"',
  "sans-serif",
].join(", ");

/**
 * Dyslexia-friendly font stack with OpenDyslexic (licensed under SIL OFL / CC-BY),
 * weighted rounded fallbacks, and Indic/Sinhala/Tamil script fallbacks.
 */
export const DYSLEXIA_FONT_STACK = [
  "OpenDyslexic",
  '"Comic Sans MS"',
  '"Trebuchet MS"',
  '"Arial Rounded MT Bold"',
  '"Noto Sans Sinhala"',
  '"Iskoola Pota"',
  '"Noto Sans Tamil"',
  '"Latha"',
  "sans-serif",
].join(", ");

export const FONT_FAMILY_PROTECTED_SELECTOR = [
  "pre",
  "pre *",
  "code",
  "code *",
  "kbd",
  "kbd *",
  "samp",
  "samp *",
  "var",
  "var *",
  "svg",
  "svg *",
  "[data-icon]",
  "[data-icon] *",
  'i[class*="icon"]',
  'span[class*="icon"]',
  'i[class*="fa-"]',
  'span[class*="fa-"]',
  'i[class*="material-symbols"]',
  'span[class*="material-symbols"]',
  'i[class*="lucide"]',
  'span[class*="lucide"]',
  "[data-arap-ignore]",
  "[data-arap-ignore] *",
  "[data-arap-exempt]",
  "[data-arap-exempt] *",
  "[data-arap-ui]",
  "[data-arap-ui] *",
  ".arap-root",
  ".arap-root *",
].join(", ");

export function isProtectedFromFontFamily(element: HTMLElement): boolean {
  try {
    if (element.matches(EXCLUDED)) return true;
    if (element.matches(FONT_FAMILY_PROTECTED_SELECTOR)) return true;
    if (
      element.closest(
        "pre, code, kbd, samp, var, svg, [data-icon], [data-arap-ignore], [data-arap-exempt], [data-arap-ui], .arap-root",
      )
    ) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export interface ScriptSpacingConstraints {
  allowLetterSpacing: boolean;
  maxLetterSpacingPx: number;
  script: "cursive" | "indic" | "standard";
}

const ARABIC_SCRIPT_REGEX =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const INDIC_SCRIPT_REGEX = /[\u0900-\u0DFF]/;
const CURSIVE_LANG_REGEX = /^(ar|fa|ur|ug|dv|ps|ku)($|-)/i;
const INDIC_LANG_REGEX = /^(si|ta|hi|bn|te|kn|ml|gu|pa|mr|ne|sa)($|-)/i;

export function getScriptSpacingConstraints(
  element: HTMLElement,
): ScriptSpacingConstraints {
  const lang =
    element.closest("[lang]")?.getAttribute("lang") ||
    document.documentElement.lang ||
    "";
  const dir =
    element.closest("[dir]")?.getAttribute("dir") ||
    document.documentElement.dir ||
    "";

  if (CURSIVE_LANG_REGEX.test(lang) || dir.toLowerCase() === "rtl") {
    return {
      allowLetterSpacing: false,
      maxLetterSpacingPx: 0,
      script: "cursive",
    };
  }

  if (INDIC_LANG_REGEX.test(lang)) {
    return {
      allowLetterSpacing: true,
      maxLetterSpacingPx: 1,
      script: "indic",
    };
  }

  const text = element.textContent || "";
  if (text.length > 0) {
    if (ARABIC_SCRIPT_REGEX.test(text)) {
      return {
        allowLetterSpacing: false,
        maxLetterSpacingPx: 0,
        script: "cursive",
      };
    }
    if (INDIC_SCRIPT_REGEX.test(text)) {
      return {
        allowLetterSpacing: true,
        maxLetterSpacingPx: 1,
        script: "indic",
      };
    }
  }

  return {
    allowLetterSpacing: true,
    maxLetterSpacingPx: Infinity,
    script: "standard",
  };
}

/**
 * Determines whether an element represents functional, informative, or protected visual content
 * (e.g., interactive controls, CAPTCHA, charts, graphs, maps, QR codes, or images with meaningful alt/names).
 * Such content must NEVER be hidden by decorative image preferences.
 */
export function isFunctionalOrMeaningfulImage(el: Element): boolean {
  try {
    // 1. Linked or interactive controls: images inside buttons, links, inputs, or interactive roles
    if (
      el.closest(
        "a, button, [role='button'], [role='link'], [role='menuitem'], [role='tab'], input, select, textarea, summary",
      )
    ) {
      return true;
    }

    // 2. CAPTCHA verification
    if (
      el.closest(
        "[id*='captcha' i], [class*='captcha' i], [aria-label*='captcha' i], [data-captcha]",
      ) ||
      el.matches(
        "[src*='captcha' i], [alt*='captcha' i], [title*='captcha' i], [id*='captcha' i], [class*='captcha' i]",
      )
    ) {
      return true;
    }

    // 3. Charts, graphs, diagrams, and figures
    if (
      el.closest(
        "[role='graphics-document'], [role='graphics-symbol'], [role='figure'], figure, [class*='chart' i], [id*='chart' i], [class*='graph' i], [id*='graph' i], [class*='diagram' i], [id*='diagram' i]",
      ) ||
      el.matches(
        "[role='graphics-document'], [role='graphics-symbol'], [aria-roledescription*='chart' i]",
      )
    ) {
      return true;
    }

    // 4. Maps and geolocation
    if (
      el.closest(
        "[role='region'][aria-label*='map' i], [class*='map' i], [id*='map' i], [data-map]",
      ) ||
      el.matches(
        "[src*='maps' i], [src*='tiles' i], [src*='openstreetmap' i], [src*='mapbox' i]",
      )
    ) {
      return true;
    }

    // 5. QR codes and barcodes
    if (
      el.closest(
        "[class*='qr' i], [id*='qr' i], [class*='barcode' i], [id*='barcode' i]",
      ) ||
      el.matches(
        "[src*='qr' i], [alt*='qr' i], [src*='barcode' i], [alt*='barcode' i]",
      )
    ) {
      return true;
    }

    // 6. Mathematical formulas
    if (el.closest("[role='math'], math, [class*='math' i]")) {
      return true;
    }

    // 7. Meaningful accessible names or semantic roles
    if (el.hasAttribute("alt")) {
      const alt = el.getAttribute("alt")?.trim();
      if (alt && alt.length > 0) return true;
    }

    if (el.hasAttribute("aria-label")) {
      const label = el.getAttribute("aria-label")?.trim();
      if (label && label.length > 0) return true;
    }

    if (el.hasAttribute("aria-labelledby")) {
      const labelledby = el.getAttribute("aria-labelledby")?.trim();
      if (labelledby && labelledby.length > 0) return true;
    }

    if (el.hasAttribute("title")) {
      const title = el.getAttribute("title")?.trim();
      if (title && title.length > 0) return true;
    }

    const role = el.getAttribute("role");
    if (role && role !== "presentation" && role !== "none" && role !== "img") {
      return true;
    }
    if (
      role === "img" &&
      (el.hasAttribute("aria-label") ||
        el.hasAttribute("aria-labelledby") ||
        el.hasAttribute("title") ||
        (el.hasAttribute("alt") && el.getAttribute("alt")?.trim() !== ""))
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Determines whether an element represents an eligible decorative image that is safe to hide.
 * An image is eligible if it is not functional or meaningful, and meets standard decorative cues
 * (empty alt="", role="presentation", role="none", aria-hidden="true", or decorative class/attribute).
 */
export function isEligibleDecorativeImage(el: Element): boolean {
  try {
    if (isFunctionalOrMeaningfulImage(el)) {
      return false;
    }

    if (el.matches("img, picture")) {
      // 1. Explicitly decorative alt (alt="" or whitespace-only)
      if (el.hasAttribute("alt") && el.getAttribute("alt")?.trim() === "") {
        return true;
      }

      // 2. Explicitly decorative ARIA role
      const role = el.getAttribute("role");
      if (role === "presentation" || role === "none") {
        return true;
      }

      // 3. Hidden from assistive technologies
      if (el.getAttribute("aria-hidden") === "true") {
        return true;
      }

      // 4. Explicit decorative marker
      if (
        el.hasAttribute("data-decorative") ||
        el.classList.contains("decorative") ||
        el.classList.contains("deco")
      ) {
        return true;
      }

      // For <picture>, check child <img> elements
      if (el.matches("picture")) {
        const childImg = el.querySelector("img");
        if (childImg && isEligibleDecorativeImage(childImg)) {
          return true;
        }
      }

      return false;
    }
  } catch {
    return false;
  }

  return false;
}

function applyPage(values: Record<string, unknown>): () => void {
  const undo: (() => void)[] = [];
  function set(element: HTMLElement, property: string, value: string) {
    const previous = element.style.getPropertyValue(property);
    const priority = element.style.getPropertyPriority(property);
    element.style.setProperty(property, value, "important");
    const applied = element.style.getPropertyValue(property);
    undo.push(() => {
      // Do not overwrite a newer host-owned change to the same property.
      if (
        element.style.getPropertyValue(property) !== applied ||
        element.style.getPropertyPriority(property) !== "important"
      )
        return;
      if (previous) element.style.setProperty(property, previous, priority);
      else element.style.removeProperty(property);
    });
  }
  const allElements = Array.from(
    document.body.querySelectorAll<HTMLElement>("*"),
  ).filter((el) => el instanceof HTMLElement && !el.matches(EXCLUDED));
  // Limit total elements to prevent main thread starvation in massive host DOMs
  const elements =
    allElements.length > MAX_HOST_ELEMENTS
      ? allElements.slice(0, MAX_HOST_ELEMENTS)
      : allElements;
  const fontScaleValue =
    typeof values.fontScale === "number" && values.fontScale !== 1.0
      ? values.fontScale
      : typeof values.textScale === "number" && values.textScale !== 1.0
        ? values.textScale
        : undefined;
  const fontSizeScale =
    typeof values.fontSize === "number" && values.fontSize !== 100
      ? values.fontSize / 100
      : undefined;
  const font = fontScaleValue ?? fontSizeScale ?? 1.0;

  const rawLineHeight =
    typeof values.lineHeight === "number" ? values.lineHeight : 100;
  const lineRatio = rawLineHeight <= 2.5 ? rawLineHeight : rawLineHeight / 100;
  const fontActive = font !== 1;
  const lineActive = lineRatio !== 1;

  // Measure all baselines before writing, so nested elements never compound scaling.
  // Protect forms, labels, code, icons, widget and explicitly ignored elements from text scale.
  // Protect tables, forms, code, icons, widget from spacing line-height overrides.
  if (fontActive || lineActive) {
    const measurements = elements
      .filter(
        (el) =>
          !isProtectedFromTextScale(el) || !isProtectedFromTextSpacing(el),
      )
      .map((el) => {
        const computed = getComputedStyle(el);
        return {
          el,
          protectScale: isProtectedFromTextScale(el),
          protectSpacing: isProtectedFromTextSpacing(el),
          font: parseFloat(computed.fontSize) || 16,
          line:
            parseFloat(computed.lineHeight) ||
            (parseFloat(computed.fontSize) || 16) * 1.2,
        };
      });

    for (const measured of measurements) {
      if (fontActive && !measured.protectScale) {
        set(measured.el, "font-size", `${measured.font * font}px`);
      }
      if (measured.protectSpacing) {
        // Excluded from spacing line-height overrides (tables, controls, code, widget).
        // If font was scaled, scale line-height proportionally without lineRatio inflation.
        if (fontActive && !measured.protectScale) {
          set(measured.el, "line-height", `${measured.line * font}px`);
        } else if (lineActive) {
          // Isolate from inherited line-height on parent containers
          const prev = measured.el.style.getPropertyValue("line-height");
          if (!prev) {
            set(measured.el, "line-height", `${measured.line}px`);
          }
        }
      } else {
        if (lineActive || fontActive) {
          set(
            measured.el,
            "line-height",
            `${measured.line * lineRatio * font}px`,
          );
        }
      }
    }
  }

  const filter = composeFilter(values);
  // Never filter html/body: they would also transform fixed widget positioning.
  for (const el of Array.from(document.body.children)) {
    if (!(el instanceof HTMLElement) || el.matches(EXCLUDED) || !filter)
      continue;
    const computed = getComputedStyle(el);
    if (
      computed.backgroundColor === "rgba(0, 0, 0, 0)" ||
      computed.backgroundColor === "transparent"
    ) {
      const bodyColor = getComputedStyle(document.body).backgroundColor;
      set(
        el,
        "background-color",
        bodyColor &&
          bodyColor !== "rgba(0, 0, 0, 0)" &&
          bodyColor !== "transparent"
          ? bodyColor
          : "#ffffff",
      );
    }
    const base = computed.filter;
    set(el, "filter", `${base && base !== "none" ? base + " " : ""}${filter}`);
  }

  // Letter spacing with language-aware constraints and element protections
  const letterSpacingVal =
    typeof values.letterSpacing === "number" && values.letterSpacing > 0
      ? values.letterSpacing
      : 0;
  const letterSpacingEmVal =
    typeof values.letterSpacingEm === "number" && values.letterSpacingEm > 0
      ? values.letterSpacingEm
      : null;

  if (letterSpacingVal > 0 || letterSpacingEmVal !== null) {
    for (const el of elements) {
      if (isProtectedFromTextSpacing(el)) {
        if (
          el.matches(
            "table, [role='table'], td, th, pre, code, kbd, samp, var, button, input, select, textarea, [data-arap-ui]",
          )
        ) {
          const previous = el.style.getPropertyValue("letter-spacing");
          if (!previous) {
            set(el, "letter-spacing", "normal");
          }
        }
        continue;
      }
      const scriptLimits = getScriptSpacingConstraints(el);
      if (!scriptLimits.allowLetterSpacing) {
        // Cursive / Arabic / RTL: isolate from inherited letter spacing
        const previous = el.style.getPropertyValue("letter-spacing");
        if (!previous) {
          set(el, "letter-spacing", "normal");
        }
        continue;
      }
      let targetSpacing: string;
      if (letterSpacingEmVal !== null) {
        const clampedEm =
          scriptLimits.maxLetterSpacingPx === 1
            ? Math.min(letterSpacingEmVal, 0.05)
            : letterSpacingEmVal;
        targetSpacing = `${clampedEm}em`;
      } else {
        const clampedPx = Math.min(
          letterSpacingVal,
          scriptLimits.maxLetterSpacingPx,
        );
        targetSpacing = `${clampedPx}px`;
      }
      set(el, "letter-spacing", targetSpacing);
    }
  }

  // Word spacing with element protections
  const wordSpacingVal =
    typeof values.wordSpacing === "number" && values.wordSpacing > 0
      ? values.wordSpacing
      : 0;
  const wordSpacingEmVal =
    typeof values.wordSpacingEm === "number" && values.wordSpacingEm > 0
      ? values.wordSpacingEm
      : null;

  if (wordSpacingVal > 0 || wordSpacingEmVal !== null) {
    for (const el of elements) {
      if (isProtectedFromTextSpacing(el)) {
        if (
          el.matches(
            "table, [role='table'], td, th, pre, code, kbd, samp, var, button, input, select, textarea, [data-arap-ui]",
          )
        ) {
          const previous = el.style.getPropertyValue("word-spacing");
          if (!previous) {
            set(el, "word-spacing", "normal");
          }
        }
        continue;
      }
      const targetSpacing =
        wordSpacingEmVal !== null
          ? `${wordSpacingEmVal}em`
          : `${wordSpacingVal}px`;
      set(el, "word-spacing", targetSpacing);
    }
  }

  // Paragraph spacing on p / [role="paragraph"] with element protections
  const paragraphSpacingVal =
    typeof values.paragraphSpacing === "number" && values.paragraphSpacing > 0
      ? values.paragraphSpacing
      : 0;
  const paragraphSpacingEmVal =
    typeof values.paragraphSpacingEm === "number" &&
    values.paragraphSpacingEm > 0
      ? values.paragraphSpacingEm
      : null;

  if (paragraphSpacingVal > 0 || paragraphSpacingEmVal !== null) {
    for (const el of elements) {
      if (isProtectedFromTextSpacing(el)) continue;
      if (el.matches("p, [role='paragraph']")) {
        const computed = getComputedStyle(el);
        const baseMargin = parseFloat(computed.marginBottom) || 0;
        const targetMargin =
          paragraphSpacingEmVal !== null
            ? `${paragraphSpacingEmVal}em`
            : `${baseMargin + paragraphSpacingVal}px`;
        set(el, "margin-bottom", targetMargin);
      }
    }
  }

  // Text alignment scoped strictly to logical text blocks (p, headings, lists, quotes)
  const textAlignVal = values.textAlign ? String(values.textAlign) : "default";
  if (textAlignVal !== "default" && textAlignVal !== "original") {
    for (const el of elements) {
      if (isProtectedFromTextAlign(el)) continue;
      if (el.matches(TEXT_ALIGN_BLOCK_SELECTOR)) {
        set(el, "text-align", textAlignVal);
      }
    }
  }

  // Font family with script-aware fallbacks and icon/code protection
  const fontFamilyVal = values.fontFamily
    ? String(values.fontFamily)
    : "default";
  if (fontFamilyVal !== "default" && fontFamilyVal !== "original") {
    const targetStack =
      fontFamilyVal === "dyslexia-option" || fontFamilyVal === "dyslexia"
        ? DYSLEXIA_FONT_STACK
        : LEGIBLE_FONT_STACK;

    for (const el of elements) {
      if (isProtectedFromFontFamily(el)) {
        // Monospace blocks inside styled containers must retain monospace styling
        if (el.matches("pre, code, kbd, samp, var")) {
          const previous = el.style.getPropertyValue("font-family");
          if (!previous) {
            set(
              el,
              "font-family",
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            );
          }
        }
        continue;
      }
      set(el, "font-family", targetStack);
    }
  }

  const isInvert =
    Boolean(values.invertColors) ||
    values.contrast === "invert" ||
    values.contrastMode === "invert";

  // When invert is active, protect photos, videos, canvas, and charts by countering the container inversion
  if (isInvert && !isForcedColorsActive()) {
    const mediaElements = Array.from(
      document.body.querySelectorAll<HTMLElement>(
        "img, video, canvas, picture, [role='img']",
      ),
    ).filter((el) => !el.closest("[data-arap-ui]"));

    for (const mediaEl of mediaElements) {
      set(mediaEl, "filter", "invert(1)");
    }
  }

  // Active contrast mode / palette
  const activeContrastKey =
    values.contrastMode &&
    values.contrastMode !== "off" &&
    values.contrastMode !== "original"
      ? String(values.contrastMode)
      : values.contrast !== undefined &&
          values.contrast !== 0 &&
          values.contrast !== "0" &&
          values.contrast !== "off" &&
          values.contrast !== "original"
        ? String(values.contrast)
        : null;

  const activePalette =
    activeContrastKey && !isForcedColorsActive()
      ? CONTRAST_PALETTES[activeContrastKey]
      : null;

  if (activePalette) {
    for (const el of elements) {
      if (isProtectedFromContrast(el)) continue;

      set(el, "color", activePalette.text);

      if (el.matches("a[href]") && activePalette.link) {
        set(el, "color", activePalette.link);
      }

      if (
        el.matches(
          "main, section, article, div, p, h1, h2, h3, h4, h5, h6, ul, ol, li, table, thead, tbody, tr, th, td, button, input, select, textarea, form, blockquote, header, footer, aside, nav",
        )
      ) {
        set(el, "background-color", activePalette.background);
      }

      if (
        activePalette.border &&
        el.matches(
          "button, input, select, textarea, [role='button'], fieldset, hr, table, th, td",
        )
      ) {
        set(el, "border-color", activePalette.border);
      }
    }
  }

  // Smart contrast research prototype: measured relative luminance assistance
  const smartContrastVal = values.smartContrast;
  if (
    (smartContrastVal === true ||
      smartContrastVal === "aa" ||
      smartContrastVal === "aaa") &&
    !isForcedColorsActive()
  ) {
    const targetLevel = smartContrastVal === "aaa" ? "aaa" : "aa";
    const applied = applySmartContrast({ targetLevel });
    undo.push(applied.undo);
  }

  // Enhanced focus visibility
  if (values.highlightFocus || values.focusHighlight) {
    const FOCUS_STYLE_ID = "arap-focus-highlight-style";
    let styleEl = document.getElementById(
      FOCUS_STYLE_ID,
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = FOCUS_STYLE_ID;
      styleEl.dataset.arapUi = "";
      styleEl.textContent = `
        *:not([data-arap-ui]):not([data-arap-ui] *):focus-visible {
          outline: 3px solid #2563eb !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.9) !important;
        }
        @media (forced-colors: active) {
          *:not([data-arap-ui]):not([data-arap-ui] *):focus-visible {
            outline: 3px solid Highlight !important;
            outline-offset: 3px !important;
            box-shadow: none !important;
          }
        }
        *:disabled:focus-visible,
        *[aria-disabled="true"]:focus-visible {
          outline: none !important;
          box-shadow: none !important;
        }
      `;
      document.head.appendChild(styleEl);
      undo.push(() => {
        styleEl?.remove();
      });
    }
  }

  // Reduce motion: scoped CSS, WAAPI animation pausing, explicit media pausing
  if (values.reduceMotion) {
    const MOTION_STYLE_ID = "arap-reduce-motion-style";
    let styleEl = document.getElementById(
      MOTION_STYLE_ID,
    ) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = MOTION_STYLE_ID;
      styleEl.dataset.arapUi = "";
      styleEl.textContent = `
        *:not([data-arap-ui]):not([data-arap-ui] *),
        *:not([data-arap-ui]):not([data-arap-ui] *)::before,
        *:not([data-arap-ui]):not([data-arap-ui] *)::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(styleEl);
      undo.push(() => {
        styleEl?.remove();
      });
    }

    // Pause only tracked WAAPI animations
    const trackedAnimations = new Set<Animation>();
    if (
      typeof document !== "undefined" &&
      typeof document.getAnimations === "function"
    ) {
      try {
        const animations = document.getAnimations();
        for (const anim of animations) {
          const target = (anim.effect as KeyframeEffect | null)?.target;
          if (target instanceof Element && target.closest("[data-arap-ui]")) {
            continue;
          }
          if (anim.playState === "running") {
            anim.pause();
            trackedAnimations.add(anim);
          }
        }
      } catch {
        // Environment does not support or threw during getAnimations
      }
    }

    // Explicit media autoplay pause (never autoplay on reset)
    if (typeof document !== "undefined") {
      const mediaList = Array.from(
        document.querySelectorAll<HTMLMediaElement>("video, audio"),
      ).filter((media) => !media.closest("[data-arap-ui]"));

      for (const media of mediaList) {
        if (!media.paused) {
          try {
            media.pause();
          } catch {
            // Media pause failed or was blocked
          }
        }
      }
    }

    // Teardown: resume only tracked animations that are still paused; never resume media
    undo.push(() => {
      for (const anim of trackedAnimations) {
        if (anim.playState === "paused") {
          try {
            anim.play();
          } catch {
            // Animation resume failed
          }
        }
      }
    });
  }

  const isFinePointer = hasFinePointer();
  if (values.bigCursor && isFinePointer) {
    set(document.body, "cursor", cursor);
  }

  for (const el of elements) {
    if (values.bigCursor && isFinePointer) set(el, "cursor", cursor);
    if (values.hideImages) {
      if (isEligibleDecorativeImage(el)) {
        set(el, "visibility", "hidden");
      }
      if (!isFunctionalOrMeaningfulImage(el)) {
        const inlineBg = el.style.backgroundImage;
        if (inlineBg && inlineBg !== "none") {
          set(el, "background-image", "none");
        } else {
          try {
            const computedBg = getComputedStyle(el).backgroundImage;
            if (computedBg && computedBg !== "none") {
              set(el, "background-image", "none");
            }
          } catch {
            // Ignore computed style failures in non-standard environments
          }
        }
      }
    }
    // Do not hide unrelated embeds (maps, documents or payment forms).
    if (
      values.hideVideos &&
      el.matches(
        'video, iframe[src*="youtube.com/embed/"], iframe[src*="youtube-nocookie.com/embed/"], iframe[src*="player.vimeo.com/video/"]',
      )
    )
      set(el, "visibility", "hidden");
    const colors = palette[String(values.contrast)];
    if (colors && !activePalette && !isForcedColorsActive()) {
      set(el, "color", colors[0]);
      set(el, "background-color", colors[1]);
    }
    if (
      values.linkHighlight &&
      el.matches("a[href]") &&
      !el.closest("[data-arap-ui]")
    ) {
      const isDisabled =
        el.getAttribute("aria-disabled") === "true" ||
        el.hasAttribute("disabled") ||
        el.classList.contains("disabled");
      if (!isDisabled) {
        if (isForcedColorsActive()) {
          set(el, "color", "LinkText");
          set(el, "text-decoration", "underline");
          set(el, "text-decoration-thickness", "2px");
          set(el, "text-underline-offset", "3px");
        } else {
          const colors = palette[String(values.linkHighlight)] ?? [
            "#111827",
            "#fef08a",
          ];
          set(el, "color", colors[0]);
          set(el, "background-color", colors[1]);
          set(el, "text-decoration", "underline");
          set(el, "text-decoration-thickness", "2px");
          set(el, "text-underline-offset", "3px");
        }
      }
    }
  }
  return () => {
    for (const restore of undo.reverse()) restore();
  };
}

export function nudgeReadingAid(
  feature: "readingGuide" | "readingMask",
  delta: number,
) {
  if (typeof document !== "undefined") {
    try {
      document.dispatchEvent(
        new CustomEvent("arap:nudge-reading-aid", {
          detail: { feature, delta },
        }),
      );
    } catch {
      // CustomEvent dispatch failed in unsupported environment
    }
  }
}

function readingAid(
  mask: boolean,
  height: number = 100,
  onDisable?: (key: string) => void,
) {
  const featureKey = mask ? "readingMask" : "readingGuide";

  // Ensure any existing reading aid element of this type is cleaned up first
  const existing = document.body.querySelectorAll(
    mask ? ".arap-reading-mask" : ".arap-reading-guide",
  );
  existing.forEach((node) => node.remove());

  const el = document.createElement("div");
  el.dataset.arapUi = "";
  el.className = mask ? "arap-reading-mask" : "arap-reading-guide";
  el.setAttribute("aria-hidden", "true");

  const aidHeight = mask ? Math.max(40, Math.min(400, height)) : 4;
  const halfHeight = mask ? aidHeight / 2 : 0;

  el.style.cssText = `position:fixed;left:0;right:0;top:50%;height:${aidHeight}px;pointer-events:none;z-index:2147482999;${
    mask
      ? "background:transparent;box-shadow:0 0 0 200vmax rgba(0,0,0,.65)"
      : "background:#2563eb;border:1px solid white"
  }`;
  el.style.setProperty("pointer-events", "none", "important");
  el.style.setProperty("user-select", "none", "important");
  el.style.setProperty("-webkit-user-select", "none", "important");
  el.style.setProperty("touch-action", "none", "important");

  document.body.appendChild(el);

  let currentY =
    typeof window !== "undefined" && window.innerHeight
      ? window.innerHeight / 2
      : 300;
  let trackedFocusEl: HTMLElement | null = null;

  const clampY = (y: number) => {
    const vh =
      typeof window !== "undefined" && window.innerHeight
        ? window.innerHeight
        : 600;
    return Math.max(halfHeight, Math.min(vh - halfHeight, y));
  };

  const move = (y: number) => {
    currentY = clampY(y);
    el.style.top = `${Math.max(0, currentY - halfHeight)}px`;
  };

  // Center immediately
  move(currentY);

  const pointer = (event: MouseEvent | PointerEvent) => {
    if (typeof event.clientY === "number" && !isNaN(event.clientY)) {
      trackedFocusEl = null;
      move(event.clientY);
    }
  };

  const touch = (event: TouchEvent) => {
    if (event.touches && event.touches.length > 0) {
      trackedFocusEl = null;
      move(event.touches[0].clientY);
    }
  };

  const focus = (event: FocusEvent) => {
    if (
      event.target instanceof HTMLElement &&
      !event.target.closest("[data-arap-ui]")
    ) {
      trackedFocusEl = event.target;
      const rect = event.target.getBoundingClientRect();
      move(rect.top + rect.height / 2);
    }
  };

  const scroll = () => {
    if (trackedFocusEl && document.contains(trackedFocusEl)) {
      const rect = trackedFocusEl.getBoundingClientRect();
      move(rect.top + rect.height / 2);
    }
  };

  const keydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      if (
        document.activeElement &&
        document.activeElement.closest("[data-arap-ui]")
      ) {
        return;
      }
      event.preventDefault();
      try {
        document.dispatchEvent(
          new CustomEvent("arap:disable-feature", { detail: featureKey }),
        );
      } catch {
        // Event dispatch failed
      }
      onDisable?.(featureKey);
      el.remove();
      return;
    }

    if (
      event.altKey &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      event.preventDefault();
      const delta = event.key === "ArrowUp" ? -30 : 30;
      move(currentY + delta);
    }
  };

  const nudge = (event: Event) => {
    const custom = event as CustomEvent<{ feature: string; delta: number }>;
    if (custom.detail && custom.detail.feature === featureKey) {
      move(currentY + (custom.detail.delta || 0));
    }
  };

  const viewport = () => {
    move(currentY);
  };

  document.addEventListener("pointermove", pointer, { passive: true });
  document.addEventListener("mousemove", pointer, { passive: true });
  document.addEventListener("touchmove", touch, { passive: true });
  document.addEventListener("touchstart", touch, { passive: true });
  document.addEventListener("focusin", focus);
  document.addEventListener("arap:nudge-reading-aid", nudge);
  document.addEventListener("keydown", keydown);
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("resize", viewport, { passive: true });
  window.addEventListener("keydown", keydown);

  if (typeof window !== "undefined" && window.visualViewport) {
    window.visualViewport.addEventListener("resize", viewport);
    window.visualViewport.addEventListener("scroll", viewport);
  }

  return () => {
    document.removeEventListener("pointermove", pointer);
    document.removeEventListener("mousemove", pointer);
    document.removeEventListener("touchmove", touch);
    document.removeEventListener("touchstart", touch);
    document.removeEventListener("focusin", focus);
    document.removeEventListener("arap:nudge-reading-aid", nudge);
    document.removeEventListener("keydown", keydown);
    window.removeEventListener("scroll", scroll);
    window.removeEventListener("resize", viewport);
    window.removeEventListener("keydown", keydown);

    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.removeEventListener("resize", viewport);
      window.visualViewport.removeEventListener("scroll", viewport);
    }

    el.remove();
  };
}

export function useBuiltinEffects(
  values: Record<string, unknown>,
  onDisable?: (featureKey: string) => void,
) {
  useEffect(() => {
    if (
      !Object.entries(values).some(
        ([key, value]) =>
          key in builtins && value !== builtins[key].defaultValue,
      )
    )
      return;
    let undo = applyPage(values);
    let mutationTimer: ReturnType<typeof setTimeout> | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new MutationObserver((records) => {
      if (
        !records.some(
          (record) =>
            record.target instanceof Element &&
            !record.target.closest("[data-arap-ui]") &&
            [...record.addedNodes, ...record.removedNodes].some(
              (node) =>
                node instanceof Element && !node.matches("[data-arap-ui]"),
            ),
        )
      )
        return;
      if (mutationTimer) clearTimeout(mutationTimer);
      mutationTimer = setTimeout(() => {
        undo();
        undo = applyPage(values);
      }, 16);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const resize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        undo();
        undo = applyPage(values);
      }, 50);
    };
    window.addEventListener("resize", resize);
    return () => {
      if (mutationTimer) clearTimeout(mutationTimer);
      if (resizeTimer) clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      undo();
    };
  }, [values]);

  useEffect(() => {
    if (!values.readingMask) return;
    const height =
      typeof values.readingMaskHeight === "number"
        ? values.readingMaskHeight
        : typeof values.readingMask === "number"
          ? values.readingMask
          : 100;
    return readingAid(true, height, onDisable);
  }, [values.readingMask, values.readingMaskHeight, onDisable]);

  useEffect(() => {
    if (!values.readingGuide) return;
    return readingAid(false, 4, onDisable);
  }, [values.readingGuide, onDisable]);

  useEffect(() => {
    if (!values.tooltips && !values.accessibleTooltips) return;
    return enableAccessibleTooltips();
  }, [values.tooltips, values.accessibleTooltips]);
}

/**
 * Sensitive field patterns that must NEVER disclose descriptions or values.
 */
const SENSITIVE_AUTOCOMPLETE_PATTERN =
  /password|credit-card|cc-|card-|security-code|cvc|cvv|one-time-code/i;

/**
 * Extracts authored accessible description from an element.
 * Respects author intent, protects private/sensitive fields, and avoids redundant tooltips.
 */
export function getAuthoredDescription(element: Element): string | null {
  if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
    return null;
  }

  // Never inspect internal accessibility plugin UI
  if (element.closest("[data-arap-ui]")) {
    return null;
  }

  // Skip non-rendered metadata tags
  if (element.matches("script, style, link, meta, noscript, template")) {
    return null;
  }

  // Privacy Protection: Never disclose sensitive fields
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    if (element instanceof HTMLInputElement && element.type === "password") {
      return null;
    }
    const ac = element.getAttribute("autocomplete");
    if (ac && SENSITIVE_AUTOCOMPLETE_PATTERN.test(ac)) {
      return null;
    }
  }
  if (element.getAttribute("data-sensitive") === "true") {
    return null;
  }

  // Hidden elements (aria-hidden or presentation role)
  if (
    element.getAttribute("aria-hidden") === "true" ||
    element.getAttribute("role") === "presentation" ||
    element.getAttribute("role") === "none"
  ) {
    return null;
  }

  // 1. Check aria-description (W3C ARIA 1.3)
  const ariaDesc = element.getAttribute("aria-description")?.trim();

  // 2. Check aria-describedby
  let describedByText = "";
  const describedBy = element.getAttribute("aria-describedby");
  if (describedBy) {
    const ids = describedBy.trim().split(/\s+/);
    const parts: string[] = [];
    for (const id of ids) {
      const target = document.getElementById(id);
      if (target) {
        const text = target.textContent?.trim();
        if (text) parts.push(text);
      }
    }
    if (parts.length > 0) {
      describedByText = parts.join(" ");
    }
  }

  const explicitDesc = ariaDesc || describedByText || null;

  // 3. Check aria-label
  const ariaLabel = element.getAttribute("aria-label")?.trim() || null;

  // Compute visible inner text of element (without child tooltips)
  const visibleText = (element.textContent || "").trim();

  // 4. Check alt attribute on img, area, input[type=image], svg
  const alt =
    element instanceof HTMLImageElement ||
    element instanceof HTMLAreaElement ||
    (element instanceof HTMLInputElement && element.type === "image")
      ? element.getAttribute("alt")?.trim() || null
      : null;

  // 5. Check title attribute
  const title = element.getAttribute("title")?.trim() || null;

  // Composition logic:
  // If explicit description exists:
  if (explicitDesc) {
    if (
      ariaLabel &&
      ariaLabel.toLowerCase() !== visibleText.toLowerCase() &&
      ariaLabel.toLowerCase() !== explicitDesc.toLowerCase()
    ) {
      return `${ariaLabel} — ${explicitDesc}`;
    }
    if (explicitDesc.toLowerCase() !== visibleText.toLowerCase()) {
      return explicitDesc;
    }
  }

  // If aria-label exists and provides information not already visible in text:
  if (ariaLabel && ariaLabel.toLowerCase() !== visibleText.toLowerCase()) {
    return ariaLabel;
  }

  // If alt attribute exists and is non-empty (empty alt="" means decorative):
  if (alt && alt !== "") {
    return alt;
  }

  // If title attribute exists and differs from visible text:
  if (title && title.toLowerCase() !== visibleText.toLowerCase()) {
    return title;
  }

  return null;
}

export function positionTooltip(tooltip: HTMLElement, target: Element) {
  const rect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const tooltipWidth = tooltipRect.width || tooltip.offsetWidth || 180;
  const tooltipHeight = tooltipRect.height || tooltip.offsetHeight || 32;
  const gap = 8;
  const vw =
    (typeof window !== "undefined" && window.innerWidth) ||
    document.documentElement.clientWidth ||
    800;
  const vh =
    (typeof window !== "undefined" && window.innerHeight) ||
    document.documentElement.clientHeight ||
    600;

  let placement: "top" | "bottom" = "top";
  let top = rect.top - tooltipHeight - gap;

  if (top < gap) {
    top = rect.bottom + gap;
    placement = "bottom";
  }

  if (top + tooltipHeight > vh - gap) {
    top = Math.max(gap, vh - tooltipHeight - gap);
  }

  let left = rect.left + (rect.width - tooltipWidth) / 2;
  left = Math.max(gap, Math.min(vw - tooltipWidth - gap, left));

  tooltip.style.top = `${Math.round(top)}px`;
  tooltip.style.left = `${Math.round(left)}px`;
  tooltip.setAttribute("data-placement", placement);
}

export function enableAccessibleTooltips(): () => void {
  if (typeof document === "undefined") return () => {};

  let tooltipEl: HTMLDivElement | null = document.createElement("div");
  tooltipEl.className = "arap-accessible-tooltip";
  tooltipEl.setAttribute("role", "presentation");
  tooltipEl.setAttribute("aria-hidden", "true");
  tooltipEl.setAttribute("data-arap-ui", "true");
  document.body.appendChild(tooltipEl);

  let activeTarget: Element | null = null;
  let dismissedTarget: Element | null = null;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  let isPointerOverTooltip = false;

  function show(target: Element, text: string) {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    activeTarget = target;
    if (!tooltipEl || !document.body.contains(tooltipEl)) {
      tooltipEl = document.createElement("div");
      tooltipEl.className = "arap-accessible-tooltip";
      tooltipEl.setAttribute("role", "presentation");
      tooltipEl.setAttribute("aria-hidden", "true");
      tooltipEl.setAttribute("data-arap-ui", "true");
      document.body.appendChild(tooltipEl);
    }
    tooltipEl.textContent = text;
    tooltipEl.setAttribute("data-visible", "true");
    positionTooltip(tooltipEl, target);
  }

  function hide(immediate = false) {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    const doHide = () => {
      if (isPointerOverTooltip) return;
      if (tooltipEl) {
        tooltipEl.removeAttribute("data-visible");
        tooltipEl.style.top = "-9999px";
        tooltipEl.style.left = "-9999px";
      }
      activeTarget = null;
    };
    if (immediate) {
      doHide();
    } else {
      hideTimeout = setTimeout(doHide, 100);
    }
  }

  function findTargetWithDescription(
    node: EventTarget | null,
  ): { element: Element; text: string } | null {
    if (!(node instanceof Element)) return null;
    if (node.closest("[data-arap-ui]")) return null;
    let curr: Element | null = node;
    while (
      curr &&
      curr !== document.body &&
      curr !== document.documentElement
    ) {
      const desc = getAuthoredDescription(curr);
      if (desc) return { element: curr, text: desc };
      curr = curr.parentElement;
    }
    return null;
  }

  const handlePointerOver = (event: MouseEvent | PointerEvent) => {
    if (
      tooltipEl &&
      (event.target === tooltipEl || tooltipEl.contains(event.target as Node))
    ) {
      isPointerOverTooltip = true;
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      return;
    }

    const match = findTargetWithDescription(event.target);
    if (!match) {
      if (activeTarget && !isPointerOverTooltip) {
        hide();
      }
      return;
    }

    if (match.element === dismissedTarget) {
      return;
    }

    if (match.element === activeTarget) {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      return;
    }

    show(match.element, match.text);
  };

  const handlePointerOut = (event: MouseEvent | PointerEvent) => {
    if (dismissedTarget === event.target) {
      dismissedTarget = null;
    }

    if (
      tooltipEl &&
      (event.target === tooltipEl || tooltipEl.contains(event.target as Node))
    ) {
      isPointerOverTooltip = false;
      const related = event.relatedTarget as Node | null;
      if (
        activeTarget &&
        (activeTarget === related || activeTarget.contains(related))
      ) {
        return;
      }
      hide();
      return;
    }

    const match = findTargetWithDescription(event.target);
    if (match && match.element === activeTarget) {
      const related = event.relatedTarget as Node | null;
      if (tooltipEl && (related === tooltipEl || tooltipEl.contains(related))) {
        return;
      }
      hide();
    }
  };

  const handleFocusIn = (event: FocusEvent) => {
    const match = findTargetWithDescription(event.target);
    if (!match) {
      hide(true);
      return;
    }
    if (match.element === dismissedTarget) {
      return;
    }
    show(match.element, match.text);
  };

  const handleFocusOut = (event: FocusEvent) => {
    if (dismissedTarget === event.target) {
      dismissedTarget = null;
    }
    if (activeTarget && activeTarget === event.target) {
      hide(true);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && activeTarget) {
      dismissedTarget = activeTarget;
      hide(true);
    }
  };

  const handleReposition = () => {
    if (
      activeTarget &&
      tooltipEl &&
      tooltipEl.getAttribute("data-visible") === "true"
    ) {
      if (!document.contains(activeTarget)) {
        hide(true);
        return;
      }
      positionTooltip(tooltipEl, activeTarget);
    }
  };

  document.addEventListener("pointerover", handlePointerOver, {
    passive: true,
  });
  document.addEventListener("mouseover", handlePointerOver, { passive: true });
  document.addEventListener("pointerout", handlePointerOut, { passive: true });
  document.addEventListener("mouseout", handlePointerOut, { passive: true });
  document.addEventListener("focusin", handleFocusIn);
  document.addEventListener("focusout", handleFocusOut);
  document.addEventListener("keydown", handleKeyDown);
  window.addEventListener("scroll", handleReposition, { passive: true });
  window.addEventListener("resize", handleReposition, { passive: true });

  return () => {
    if (hideTimeout) clearTimeout(hideTimeout);
    document.removeEventListener("pointerover", handlePointerOver);
    document.removeEventListener("mouseover", handlePointerOver);
    document.removeEventListener("pointerout", handlePointerOut);
    document.removeEventListener("mouseout", handlePointerOut);
    document.removeEventListener("focusin", handleFocusIn);
    document.removeEventListener("focusout", handleFocusOut);
    document.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("scroll", handleReposition);
    window.removeEventListener("resize", handleReposition);
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
  };
}

export function CustomEffect({
  definition,
  value,
}: {
  definition: FeatureRegistration;
  value: unknown;
}) {
  useEffect(() => {
    const cleanup = definition.apply?.(value);
    return typeof cleanup === "function" ? cleanup : undefined;
  }, [definition, value]);
  return null;
}
