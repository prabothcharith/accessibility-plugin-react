"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "lineHeight";
const DEFAULT_VALUE = 100;
const MIN = 50;
const MAX = 200;
const STEP = 10;

export function LineHeightController() {
  const { value, setValue } = useAccessibility<number>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div
      className="arap-feature arap-feature-stepper"
      role="group"
      aria-label="Line Height"
    >
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Line Height</span>
      </span>
      <div className="arap-controls">
        <button
          className="arap-btn-sm"
          onClick={() => setValue(Math.max(MIN, value - STEP))}
          disabled={value <= MIN}
          aria-label="Decrease line height"
          type="button"
        >
          −
        </button>
        <output className="arap-value" aria-live="polite">
          {value}%
        </output>
        <button
          className="arap-btn-sm"
          onClick={() => setValue(Math.min(MAX, value + STEP))}
          disabled={value >= MAX}
          aria-label="Increase line height"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default LineHeightController;
