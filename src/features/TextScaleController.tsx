"use client";

import { useContext } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";
import { AccessibilityContext } from "../core/AccessibilityContext";
import { resolveLocaleStrings } from "../core/i18n";
import { TEXT_SCALE_STEPS } from "../core/featureSchema";

const FEATURE_KEY = "fontScale";
const DEFAULT_VALUE = 1.0;

export interface TextScaleControllerProps {
  /**
   * Custom scale factor steps. Default: [1.0, 1.125, 1.25, 1.5, 2.0].
   */
  steps?: readonly number[];
  /**
   * Accessible group label and visible title. Default: "Bigger Text" (or localized).
   */
  label?: string;
}

export function TextScaleController({
  steps = TEXT_SCALE_STEPS,
  label,
}: TextScaleControllerProps = {}) {
  const ctx = useContext(AccessibilityContext);
  const strings = resolveLocaleStrings(ctx?.locale);
  const effectiveLabel = label ?? strings.features?.textScale ?? "Bigger Text";

  const { value, setValue } = useAccessibility<number>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  const currentIndex = steps.findIndex((s) => Math.abs(s - value) < 0.01);
  const isMin = currentIndex === 0 || value <= steps[0];
  const isMax =
    currentIndex === steps.length - 1 || value >= steps[steps.length - 1];

  const handleDecrease = () => {
    if (currentIndex > 0) {
      setValue(steps[currentIndex - 1]);
    } else if (currentIndex === -1) {
      const lower = [...steps].reverse().find((s) => s < value);
      setValue(lower ?? steps[0]);
    }
  };

  const handleIncrease = () => {
    if (currentIndex !== -1 && currentIndex < steps.length - 1) {
      setValue(steps[currentIndex + 1]);
    } else if (currentIndex === -1) {
      const higher = steps.find((s) => s > value);
      setValue(higher ?? steps[steps.length - 1]);
    }
  };

  const percentage = Math.round(value * 100);

  return (
    <div
      className="arap-feature arap-feature-stepper"
      role="group"
      aria-label={effectiveLabel}
    >
      <span className="arap-label">
        <FeatureIcon name="fontSize" />
        <span>{effectiveLabel}</span>
      </span>
      <div className="arap-controls">
        <button
          className="arap-btn-sm"
          onClick={handleDecrease}
          disabled={isMin}
          aria-label={strings.decreaseTextSize ?? "Decrease text size"}
          type="button"
        >
          −
        </button>
        <output className="arap-value" aria-live="polite">
          {percentage}%
        </output>
        <button
          className="arap-btn-sm"
          onClick={handleIncrease}
          disabled={isMax}
          aria-label={strings.increaseTextSize ?? "Increase text size"}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default TextScaleController;
