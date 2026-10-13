"use client";

import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "saturation";
const DEFAULT_VALUE = 0;
const LEVELS = [
  { label: "Off", value: 0 },
  { label: "Low", value: 1 },
  { label: "High", value: 2 },
];

export function SaturationController() {
  const { value, setValue } = useAccessibility<number>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Saturation">
      <span className="arap-label">Saturation</span>
      <div className="arap-segmented">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            className={`arap-segment ${value === level.value ? "arap-segment-active" : ""}`}
            onClick={() => setValue(level.value)}
            aria-pressed={value === level.value}
            type="button"
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SaturationController;
