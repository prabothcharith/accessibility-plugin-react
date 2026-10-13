import { useCallback, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import type { PluginPosition, WidgetPlacement } from "./types";

export const PLACEMENT_KEY = "__arap_widget_placement";
export const corners = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
] as const;
export function validPlacement(value: unknown): value is WidgetPlacement {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return p.kind === "corner"
    ? corners.some((corner) => corner === p.corner)
    : p.kind === "point" &&
        typeof p.x === "number" &&
        typeof p.y === "number" &&
        Number.isFinite(p.x) &&
        Number.isFinite(p.y) &&
        p.x >= 0 &&
        p.x <= 1 &&
        p.y >= 0 &&
        p.y <= 1;
}
export function defaultCorner(position: PluginPosition) {
  return position === "left"
    ? "bottom-left"
    : position === "top"
      ? "top-right"
      : "bottom-right";
}
const subscribe = (listener: () => void) => {
  window.addEventListener("resize", listener);
  return () => window.removeEventListener("resize", listener);
};
const snapshot = () => `${window.innerWidth},${window.innerHeight}`;
export function useViewport() {
  return useSyncExternalStore(subscribe, snapshot, () => "0,0")
    .split(",")
    .map(Number);
}
export function pointFromPixels(
  left: number,
  top: number,
  width = 56,
  height = 56,
): WidgetPlacement {
  return {
    kind: "point",
    x: Math.max(0, Math.min(1, left / Math.max(1, window.innerWidth - width))),
    y: Math.max(0, Math.min(1, top / Math.max(1, window.innerHeight - height))),
  };
}

/** Observe actual trigger dimensions so consumer sizing overrides still clamp correctly. */
export function useTriggerSize(id: string) {
  const subscribeSize = useCallback(
    (listener: () => void) => {
      const element = document.getElementById(id);
      if (typeof ResizeObserver === "undefined" || !element)
        return subscribe(listener);
      const observer = new ResizeObserver(listener);
      observer.observe(element);
      return () => observer.disconnect();
    },
    [id],
  );
  const getSize = useCallback(() => {
    const rect = document.getElementById(id)?.getBoundingClientRect();
    return `${rect?.width || 56},${rect?.height || 56}`;
  }, [id]);
  return useSyncExternalStore(subscribeSize, getSize, () => "56,56")
    .split(",")
    .map(Number);
}
function pointCoordinates(
  p: Extract<WidgetPlacement, { kind: "point" }>,
  viewport: number[],
  size: number[],
) {
  return [
    Math.max(
      16,
      Math.min(viewport[0] - size[0] - 16, p.x * (viewport[0] - size[0])),
    ),
    Math.max(
      16,
      Math.min(viewport[1] - size[1] - 16, p.y * (viewport[1] - size[1])),
    ),
  ];
}
export function pointStyle(
  p: WidgetPlacement | null,
  viewport: number[],
  size = [56, 56],
): CSSProperties | undefined {
  if (p?.kind !== "point") return undefined;
  const [left, top] = pointCoordinates(p, viewport, size);
  return {
    left: `clamp(max(16px, env(safe-area-inset-left)), ${left}px, max(16px, calc(100vw - ${size[0]}px - max(16px, env(safe-area-inset-right)))))`,
    top: `clamp(max(16px, env(safe-area-inset-top)), ${top}px, max(16px, calc(100dvh - ${size[1]}px - max(16px, env(safe-area-inset-bottom)))))`,
    right: "auto",
    bottom: "auto",
  };
}
export function panelStyle(
  p: WidgetPlacement | null,
  viewport: number[],
  size = [56, 56],
): CSSProperties | undefined {
  if (p?.kind !== "point") return undefined;
  const [width, height] = viewport;
  const [left, top] = pointCoordinates(p, viewport, size);
  const below = top < (height - size[1]) / 2;
  const offset = below ? top + size[1] + 12 : height - top + 12;
  const side = below ? "top" : "bottom",
    opposite = below ? "bottom" : "top";
  const offsetCss = `max(${offset}px, calc(max(16px, env(safe-area-inset-${side})) + ${size[1] + 12}px))`;
  return {
    left: `clamp(max(16px, env(safe-area-inset-left)), ${left}px, max(16px, calc(100vw - ${Math.min(400, width - 32)}px - max(16px, env(safe-area-inset-right)))))`,
    right: "auto",
    top: below ? offsetCss : "auto",
    bottom: below ? "auto" : offsetCss,
    maxHeight: `max(0px, calc(100dvh - ${offsetCss} - max(16px, env(safe-area-inset-${opposite}))))`,
  };
}
