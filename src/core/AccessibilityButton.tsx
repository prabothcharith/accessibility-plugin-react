"use client";
import { useContext } from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import { WidgetPortal } from "./WidgetPortal";
import type { AccessibilityButtonProps } from "./types";
export function AccessibilityButton({
  icon,
  title = "Accessibility",
  description,
  className = "",
  style,
}: AccessibilityButtonProps) {
  const ctx = useContext(AccessibilityContext);
  if (!ctx)
    throw new Error(
      "AccessibilityButton must be used within an <AccessibilityPlugin> provider.",
    );
  return (
    <WidgetPortal>
      <button
        type="button"
        className={`arap-btn ${className}`}
        style={style}
        data-position={ctx.position}
        onClick={(event) => {
          // Safari pointer activation does not reliably focus native buttons.
          event.currentTarget.focus();
          ctx.toggleOpen();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") ctx.closeMenu();
        }}
        aria-label={title}
        aria-describedby={
          description ? `${ctx.panelId}-description` : undefined
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
        {description && (
          <span id={`${ctx.panelId}-description`} hidden>
            {description}
          </span>
        )}
      </button>
    </WidgetPortal>
  );
}
export default AccessibilityButton;
