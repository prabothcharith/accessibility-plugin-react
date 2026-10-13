"use client";
import { useContext, useEffect, useRef } from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import { WidgetPortal } from "./WidgetPortal";
import type { AccessibilityListProps } from "./types";
function Panel({
  children,
  className = "",
  style,
  title = "Accessibility settings",
  closeLabel = "Close accessibility settings",
}: AccessibilityListProps) {
  const ctx = useContext(AccessibilityContext)!;
  const panel = useRef<HTMLDivElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (ctx.isOpen) {
      previous.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      panel.current?.focus();
    } else if (previous.current) {
      previous.current.focus();
      previous.current = null;
    }
  }, [ctx.isOpen]);
  useEffect(
    () => () => {
      if (previous.current?.isConnected) previous.current.focus();
    },
    [],
  );
  return (
    <div
      ref={panel}
      id={ctx.panelId}
      className={`arap-panel ${className}`}
      style={style}
      data-position={ctx.position}
      hidden={!ctx.isOpen}
      role="region"
      aria-label={title}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.stopPropagation();
          ctx.closeMenu();
        }
      }}
    >
      <div className="arap-heading">
        <h2>{title}</h2>
        <button type="button" aria-label={closeLabel} onClick={ctx.closeMenu}>
          ×
        </button>
      </div>
      {children}
    </div>
  );
}
export function AccessibilityList(props: AccessibilityListProps) {
  const ctx = useContext(AccessibilityContext);
  if (!ctx)
    throw new Error(
      "AccessibilityList must be used within an <AccessibilityPlugin> provider.",
    );
  return (
    <WidgetPortal>
      <Panel {...props} />
    </WidgetPortal>
  );
}
export default AccessibilityList;
