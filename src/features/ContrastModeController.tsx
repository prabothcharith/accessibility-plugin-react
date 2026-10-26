"use client";

import { useSyncExternalStore } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { isForcedColorsActive, subscribeForcedColors } from "../core/effects";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "contrastMode";
const DEFAULT_VALUE = "off";
const OPTIONS = [
  { label: "Original", value: "off" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "High", value: "high" },
  { label: "Invert", value: "invert" },
] as const;

export function ContrastModeController() {
  const { value, setValue } = useAccessibility<string>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );
  const forcedColors = useSyncExternalStore(
    subscribeForcedColors,
    isForcedColorsActive,
    () => false,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Contrast Mode">
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Contrast Mode</span>
      </span>
      <div className="arap-segmented">
        {OPTIONS.map((option) => {
          const isActive =
            value === option.value ||
            (option.value === "off" && (value === "original" || !value));
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
      {forcedColors && (
        <div className="arap-notice" role="status" aria-live="polite">
          Operating system high contrast (forced colors) is active.
        </div>
      )}
    </div>
  );
}

export default ContrastModeController;
