"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import { PanelActionsContext } from "./PanelActionsContext";
import { PositionControls } from "./PositionControls";
import {
  defaultCorner,
  panelStyle,
  useViewport,
  useTriggerSize,
} from "./widgetPlacement";
import { WidgetPortal } from "./WidgetPortal";
import type { AccessibilityListProps } from "./types";
function Panel({
  children,
  footer,
  className = "",
  style,
  title = "Accessibility settings",
  description = "Adjust your reading experience",
  closeLabel = "Close accessibility settings",
}: AccessibilityListProps) {
  const ctx = useContext(AccessibilityContext)!;
  const panel = useRef<HTMLDivElement>(null);
  const [actions, setActions] = useState<HTMLDivElement | null>(null);
  const viewport = useViewport();
  const triggerSize = useTriggerSize(`${ctx.panelId}-trigger`);
  const corner =
    ctx.widgetPlacement?.kind === "corner"
      ? ctx.widgetPlacement.corner
      : defaultCorner(ctx.position);
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
      style={{
        ...panelStyle(ctx.widgetPlacement, viewport, triggerSize),
        ...style,
      }}
      data-corner={corner}
      data-position={ctx.position}
      hidden={!ctx.isOpen}
      role="region"
      aria-label={title}
      aria-describedby={description ? `${ctx.panelId}-description` : undefined}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.stopPropagation();
          ctx.closeMenu();
        }
      }}
    >
      <div className="arap-heading">
        <div className="arap-heading-copy">
          <h2>{title}</h2>
          {description && (
            <p id={`${ctx.panelId}-description`} className="arap-description">
              {description}
            </p>
          )}
        </div>
        <button type="button" aria-label={closeLabel} onClick={ctx.closeMenu}>
          ×
        </button>
      </div>
      <button
        type="button"
        className="arap-skip-actions"
        onClick={() => {
          const target =
            actions?.querySelector<HTMLButtonElement>("button") ??
            panel.current?.querySelector<HTMLButtonElement>(
              ".arap-position-button",
            );
          target?.focus();
        }}
      >
        Jump to quick actions
      </button>
      <PanelActionsContext.Provider value={actions}>
        <div
          className="arap-tools"
          role="group"
          tabIndex={0}
          aria-label="Accessibility tools"
        >
          {children}
        </div>
      </PanelActionsContext.Provider>
      <div
        className="arap-quick-actions"
        role="group"
        aria-label="Quick actions"
      >
        <PositionControls key={ctx.isOpen ? "open" : "closed"} />
        <div className="arap-actions" ref={setActions}>
          {footer}
        </div>
      </div>
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
