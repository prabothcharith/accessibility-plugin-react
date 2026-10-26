import { useEffect } from "react";
import { builtins } from "./featureSchema";
import type { FeatureRegistration } from "./types";

const EXCLUDED =
  "[data-arap-ui], [data-arap-ui] *, script, style, link, meta, noscript, template";
const MAX_HOST_ELEMENTS = 4000;
const cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M4 2v32l9-9 7 13 6-3-7-12h14z' fill='black' stroke='white' stroke-width='2'/%3E%3C/svg%3E") 4 2, auto`;
const palette: Record<string, [string, string]> = {
  "yellow-on-black": ["#ffff00", "#000000"],
  "white-on-black": ["#ffffff", "#000000"],
  "blue-on-yellow": ["#005a9c", "#ffd740"],
  "black-on-white": ["#000000", "#ffffff"],
};

/** One deterministic composition, independent of controller render order. */
export function composeFilter(values: Record<string, unknown>): string {
  const contrast =
    values.contrast === "reduced"
      ? 0.5
      : ([1, 1.25, 1.5, 2][Number(values.contrast)] ?? 1);
  return [
    contrast !== 1 && `contrast(${contrast})`,
    values.saturation === 1 && "saturate(0.2)",
    values.saturation === 2 && "saturate(2)",
    values.invertColors && "invert(1)",
    values.grayscale && "grayscale(1)",
  ]
    .filter(Boolean)
    .join(" ");
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

  for (const el of elements) {
    if (values.textAlign && values.textAlign !== "default")
      set(el, "text-align", String(values.textAlign));
    if (values.bigCursor) set(el, "cursor", cursor);
    if (values.hideImages) {
      if (el.matches("img, picture")) set(el, "visibility", "hidden");
      set(el, "background-image", "none");
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
    if (colors) {
      set(el, "color", colors[0]);
      set(el, "background-color", colors[1]);
    }
    if (values.linkHighlight && el.matches("a[href]")) {
      const colors = palette[String(values.linkHighlight)] ?? [
        "#111827",
        "#fef08a",
      ];
      set(el, "color", colors[0]);
      set(el, "background-color", colors[1]);
      set(el, "text-decoration", "underline");
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
