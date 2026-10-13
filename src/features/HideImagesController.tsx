"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "hideImages";
const DEFAULT_VALUE = false;

export function HideImagesController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Hide Images">
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Hide Images</span>
      </span>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label="Hide Images"
        aria-pressed={value}
        type="button"
      >
        <span className="arap-toggle-knob" aria-hidden="true" />
      </button>
    </div>
  );
}

export default HideImagesController;
