import { useEffect } from "react";
import { builtins } from "./featureSchema";
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

  return [
    contrast !== 1 && `contrast(${contrast})`,
    values.saturation === 1 && "saturate(0.2)",
    values.saturation === 2 && "saturate(2)",
    isInvert && "invert(1)",
    values.grayscale && "grayscale(1)",
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

  for (const el of elements) {
    if (values.bigCursor) set(el, "cursor", cursor);
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

function readingAid(mask: boolean) {
  // Ensure any existing reading aid element of this type is cleaned up first
  const existing = document.body.querySelectorAll(
    mask ? ".arap-reading-mask" : ".arap-reading-guide",
  );
  existing.forEach((node) => node.remove());

  const el = document.createElement("div");
  el.dataset.arapUi = "";
  el.className = mask ? "arap-reading-mask" : "arap-reading-guide";
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = `position:fixed;left:0;right:0;top:50%;height:${mask ? "100px" : "4px"};pointer-events:none;z-index:2147482999;${mask ? "background:transparent;box-shadow:0 0 0 200vmax rgba(0,0,0,.65)" : "background:#2563eb;border:1px solid white"}`;
  document.body.appendChild(el);
  const move = (y: number) => {
    el.style.top = `${Math.max(0, y - (mask ? 50 : 0))}px`;
  };
  const pointer = (event: PointerEvent) => move(event.clientY);
  const focus = (event: FocusEvent) => {
    if (
      event.target instanceof HTMLElement &&
      !event.target.closest("[data-arap-ui]")
    ) {
      const rect = event.target.getBoundingClientRect();
      move(rect.top + rect.height / 2);
    }
  };
  document.addEventListener("pointermove", pointer, { passive: true });
  document.addEventListener("focusin", focus);
  return () => {
    document.removeEventListener("pointermove", pointer);
    document.removeEventListener("focusin", focus);
    el.remove();
  };
}

export function useBuiltinEffects(values: Record<string, unknown>) {
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
  useEffect(
    () => (values.readingMask ? readingAid(true) : undefined),
    [values.readingMask],
  );
  useEffect(
    () => (values.readingGuide ? readingAid(false) : undefined),
    [values.readingGuide],
  );
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
