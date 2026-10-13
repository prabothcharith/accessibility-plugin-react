"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "linkHighlight";
const DEFAULT_VALUE = false;

export function LinkHighlightController() {
  const { value, setValue } = useAccessibility<boolean | string>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Link Highlight">
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Link Highlight</span>
      </span>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label="Link Highlight"
        aria-pressed={!!value}
        type="button"
      >
        <span className="arap-toggle-knob" aria-hidden="true" />
      </button>
      <div className="arap-segmented">
        {["yellow-on-black", "blue-on-yellow", "black-on-white"].map((mode) => (
          <button
            type="button"
            key={mode}
            className={`arap-segment ${value === mode ? "arap-segment-active" : ""}`}
            aria-pressed={value === mode}
            onClick={() => setValue(mode)}
          >
            {value === mode && (
              <span className="arap-check" aria-hidden="true">
                ✓
              </span>
            )}
            {mode.split("-").join(" ")}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LinkHighlightController;
