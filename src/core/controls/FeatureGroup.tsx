"use client";

import { useId, useState, type ReactNode } from "react";

export interface FeatureGroupProps {
  id?: string;
  title: string;
  description?: string;
  badge?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
  role?: "group" | "region";
  "data-group"?: string;
  children: ReactNode;
}

export function FeatureGroup({
  id,
  title,
  description,
  badge,
  collapsible = false,
  defaultExpanded = true,
  expanded: controlledExpanded,
  onExpandedChange,
  className = "",
  role,
  "data-group": dataGroup,
  children,
}: FeatureGroupProps) {
  const autoId = useId();
  const baseId = id ?? `arap-group-${autoId}`;
  const headingId = `${baseId}-heading`;
  const contentId = `${baseId}-content`;

  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = collapsible
    ? isControlled
      ? controlledExpanded
      : internalExpanded
    : true;

  const handleToggle = () => {
    const next = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(next);
    }
    onExpandedChange?.(next);
  };

  return (
    <section
      id={id}
      role={role}
      data-group={dataGroup}
      className={`arap-feature-group ${collapsible ? "arap-is-collapsible" : ""} ${!isExpanded ? "arap-is-collapsed" : ""} ${className}`.trim()}
      aria-labelledby={headingId}
    >
      {collapsible ? (
        <h3 id={headingId} className="arap-group-header">
          <button
            type="button"
            className="arap-group-toggle"
            aria-expanded={isExpanded}
            aria-controls={contentId}
            onClick={handleToggle}
          >
            <span className="arap-group-heading-block">
              <span className="arap-group-title-row">
                <span className="arap-group-title">{title}</span>
                {badge && <span className="arap-group-badge">{badge}</span>}
              </span>
              {description && (
                <span className="arap-group-desc">{description}</span>
              )}
            </span>
            <svg
              className={`arap-group-chevron ${isExpanded ? "arap-is-open" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </h3>
      ) : (
        <div className="arap-group-header arap-group-header-static">
          <div className="arap-group-heading-block">
            <div className="arap-group-title-row">
              <h3 id={headingId} className="arap-group-title">
                {title}
              </h3>
              {badge && <span className="arap-group-badge">{badge}</span>}
            </div>
            {description && <p className="arap-group-desc">{description}</p>}
          </div>
        </div>
      )}

      <div
        id={contentId}
        className="arap-group-body"
        hidden={collapsible && !isExpanded}
      >
        {children}
      </div>
    </section>
  );
}

export default FeatureGroup;
