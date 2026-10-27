"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "tooltips";
const DEFAULT_VALUE = false;

export interface TooltipsControllerProps {
  className?: string;
  label?: string;
  description?: string;
}

/**
 * Controller to toggle accessible tooltips for authored descriptions.
 * Displays meaningful alt text, aria-labels, and descriptions on pointer hover and keyboard focus
 * without overwriting semantics, inventing text, or disclosing private fields.
 * Conforms to WCAG 2.1 SC 1.4.13 (Dismissible with Escape, Hoverable, and Persistent).
 */
export function TooltipsController({
  className = "",
  label = "Accessible Tooltips",
  description = "Show authored alt text and descriptions on hover or focus",
}: TooltipsControllerProps) {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div
      className={`arap-feature ${className}`}
      role="group"
      aria-label={label}
    >
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>
          <span style={{ display: "block" }}>{label}</span>
          {description && (
            <span
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 400,
                color: "var(--arap-muted, #64748b)",
                marginTop: "1px",
              }}
            >
              {description}
            </span>
          )}
        </span>
      </span>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label={label}
        aria-pressed={Boolean(value)}
        type="button"
      >
        <span className="arap-toggle-knob" aria-hidden="true" />
      </button>
    </div>
  );
}

export const AccessibleTooltipsController = TooltipsController;
export default TooltipsController;
