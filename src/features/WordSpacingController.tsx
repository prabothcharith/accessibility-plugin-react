"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "wordSpacing";
const DEFAULT_VALUE = 0;
const MIN = 0;
const MAX = 10;
const STEP = 1;

export interface WordSpacingControllerProps {
  min?: number;
  max?: number;
  step?: number;
  steps?: readonly number[];
}

export function WordSpacingController({
  min = MIN,
  max = MAX,
  step = STEP,
  steps,
}: WordSpacingControllerProps = {}) {
  const { value, setValue } = useAccessibility<number>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

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
      setValue(Math.max(min, value - step));
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
      setValue(Math.min(max, value + step));
    }
  };

  const isMin = steps && steps.length > 0 ? value <= steps[0] : value <= min;
  const isMax =
    steps && steps.length > 0 ? value >= steps[steps.length - 1] : value >= max;

  return (
    <div
      className="arap-feature arap-feature-stepper"
      role="group"
      aria-label="Word Spacing"
    >
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Word Spacing</span>
      </span>
      <div className="arap-controls">
        <button
          className="arap-btn-sm"
          onClick={handleDecrease}
          disabled={isMin}
          aria-label="Decrease word spacing"
          type="button"
        >
          −
        </button>
        <output className="arap-value" aria-live="polite">
          {value}px
        </output>
        <button
          className="arap-btn-sm"
          onClick={handleIncrease}
          disabled={isMax}
          aria-label="Increase word spacing"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default WordSpacingController;
