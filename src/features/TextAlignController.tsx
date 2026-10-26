"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "textAlign";
const DEFAULT_VALUE = "default";
const OPTIONS = ["default", "left", "center", "right", "justify"] as const;

export function TextAlignController() {
  const { value, setValue } = useAccessibility<string>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Text Alignment">
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Text Alignment</span>
      </span>
      <div className="arap-segmented">
        {OPTIONS.map((option) => (
          <button
            key={option}
            className={`arap-segment ${value === option ? "arap-segment-active" : ""}`}
            onClick={() => setValue(option)}
            aria-pressed={value === option}
            type="button"
            style={{ textTransform: "capitalize" }}
          >
            {value === option && (
              <span className="arap-check" aria-hidden="true">
                ✓
              </span>
            )}
            {option}
          </button>
        ))}
      </div>
      {value === "justify" && (
        <div
          className="arap-notice arap-notice-warning"
          role="note"
          aria-live="polite"
        >
          Justified text creates uneven word spacing (&ldquo;rivers of
          white&rdquo;) that can impair readability.
        </div>
      )}
    </div>
  );
}

export default TextAlignController;
