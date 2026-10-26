"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";
import { LINE_HEIGHT_STEPS } from "../core/featureSchema";

const FEATURE_KEY = "lineHeight";
const DEFAULT_VALUE = 100;
const MIN = 50;
const MAX = 200;
const STEP = 10;

export interface LineHeightControllerProps {
  /**
   * Optional custom line height steps (percentages or factors, e.g. [100, 150, 175, 200] or [1.0, 1.5, 1.75, 2.0]).
   * If provided, the stepper snaps to the nearest configured step.
   */
  steps?: readonly number[];
  /**
   * Optional preset step mode: when true, snaps to standard WCAG SC 1.4.12 line height options: 100%, 150%, 175%, 200% (1.0x, 1.5x, 1.75x, 2.0x).
   */
  stepPresets?: boolean;
}

export function LineHeightController({
  steps: customSteps,
  stepPresets,
}: LineHeightControllerProps = {}) {
  const { value, setValue } = useAccessibility<number>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  // Normalize ratio vs percentage (e.g. 1.5 -> 150)
  const normalizedValue =
    typeof value === "number" && value <= 2.5
      ? Math.round(value * 100)
      : (value ?? DEFAULT_VALUE);

  const steps = customSteps
    ? customSteps.map((s) => (s <= 2.5 ? Math.round(s * 100) : s))
    : stepPresets
      ? LINE_HEIGHT_STEPS
      : null;

  const handleDecrease = () => {
    if (steps && steps.length > 0) {
      const idx = steps.findIndex((s) => Math.abs(s - normalizedValue) < 0.1);
      if (idx > 0) {
        setValue(steps[idx - 1]);
      } else if (idx === -1) {
        const lower = [...steps].reverse().find((s) => s < normalizedValue);
        setValue(lower ?? steps[0]);
      }
    } else {
      setValue(Math.max(MIN, normalizedValue - STEP));
    }
  };

  const handleIncrease = () => {
    if (steps && steps.length > 0) {
      const idx = steps.findIndex((s) => Math.abs(s - normalizedValue) < 0.1);
      if (idx !== -1 && idx < steps.length - 1) {
        setValue(steps[idx + 1]);
      } else if (idx === -1) {
        const higher = steps.find((s) => s > normalizedValue);
        setValue(higher ?? steps[steps.length - 1]);
      }
    } else {
      setValue(Math.min(MAX, normalizedValue + STEP));
    }
  };

  const isMin =
    steps && steps.length > 0
      ? normalizedValue <= steps[0]
      : normalizedValue <= MIN;
  const isMax =
    steps && steps.length > 0
      ? normalizedValue >= steps[steps.length - 1]
      : normalizedValue >= MAX;

  return (
    <div
      className="arap-feature arap-feature-stepper"
      role="group"
      aria-label="Line Height"
    >
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Line Height</span>
      </span>
      <div className="arap-controls">
        <button
          className="arap-btn-sm"
          onClick={handleDecrease}
          disabled={isMin}
          aria-label="Decrease line height"
          type="button"
        >
          −
        </button>
        <output className="arap-value" aria-live="polite">
          {Math.round(normalizedValue)}%
        </output>
        <button
          className="arap-btn-sm"
          onClick={handleIncrease}
          disabled={isMax}
          aria-label="Increase line height"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default LineHeightController;
