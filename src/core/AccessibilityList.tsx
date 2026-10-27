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
import { resolveLocaleStrings, isRtlLocale } from "./i18n";
import type { AccessibilityListProps } from "./types";

function Panel({
  children,
  footer,
  className = "",
  style,
  title,
  description,
  closeLabel,
  statementUrl,
  largeControls,
  locale,
}: AccessibilityListProps) {
  const ctx = useContext(AccessibilityContext)!;
  const effectiveLocale =
    locale ||
    ctx.locale ||
    (typeof document !== "undefined"
      ? document.documentElement.lang
      : undefined) ||
    "en";
  const strings = resolveLocaleStrings(effectiveLocale);
  const panelTitle = title ?? strings.title;
  const panelDescription =
    description === undefined ? strings.description : description;
  const panelCloseLabel = closeLabel ?? strings.closeLabel;
  const effectiveStatementUrl = statementUrl ?? ctx.statementUrl;
  const isLarge = largeControls ?? ctx.largeControls ?? false;
  const isRtl = isRtlLocale(effectiveLocale);

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
      data-large-controls={isLarge}
      lang={effectiveLocale ?? "en"}
      dir={isRtl ? "rtl" : "ltr"}
      translate="no"
      hidden={!ctx.isOpen}
      role="region"
      aria-label={panelTitle}
      aria-describedby={
        panelDescription ? `${ctx.panelId}-description` : undefined
      }
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
          <h2>{panelTitle}</h2>
          {panelDescription && (
            <p id={`${ctx.panelId}-description`} className="arap-description">
              {panelDescription}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label={panelCloseLabel}
          onClick={ctx.closeMenu}
        >
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
        {strings.skipToActions}
      </button>
      <PanelActionsContext.Provider value={actions}>
        <div
          className="arap-tools"
          role="group"
          tabIndex={0}
          aria-label={strings.toolsLabel}
        >
          {children}
        </div>
      </PanelActionsContext.Provider>
      <div
        className="arap-quick-actions"
        role="group"
        aria-label={strings.quickActionsLabel}
      >
        <PositionControls key={ctx.isOpen ? "open" : "closed"} />
        <div className="arap-actions" ref={setActions}>
          {footer}
        </div>
      </div>
      {effectiveStatementUrl && (
        <div className="arap-statement">
          <a
            href={effectiveStatementUrl}
            className="arap-statement-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {strings.statementLink}
            <span className="arap-sr-only"> ({strings.openInNewTab})</span>
          </a>
        </div>
      )}
      <div className="arap-credits">
        <span>
          {strings.creditsPrefix ?? "Designed and developed by"}{" "}
          <a
            href="https://www.praboth.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            {strings.creditsName ?? "Praboth"}
            <span className="arap-sr-only"> ({strings.openInNewTab})</span>
          </a>
        </span>
        <a
          href="https://www.praboth.com/accessibility-plugin-react"
          target="_blank"
          rel="noopener noreferrer"
        >
          {strings.documentationLink ?? "Official documentation"}
          <span className="arap-sr-only"> ({strings.openInNewTab})</span>
        </a>
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
