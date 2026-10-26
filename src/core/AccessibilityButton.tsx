"use client";
import { useContext, useRef, useState } from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import {
  defaultCorner,
  pointFromPixels,
  pointStyle,
  useViewport,
  useTriggerSize,
} from "./widgetPlacement";
import type { WidgetPlacement } from "./types";
import { WidgetPortal } from "./WidgetPortal";
import { SkipToMainLink } from "./SkipToMainLink";
import { resolveLocaleStrings } from "./i18n";
import type { AccessibilityButtonProps } from "./types";
export function AccessibilityButton({
  icon,
  draggable = true,
  title,
  description,
  className = "",
  style,
  largeControls,
}: AccessibilityButtonProps) {
  const ctx = useContext(AccessibilityContext);
  if (!ctx)
    throw new Error(
      "AccessibilityButton must be used within an <AccessibilityPlugin> provider.",
    );
  const strings = resolveLocaleStrings(ctx.locale);
  const buttonTitle = title ?? strings.buttonTitle;
  const isLarge = largeControls ?? ctx.largeControls ?? false;
  const viewport = useViewport();
  const triggerSize = useTriggerSize(`${ctx.panelId}-trigger`);
  const [preview, setPreview] = useState<WidgetPlacement | null>(null);
  const drag = useRef<{
    id: number;
    startX: number;
    startY: number;
    left: number;
    top: number;
    width: number;
    height: number;
    moved: boolean;
    next: WidgetPlacement | null;
  } | null>(null);
  const suppressClick = useRef(false);
  const placement = preview ?? ctx.widgetPlacement;
  const corner =
    placement?.kind === "corner"
      ? placement.corner
      : defaultCorner(ctx.position);
  return (
    <WidgetPortal>
      <SkipToMainLink />
      <button
        type="button"
        className={`arap-btn ${className}`}
        id={`${ctx.panelId}-trigger`}
        style={{ ...pointStyle(placement, viewport, triggerSize), ...style }}
        data-corner={corner}
        data-draggable={draggable}
        data-dragging={!!preview}
        data-open={ctx.isOpen}
        data-position={ctx.position}
        data-large-controls={isLarge}
        onPointerDown={(event) => {
          suppressClick.current = false;
          if (!draggable || !event.isPrimary || event.button !== 0) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          drag.current = {
            id: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
            height: bounds.height,
            moved: false,
            next: null,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const current = drag.current;
          if (!current || current.id !== event.pointerId) return;
          const dx = event.clientX - current.startX,
            dy = event.clientY - current.startY;
          if (!current.moved && Math.hypot(dx, dy) < 8) return;
          current.moved = true;
          current.next = pointFromPixels(
            current.left + dx,
            current.top + dy,
            current.width,
            current.height,
          );
          setPreview(current.next);
        }}
        onPointerUp={(event) => {
          const current = drag.current;
          if (!current || current.id !== event.pointerId) return;
          drag.current = null;
          suppressClick.current = current.moved;
          if (current.next) ctx.setWidgetPlacement(current.next);
          setPreview(null);
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={() => {
          suppressClick.current = !!drag.current?.moved;
          drag.current = null;
          setPreview(null);
        }}
        onLostPointerCapture={() => {
          if (drag.current) {
            suppressClick.current = drag.current.moved;
            drag.current = null;
            setPreview(null);
          }
        }}
        onClick={(event) => {
          if (suppressClick.current && event.detail !== 0) {
            suppressClick.current = false;
            event.preventDefault();
            return;
          }
          // Safari pointer activation does not reliably focus native buttons.
          event.currentTarget.focus();
          ctx.toggleOpen();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") ctx.closeMenu();
          if (
            draggable &&
            event.altKey &&
            ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
              event.key,
            )
          ) {
            event.preventDefault();
            const bounds = event.currentTarget.getBoundingClientRect();
            ctx.setWidgetPlacement(
              pointFromPixels(
                bounds.left +
                  (event.key === "ArrowLeft"
                    ? -20
                    : event.key === "ArrowRight"
                      ? 20
                      : 0),
                bounds.top +
                  (event.key === "ArrowUp"
                    ? -20
                    : event.key === "ArrowDown"
                      ? 20
                      : 0),
                bounds.width,
                bounds.height,
              ),
            );
          }
        }}
        aria-label={buttonTitle}
        aria-keyshortcuts={
          draggable
            ? "Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
            : undefined
        }
        aria-describedby={
          description || draggable
            ? `${ctx.panelId}-trigger-description`
            : undefined
        }
        aria-expanded={ctx.isOpen}
        aria-controls={ctx.panelId}
      >
        <span aria-hidden="true">
          {icon ?? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="4" r="2" />
              <path d="M4 9l8 2 8-2M12 11v5m0 0-5 6m5-6 5 6" />
            </svg>
          )}
        </span>
        {(description || draggable) && (
          <span id={`${ctx.panelId}-trigger-description`} hidden>
            {description ? `${description} ` : ""}
            {draggable && strings.dragHelp}
          </span>
        )}
      </button>
      <span className="arap-sr-only" role="status">
        {ctx.widgetPlacement?.kind === "point"
          ? strings.formatPointPosition
            ? strings.formatPointPosition(
                ctx.widgetPlacement.x,
                ctx.widgetPlacement.y,
              )
            : `Button position: ${Math.round(ctx.widgetPlacement.x * 100)}% horizontally, ${Math.round(ctx.widgetPlacement.y * 100)}% vertically.`
          : strings.formatCornerPosition
            ? strings.formatCornerPosition(corner)
            : `Button position: ${corner.split("-").join(" ")}.`}
      </span>
    </WidgetPortal>
  );
}
export default AccessibilityButton;
