import { useEffect } from "react";
import { builtins } from "./featureSchema";
import type { FeatureRegistration } from "./types";

const EXCLUDED = "[data-arap-ui], [data-arap-ui] *, script, style, link, meta";
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
  const elements = Array.from(
    document.body.querySelectorAll<HTMLElement>("*"),
  ).filter((el) => el instanceof HTMLElement && !el.matches(EXCLUDED));
  const font = Number(values.fontSize ?? 100) / 100;
  const line = Number(values.lineHeight ?? 100) / 100;
  // Measure all baselines before writing, so nested elements never compound scaling.
  const measurements =
    font !== 1 || line !== 1
      ? elements.map((el) => {
          const computed = getComputedStyle(el);
          return {
            el,
            font: parseFloat(computed.fontSize) || 16,
            line:
              parseFloat(computed.lineHeight) ||
              (parseFloat(computed.fontSize) || 16) * 1.2,
          };
        })
      : [];
  for (const measured of measurements) {
    if (font !== 1) set(measured.el, "font-size", `${measured.font * font}px`);
    if (line !== 1)
      set(measured.el, "line-height", `${measured.line * line * font}px`);
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
  for (const el of elements) {
    if (Number(values.letterSpacing) > 0)
      set(el, "letter-spacing", `${values.letterSpacing}px`);
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
      undo();
      undo = applyPage(values);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const resize = () => {
      undo();
      undo = applyPage(values);
    };
    window.addEventListener("resize", resize);
    return () => {
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
  useEffect(() => definition.apply?.(value), [definition, value]);
  return null;
}
