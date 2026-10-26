"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "fontFamily";
const DEFAULT_VALUE = "default";
const OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Legible", value: "legible" },
  { label: "Dyslexia", value: "dyslexia-option" },
] as const;

export function FontFamilyController() {
  const { value, setValue } = useAccessibility<string>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Font Family">
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Font Family</span>
      </span>
      <div className="arap-segmented">
        {OPTIONS.map((option) => {
          const isActive =
            value === option.value ||
            (option.value === "default" &&
              (value === "original" || !value || value === "default"));
          return (
            <button
              key={option.value}
              className={`arap-segment ${isActive ? "arap-segment-active" : ""}`}
              onClick={() => setValue(option.value)}
              aria-pressed={isActive}
              type="button"
            >
              {isActive && (
                <span className="arap-check" aria-hidden="true">
                  ✓
                </span>
              )}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FontFamilyController;
