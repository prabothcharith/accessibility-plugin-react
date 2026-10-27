"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  type DiagnosticIssue,
  type DiagnosticsConfig,
  type DiagnosticsReport,
  runDiagnostics,
} from "./diagnostics";

export interface DiagnosticsHarnessProps {
  /** Optional diagnostics configuration overrides. */
  config?: DiagnosticsConfig;
  /** Force rendering even in production. Default is false. */
  force?: boolean;
  /** Whether the harness drawer starts open. Default is false. */
  defaultOpen?: boolean;
  /** Custom CSS class. */
  className?: string;
}

export function DiagnosticsHarness({
  config,
  force = false,
  defaultOpen = false,
  className = "",
}: DiagnosticsHarnessProps) {
  const isProduction =
    typeof process !== "undefined" &&
    process.env &&
    process.env.NODE_ENV === "production";

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [report, setReport] = useState<DiagnosticsReport | null>(() => {
    if (isProduction && !force && !config?.force) return null;
    return runDiagnostics({
      ...config,
      force: force || config?.force,
      logToConsole: false,
    });
  });

  const refreshDiagnostics = useCallback(() => {
    const nextReport = runDiagnostics({
      ...config,
      force: force || config?.force,
      logToConsole: false, // Don't spam console when viewing in UI
    });
    setReport(nextReport);
  }, [config, force]);

  useEffect(() => {
    if (isProduction && !force && !config?.force) return;
    const timer = setTimeout(() => {
      refreshDiagnostics();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshDiagnostics, isProduction, force, config?.force]);

  // Completely omit in production unless explicitly forced
  if (isProduction && !force && !config?.force) {
    return null;
  }

  const issues = report?.issues ?? [];
  const filteredIssues =
    activeCategory === "all"
      ? issues
      : issues.filter((issue) => issue.category === activeCategory);

  const summary = report?.summary ?? {
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
  };

  const categories: { id: string; label: string }[] = [
    { id: "all", label: `All (${summary.total})` },
    { id: "provider", label: "Provider" },
    { id: "host-css", label: "Host CSS" },
    { id: "csp", label: "CSP" },
    { id: "storage", label: "Storage" },
    { id: "dom", label: "DOM" },
    { id: "boundaries", label: "Boundaries" },
  ];

  return (
    <div
      className={`arap-diagnostics-harness arap-root ${className}`.trim()}
      data-arap-diagnostics
    >
      {!isOpen ? (
        <button
          type="button"
          className="arap-diagnostics-badge-btn"
          aria-label={`Open accessibility diagnostics (${summary.total} issue${summary.total === 1 ? "" : "s"})`}
          onClick={() => {
            refreshDiagnostics();
            setIsOpen(true);
          }}
        >
          <span className="arap-diagnostics-badge-icon" aria-hidden="true">
            🛠️
          </span>
          <span className="arap-diagnostics-badge-label">Diagnostics</span>
          {summary.total > 0 && (
            <span
              className={`arap-diagnostics-badge-count ${summary.errors > 0 ? "arap-count-error" : summary.warnings > 0 ? "arap-count-warn" : ""}`}
            >
              {summary.total}
            </span>
          )}
        </button>
      ) : (
        <div
          role="region"
          aria-label="Integration Diagnostics Panel"
          className="arap-diagnostics-panel"
        >
          <div className="arap-diagnostics-header">
            <div className="arap-diagnostics-title-wrap">
              <span className="arap-diagnostics-title">
                Integration Diagnostics
              </span>
              <span className="arap-diagnostics-env-tag">
                {report?.environment ?? "development"}
              </span>
            </div>
            <div className="arap-diagnostics-header-actions">
              <button
                type="button"
                className="arap-diagnostics-btn-sm"
                onClick={refreshDiagnostics}
                aria-label="Re-run diagnostics"
              >
                Refresh
              </button>
              <button
                type="button"
                className="arap-diagnostics-btn-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close diagnostics panel"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="arap-diagnostics-disclaimer">
            <span
              className="arap-diagnostics-disclaimer-icon"
              aria-hidden="true"
            >
              ℹ️
            </span>
            <span className="arap-diagnostics-disclaimer-text">
              {report?.disclaimer}
            </span>
          </div>

          <div className="arap-diagnostics-summary-bar">
            <span className="arap-stat arap-stat-total">
              <strong>{summary.total}</strong> Total
            </span>
            <span className="arap-stat arap-stat-errors">
              <strong>{summary.errors}</strong> Errors
            </span>
            <span className="arap-stat arap-stat-warnings">
              <strong>{summary.warnings}</strong> Warnings
            </span>
            <span className="arap-stat arap-stat-info">
              <strong>{summary.info}</strong> Info
            </span>
          </div>

          <div className="arap-diagnostics-tabs" role="tablist">
            {categories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                type="button"
                aria-selected={activeCategory === cat.id}
                className={`arap-diagnostics-tab ${activeCategory === cat.id ? "arap-tab-active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="arap-diagnostics-list">
            {filteredIssues.length === 0 ? (
              <div className="arap-diagnostics-empty">
                <p>No issues detected in this category.</p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <DiagnosticCard key={issue.id} issue={issue} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DiagnosticCard({ issue }: { issue: DiagnosticIssue }) {
  const severityClass =
    issue.severity === "error"
      ? "arap-card-error"
      : issue.severity === "warning"
        ? "arap-card-warn"
        : "arap-card-info";

  return (
    <article className={`arap-diagnostics-card ${severityClass}`}>
      <div className="arap-card-top">
        <span className={`arap-severity-pill arap-pill-${issue.severity}`}>
          {issue.severity.toUpperCase()}
        </span>
        <span className="arap-category-tag">{issue.category}</span>
        {issue.target && (
          <code className="arap-target-badge" title="Target element">
            {issue.target}
          </code>
        )}
      </div>
      <h3 className="arap-card-title">{issue.title}</h3>
      <p className="arap-card-message">{issue.message}</p>
      <div className="arap-card-rec">
        <strong>Recommendation:</strong> {issue.recommendation}
      </div>
      {issue.docUrl && (
        <a
          href={issue.docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="arap-card-link"
        >
          Documentation ↗
        </a>
      )}
    </article>
  );
}
