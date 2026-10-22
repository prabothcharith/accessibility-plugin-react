"use client";

import type { CSSProperties, ReactNode } from "react";

export interface SearchCountProps {
  totalCount: number;
  matchedCount: number;
  query?: string;
  className?: string;
  style?: CSSProperties;
}

export function SearchCount({
  totalCount,
  matchedCount,
  query,
  className = "",
  style,
}: SearchCountProps) {
  const text = query
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
}

export function EmptyState({
  title = "No matching tools found",
  description = "Try adjusting your search query or reset filters.",
  actionLabel = "Clear search",
  onAction,
  icon,
  className = "",
  style,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={`arap-empty-state ${className}`}
      style={style}
    >
      <div className="arap-empty-icon" aria-hidden="true">
        {icon ?? "🔍"}
      </div>
      <h3 className="arap-empty-title">{title}</h3>
      <p className="arap-empty-desc">{description}</p>
      {onAction && (
        <button type="button" className="arap-empty-btn" onClick={onAction}>
          {actionLabel}
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
