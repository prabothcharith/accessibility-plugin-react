"use client";
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
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
import { FeatureMenu } from "../features/FeatureMenu";
import type { AccessibilityListProps } from "./types";

const finePointerSubscribe = (callback: () => void) => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return () => {};
  }
  const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
  mq.addEventListener?.("change", callback);
  return () => mq.removeEventListener?.("change", callback);
};

const finePointerSnapshot = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(pointer: fine) and (hover: hover)").matches
    : true;

const finePointerServerSnapshot = () => true;

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
  menuConfig,
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

  // Desktop-only resizable panel bounds (transient UI state; not persisted into storage)
  const hasFinePointer = useSyncExternalStore(
    finePointerSubscribe,
    finePointerSnapshot,
    finePointerServerSnapshot,
  );

  const isDesktopResizable =
    viewport[0] >= 1024 && viewport[1] >= 520 && hasFinePointer;
  const minPanelWidth = 380;
  const maxPanelWidth = Math.min(
    720,
    Math.max(minPanelWidth, viewport[0] - 48),
  );
  const minPanelHeight = 420;
  const maxPanelHeight = Math.max(minPanelHeight, viewport[1] - 48);

  const [panelSize, setPanelSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const clampPanelSize = useCallback(
    (nextW: number, nextH: number) => ({
      width: Math.max(
        minPanelWidth,
        Math.min(maxPanelWidth, Math.round(nextW)),
      ),
      height: Math.max(
        minPanelHeight,
        Math.min(maxPanelHeight, Math.round(nextH)),
      ),
    }),
    [maxPanelHeight, maxPanelWidth],
  );

  const effectivePanelSize =
    isDesktopResizable && panelSize
      ? clampPanelSize(panelSize.width, panelSize.height)
      : null;

  const effectiveDesktopWidth = effectivePanelSize
    ? effectivePanelSize.width
    : 460;
  const pointPlacementStyle = panelStyle(
    ctx.widgetPlacement,
    viewport,
    triggerSize,
    effectiveDesktopWidth,
  );
  const isRightAnchored =
    ctx.widgetPlacement?.kind === "point" ? false : corner.endsWith("right");
  const isTopAnchored =
    ctx.widgetPlacement?.kind === "point"
      ? Boolean(pointPlacementStyle?.top && pointPlacementStyle.top !== "auto")
      : corner.startsWith("top");

  const startPointerResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDesktopResizable || !panel.current || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = panel.current.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startW = rect.width;
    const startH = rect.height;
    setIsResizing(true);

    const onMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const rawW = isRightAnchored ? startW - dx : startW + dx;
      const rawH = isTopAnchored ? startH + dy : startH - dy;
      setPanelSize(clampPanelSize(rawW, rawH));
    };

    const onEnd = () => {
      setIsResizing(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  };

  const handleResizeKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!isDesktopResizable) return;
    const step = event.shiftKey ? 48 : 24;
    const rect = panel.current?.getBoundingClientRect();
    const currentW = effectivePanelSize?.width ?? rect?.width ?? 460;
    const currentH = effectivePanelSize?.height ?? rect?.height ?? 560;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const dir = event.key === "ArrowLeft" ? -1 : 1;
      const deltaW = isRightAnchored ? -dir * step : dir * step;
      setPanelSize(clampPanelSize(currentW + deltaW, currentH));
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const dir = event.key === "ArrowUp" ? -1 : 1;
      const deltaH = isTopAnchored ? dir * step : -dir * step;
      setPanelSize(clampPanelSize(currentW, currentH + deltaH));
    } else if (event.key === "Home" || event.key === "Enter") {
      event.preventDefault();
      setPanelSize(null);
    }
  };

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
      className={`arap-panel ${isResizing ? "arap-is-resizing" : ""} ${className}`.trim()}
      style={{
        ...pointPlacementStyle,
        ...(effectivePanelSize
          ? {
              width: `${effectivePanelSize.width}px`,
              height: `${effectivePanelSize.height}px`,
              maxHeight:
                pointPlacementStyle?.maxHeight ?? "calc(100dvh - 32px)",
            }
          : {}),
        ...style,
      }}
      data-corner={corner}
      data-position={ctx.position}
      data-large-controls={isLarge}
      data-resizable={isDesktopResizable ? "true" : "false"}
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
          className="arap-close-btn"
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
          {children ? (
            children
          ) : menuConfig ? (
            <FeatureMenu config={menuConfig} grouped={menuConfig.grouped} />
          ) : null}
        </div>
      </PanelActionsContext.Provider>
      <div
        className="arap-quick-actions"
        role="group"
        aria-label={strings.quickActionsLabel}
      >
        {menuConfig?.showPositionControls !== false && (
          <PositionControls key={ctx.isOpen ? "open" : "closed"} />
        )}
        <div className="arap-actions" ref={setActions}>
          {footer}
        </div>
      </div>
      {effectiveStatementUrl && menuConfig?.showStatement !== false && (
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
      {isDesktopResizable && (
        <div
          role="separator"
          tabIndex={0}
          className="arap-resize-handle"
          aria-label="Resize accessibility panel"
          aria-orientation="horizontal"
          aria-valuemin={minPanelWidth}
          aria-valuemax={maxPanelWidth}
          aria-valuenow={Math.round(effectiveDesktopWidth)}
          aria-valuetext={`${Math.round(effectiveDesktopWidth)} by ${Math.round(effectivePanelSize?.height ?? 560)} pixels. Use arrow keys to resize, Enter or Home to reset size.`}
          title="Drag corner to resize panel (arrow keys supported, Enter to reset)"
          data-anchor-x={isRightAnchored ? "left" : "right"}
          data-anchor-y={isTopAnchored ? "bottom" : "top"}
          onPointerDown={startPointerResize}
          onKeyDown={handleResizeKeyDown}
        />
      )}
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
