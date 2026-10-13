"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "contrast";
const DEFAULT_VALUE = 0;
const LEVELS = [
  { label: "Off", value: 0 },
  { label: "Reduced", value: "reduced" },
  { label: "Low", value: 1 },
  { label: "High", value: 2 },
  { label: "Extra", value: 3 },
  { label: "Yellow on black", value: "yellow-on-black" },
  { label: "White on black", value: "white-on-black" },
  { label: "Blue on yellow", value: "blue-on-yellow" },
];

export function ContrastController() {
  const { value, setValue } = useAccessibility<number | string>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Contrast">
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Contrast</span>
      </span>
      <div className="arap-segmented">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            className={`arap-segment ${value === level.value ? "arap-segment-active" : ""}`}
            onClick={() => setValue(level.value)}
            aria-pressed={value === level.value}
            type="button"
          >
            {value === level.value && (
              <span className="arap-check" aria-hidden="true">
                ✓
              </span>
            )}
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ContrastController;
