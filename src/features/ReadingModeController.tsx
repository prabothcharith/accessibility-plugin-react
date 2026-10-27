"use client";

import {
  useState,
  useEffect,
  useRef,
  useId,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";
import { AccessibilityContext } from "../core/AccessibilityContext";
import { resolveLocaleStrings } from "../core/i18n";
import {
  extractArticleContent,
  type ArticleContent,
} from "../core/readingMode";

const FEATURE_KEY = "readingMode";
const DEFAULT_VALUE = false;

const emptySubscribe = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export interface ReadingModeControllerProps {
  className?: string;
  label?: string;
  description?: string;
  onActivate?: (content: ArticleContent) => void;
  onDeactivate?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Controller for non-destructive Reading Mode.
 *
 * Extracts article-focused content without rewriting or mutating host React DOM elements.
 * Preserves headings, links, and images while stripping forms, navigation, ads, and sensitive fields.
 * If extraction fails or lacks readable content, gracefully notifies the user and returns to the original page.
 * Zero content is sent externally.
 */
export function ReadingModeController({
  className = "",
  label,
  description,
  onActivate,
  onDeactivate,
  onError,
}: ReadingModeControllerProps = {}) {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );
  const context = useContext(AccessibilityContext);
  const strings = resolveLocaleStrings(context?.locale);

  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [readerTheme, setReaderTheme] = useState<"light" | "sepia" | "dark">(
    "light",
  );
  const [readerScale, setReaderScale] = useState<number>(100);
  const mounted = useMounted();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const featureLabel = label ?? strings.features?.readingMode ?? "Reading Mode";
  const featureDescription =
    description ??
    strings.readingModeDescription ??
    "Distraction-free article view";
  const closeLabel = strings.readingModeClose ?? "Close Reading Mode";
  const openLabel = strings.readingModeOpen ?? "Open Reading Mode";
  const failedMessage =
    strings.readingModeFailed ??
    "No readable article content found on this page.";

  const activeArticle = value ? article : null;

  const handleClose = () => {
    setValue(false);
    setArticle(null);
    onDeactivate?.();
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    } else {
      triggerRef.current?.focus();
    }
  };

  const handleToggle = () => {
    if (value) {
      handleClose();
    } else {
      if (typeof document !== "undefined") {
        previousActiveElement.current =
          document.activeElement as HTMLElement | null;
        const extracted = extractArticleContent(document.body);

        if (extracted) {
          setArticle(extracted);
          setStatusMessage(null);
          setValue(true);
          onActivate?.(extracted);
        } else {
          setValue(false);
          setArticle(null);
          setStatusMessage(failedMessage);
          onError?.(new Error(failedMessage));
          if (previousActiveElement.current) {
            previousActiveElement.current.focus();
          } else {
            triggerRef.current?.focus();
          }
        }
      }
    }
  };

  const handleCloseRef = useRef(handleClose);
  useEffect(() => {
    handleCloseRef.current = handleClose;
  });

  // Trap focus and manage Escape key inside dialog
  useEffect(() => {
    if (!activeArticle || !dialogRef.current) return;

    dialogRef.current.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        handleCloseRef.current();
        return;
      }

      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [activeArticle]);

  const handleZoomOut = () => {
    setReaderScale((prev) => Math.max(90, prev - 15));
  };

  const handleZoomIn = () => {
    setReaderScale((prev) => Math.min(160, prev + 15));
  };

  const wordCountDisplay = activeArticle
    ? strings.formatReadingWords
      ? strings.formatReadingWords(activeArticle.wordCount)
      : `${activeArticle.wordCount} words`
    : "";

  const readingTimeDisplay = activeArticle
    ? strings.formatReadingTime
      ? strings.formatReadingTime(activeArticle.readingTimeMinutes)
      : `${activeArticle.readingTimeMinutes} min read`
    : "";

  const readerDialog: ReactNode =
    mounted && activeArticle && typeof document !== "undefined"
      ? createPortal(
          <div
            className="arap-reading-mode-backdrop"
            data-arap-ui=""
            data-theme={readerTheme}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
          >
            <div
              ref={dialogRef}
              className="arap-reading-mode-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              style={{ fontSize: `${readerScale}%` }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                  handleClose();
                }
              }}
            >
              <div className="arap-reading-mode-header">
                <div className="arap-reading-mode-meta">
                  <span className="arap-reading-mode-badge" aria-hidden="true">
                    {featureLabel}
                  </span>
                  <span className="arap-reading-mode-stat">
                    {wordCountDisplay}
                  </span>
                  <span
                    className="arap-reading-mode-divider"
                    aria-hidden="true"
                  >
                    •
                  </span>
                  <span className="arap-reading-mode-stat">
                    {readingTimeDisplay}
                  </span>
                </div>

                <div
                  className="arap-reading-mode-toolbar"
                  role="toolbar"
                  aria-label="Reader tools"
                >
                  <div
                    className="arap-reading-mode-theme-group"
                    role="group"
                    aria-label="Reader theme"
                  >
                    <button
                      type="button"
                      className={`arap-reader-theme-btn ${readerTheme === "light" ? "arap-active" : ""}`}
                      onClick={() => setReaderTheme("light")}
                      aria-pressed={readerTheme === "light"}
                      aria-label="Light theme"
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      className={`arap-reader-theme-btn ${readerTheme === "sepia" ? "arap-active" : ""}`}
                      onClick={() => setReaderTheme("sepia")}
                      aria-pressed={readerTheme === "sepia"}
                      aria-label="Sepia theme"
                    >
                      Sepia
                    </button>
                    <button
                      type="button"
                      className={`arap-reader-theme-btn ${readerTheme === "dark" ? "arap-active" : ""}`}
                      onClick={() => setReaderTheme("dark")}
                      aria-pressed={readerTheme === "dark"}
                      aria-label="Dark theme"
                    >
                      Dark
                    </button>
                  </div>

                  <div
                    className="arap-reading-mode-zoom-group"
                    role="group"
                    aria-label="Text zoom"
                  >
                    <button
                      type="button"
                      className="arap-reader-zoom-btn"
                      onClick={handleZoomOut}
                      aria-label="Decrease reader text size"
                      disabled={readerScale <= 90}
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      className="arap-reader-zoom-btn"
                      onClick={handleZoomIn}
                      aria-label="Increase reader text size"
                      disabled={readerScale >= 160}
                    >
                      A+
                    </button>
                  </div>

                  <button
                    type="button"
                    className="arap-reading-mode-close"
                    onClick={handleClose}
                    aria-label={closeLabel}
                    title={closeLabel}
                  >
                    ×
                  </button>
                </div>
              </div>

              <main className="arap-reading-mode-content">
                <h1 id={titleId} className="arap-reading-mode-title">
                  {activeArticle.title}
                </h1>
                {activeArticle.byline && (
                  <p className="arap-reading-mode-byline">
                    {activeArticle.byline}
                  </p>
                )}
                <div
                  className="arap-reading-mode-body"
                  dangerouslySetInnerHTML={{ __html: activeArticle.html }}
                />
              </main>

              <footer className="arap-reading-mode-footer">
                <button
                  type="button"
                  className="arap-reading-mode-exit-btn"
                  onClick={handleClose}
                >
                  {closeLabel}
                </button>
              </footer>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        className={`arap-feature ${className}`}
        role="group"
        aria-label={featureLabel}
      >
        <span className="arap-label">
          <FeatureIcon name={FEATURE_KEY} />
          <span>{featureLabel}</span>
          <span className="arap-sr-only">{featureDescription}</span>
        </span>
        <button
          ref={triggerRef}
          type="button"
          className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
          onClick={handleToggle}
          aria-label={value ? closeLabel : openLabel}
          aria-pressed={value}
          title={value ? closeLabel : openLabel}
        >
          <span className="arap-toggle-knob" aria-hidden="true" />
        </button>
      </div>

      {statusMessage && (
        <div
          className="arap-feature-status"
          role="status"
          aria-live="polite"
          style={{ fontSize: "0.85rem", color: "#dc2626", marginTop: "4px" }}
        >
          {statusMessage}
        </div>
      )}

      {readerDialog}
    </>
  );
}

export default ReadingModeController;
