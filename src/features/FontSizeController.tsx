"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "fontSize";
const DEFAULT_VALUE = 100;
const MIN = 50;
const MAX = 200;
const STEP = 10;

export function FontSizeController() {
  const { value, setValue } = useAccessibility<number>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div
      className="arap-feature arap-feature-stepper"
      role="group"
      aria-label="Font Size"
    >
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Font Size</span>
      </span>
      <div className="arap-controls">
        <button
          className="arap-btn-sm"
          onClick={() => setValue(Math.max(MIN, value - STEP))}
          disabled={value <= MIN}
          aria-label="Decrease font size"
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
          aria-label="Increase font size"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default FontSizeController;
