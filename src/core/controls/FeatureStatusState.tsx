"use client";

import { useContext, type CSSProperties, type ReactNode } from "react";
import { AccessibilityContext } from "../AccessibilityContext";
import { resolveLocaleStrings } from "../i18n";

export interface SearchCountProps {
  totalCount: number;
  matchedCount: number;
  query?: string;
  className?: string;
  style?: CSSProperties;
  locale?: string;
}

export function SearchCount({
  totalCount,
  matchedCount,
  query,
  className = "",
  style,
  locale,
}: SearchCountProps) {
  const ctx = useContext(AccessibilityContext);
  const strings = resolveLocaleStrings(locale ?? ctx?.locale);
  const text = strings.formatSearchCount
    ? strings.formatSearchCount(matchedCount, totalCount, query)
    : query
      ? `Showing ${matchedCount} of ${totalCount} tools matching "${query}"`
      : `Showing all ${totalCount} tools`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`arap-search-count ${className}`}
      style={style}
    >
      {text}
    </div>
  );
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
  locale?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = "",
  style,
  locale,
}: EmptyStateProps) {
  const ctx = useContext(AccessibilityContext);
  const strings = resolveLocaleStrings(locale ?? ctx?.locale);
  const resolvedTitle =
    title ?? strings.emptySearchTitle ?? "No matching tools found";
  const resolvedDescription =
    description ??
    strings.emptySearchDescription ??
    "Try adjusting your search query or reset filters.";
  const resolvedActionLabel =
    actionLabel ?? strings.clearSearchLabel ?? "Clear search";

  return (
    <div
      role="status"
      className={`arap-empty-state ${className}`}
      style={style}
    >
      <div className="arap-empty-icon" aria-hidden="true">
        {icon ?? "🔍"}
      </div>
      <h3 className="arap-empty-title">{resolvedTitle}</h3>
      <p className="arap-empty-desc">{resolvedDescription}</p>
      {onAction && (
        <button type="button" className="arap-empty-btn" onClick={onAction}>
          {resolvedActionLabel}
        </button>
      )}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  style?: CSSProperties;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  className = "",
  style,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`arap-error-state arap-card-alert arap-card-error ${className}`}
      style={style}
    >
      <span className="arap-alert-icon" aria-hidden="true">
        ⚠️
      </span>
      <div className="arap-error-content">
        {title && <h4 className="arap-error-title">{title}</h4>}
        <p className="arap-error-message">{message}</p>
        {onRetry && (
          <button type="button" className="arap-retry-btn" onClick={onRetry}>
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
