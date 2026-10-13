"use client";

import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "readingMask";
const DEFAULT_VALUE = false;

export function ReadingMaskController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Reading Mask">
      <span className="arap-label">Reading Mask</span>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label="Reading Mask"
        aria-pressed={value}
        type="button"
      >
        <span className="arap-toggle-knob" />
      </button>
    </div>
  );
}

export default ReadingMaskController;
