"use client";

import { useSyncExternalStore } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { isForcedColorsActive, subscribeForcedColors } from "../core/effects";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "contrast";
const DEFAULT_VALUE = 0;
const LEVELS = [
  { label: "Off", value: 0 },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "High Contrast", value: "high" },
  { label: "Invert", value: "invert" },
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
  const forcedColors = useSyncExternalStore(
    subscribeForcedColors,
    isForcedColorsActive,
    () => false,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Contrast">
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Contrast</span>
      </span>
      <div className="arap-segmented">
        {LEVELS.map((level) => {
          const isActive =
            value === level.value ||
            (level.value === 0 && (value === "off" || value === "original"));
          return (
            <button
              key={String(level.value)}
              className={`arap-segment ${isActive ? "arap-segment-active" : ""}`}
              onClick={() => setValue(level.value)}
              aria-pressed={isActive}
              type="button"
            >
              {isActive && (
                <span className="arap-check" aria-hidden="true">
                  ✓
                </span>
              )}
              {level.label}
            </button>
          );
        })}
      </div>
      {forcedColors && (
        <div className="arap-notice" role="status" aria-live="polite">
          Operating system high contrast (forced colors) is active.
        </div>
      )}
    </div>
  );
}

export default ContrastController;
