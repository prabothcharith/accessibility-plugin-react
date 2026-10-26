"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "highlightFocus";
const DEFAULT_VALUE = false;

/**
 * Controller to toggle enhanced focus visibility.
 * Provides high-contrast, multi-layer focus outlines for keyboard navigation,
 * preserving disabled states and yielding to native operating system high contrast themes.
 */
export function HighlightFocusController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Highlight Focus">
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Highlight Focus</span>
      </span>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label="Highlight Focus"
        aria-pressed={Boolean(value)}
        type="button"
      >
        <span className="arap-toggle-knob" aria-hidden="true" />
      </button>
    </div>
  );
}

export const FocusHighlightController = HighlightFocusController;
export default HighlightFocusController;
