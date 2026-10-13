"use client";

import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "readingGuide";
const DEFAULT_VALUE = false;

export function ReadingGuideController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Reading Guide">
      <span className="arap-label">Reading Guide</span>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label="Reading Guide"
        aria-pressed={value}
        type="button"
      >
        <span className="arap-toggle-knob" />
      </button>
    </div>
  );
}

export default ReadingGuideController;
