"use client";

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
      <span className="arap-label">Text Alignment</span>
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
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TextAlignController;
