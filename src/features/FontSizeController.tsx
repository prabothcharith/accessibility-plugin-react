"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "fontSize";
const DEFAULT_VALUE = 100;
const MIN = 50;
const MAX = 200;
const STEP = 10;
const DEFAULT_STEP_SCALE = [100, 112.5, 125, 150, 200] as const;

export interface FontSizeControllerProps {
  /** Optional custom label or title */
  label?: string;
  title?: string;
  /**
   * Optional custom scale steps (percentages or factors, e.g. [100, 112.5, 125, 150, 200] or [1.0, 1.125, 1.25, 1.5, 2.0]).
   * If provided, the stepper snaps to the nearest configured step.
   */
  steps?: readonly number[];
  /**
   * Optional step scale mode: when true, snaps to standard WCAG reflow steps: 100%, 112.5%, 125%, 150%, 200%.
   */
  stepScale?: boolean;
}

export function FontSizeController({
  label,
  title,
  steps: customSteps,
  stepScale,
}: FontSizeControllerProps = {}) {
  const displayTitle = label ?? title ?? "Font Size";
  const { value, setValue } = useAccessibility<number>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  const steps = customSteps
    ? customSteps.map((s) => (s <= 2.5 ? Math.round(s * 1000) / 10 : s))
    : stepScale
      ? DEFAULT_STEP_SCALE
      : null;

  const handleDecrease = () => {
    if (steps && steps.length > 0) {
      const idx = steps.findIndex((s) => Math.abs(s - value) < 0.1);
      if (idx > 0) {
        setValue(steps[idx - 1]);
      } else if (idx === -1) {
        const lower = [...steps].reverse().find((s) => s < value);
        setValue(lower ?? steps[0]);
      }
    } else {
      setValue(Math.max(MIN, value - STEP));
    }
  };

  const handleIncrease = () => {
    if (steps && steps.length > 0) {
      const idx = steps.findIndex((s) => Math.abs(s - value) < 0.1);
      if (idx !== -1 && idx < steps.length - 1) {
        setValue(steps[idx + 1]);
      } else if (idx === -1) {
        const higher = steps.find((s) => s > value);
        setValue(higher ?? steps[steps.length - 1]);
      }
    } else {
      setValue(Math.min(MAX, value + STEP));
    }
  };

  const isMin = steps && steps.length > 0 ? value <= steps[0] : value <= MIN;
  const isMax =
    steps && steps.length > 0 ? value >= steps[steps.length - 1] : value >= MAX;

  return (
    <div
      className="arap-feature arap-feature-stepper"
      role="group"
      aria-label={displayTitle}
    >
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>{displayTitle}</span>
      </span>
      <div className="arap-controls">
        <button
          className="arap-btn-sm"
          onClick={handleDecrease}
          disabled={isMin}
          aria-label="Decrease font size"
          type="button"
        >
          −
        </button>
        <output className="arap-value" aria-live="polite">
          {Math.round(value)}%
        </output>
        <button
          className="arap-btn-sm"
          onClick={handleIncrease}
          disabled={isMax}
          aria-label="Increase font size"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default FontSizeController;
