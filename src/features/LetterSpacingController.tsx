"use client";

import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "letterSpacing";
const DEFAULT_VALUE = 0;
const MIN = 0;
const MAX = 10;
const STEP = 1;

export function LetterSpacingController() {
  const { value, setValue } = useAccessibility<number>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Letter Spacing">
      <span className="arap-label">Letter Spacing</span>
      <div className="arap-controls">
        <button
          className="arap-btn-sm"
          onClick={() => setValue(Math.max(MIN, value - STEP))}
          disabled={value <= MIN}
          aria-label="Decrease letter spacing"
          type="button"
        >
          −
        </button>
        <output className="arap-value" aria-live="polite">
          {value}px
        </output>
        <button
          className="arap-btn-sm"
          onClick={() => setValue(Math.min(MAX, value + STEP))}
          disabled={value >= MAX}
          aria-label="Increase letter spacing"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default LetterSpacingController;
