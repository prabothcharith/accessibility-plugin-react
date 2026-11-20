"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import type { HideImagesMode, HideImagesValue } from "../core/featureSchema";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "hideImages";
const DEFAULT_VALUE: HideImagesValue = false;

export interface HideImagesControllerProps {
  label?: string;
  mode?: HideImagesMode;
}

export function HideImagesController({
  label = "Hide Images",
  mode = "all",
}: HideImagesControllerProps = {}) {
  const { value, setValue } = useAccessibility<HideImagesValue>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );
  const isActive =
    mode === "decorative"
      ? value === "decorative"
      : value === true || value === "all";

  return (
    <div className="arap-feature" role="group" aria-label={label}>
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>{label}</span>
      </span>
      <button
        className={`arap-toggle ${isActive ? "arap-toggle-active" : ""}`}
        onClick={() =>
          setValue(
            isActive ? false : mode === "decorative" ? "decorative" : true,
          )
        }
        aria-label={label}
        aria-pressed={isActive}
        type="button"
      >
        <span className="arap-toggle-knob" aria-hidden="true" />
      </button>
    </div>
  );
}

export function HideDecorativeImagesController({
  label = "Hide Decorative Images",
  mode = "decorative",
}: HideImagesControllerProps = {}) {
  return <HideImagesController label={label} mode={mode} />;
}

export default HideImagesController;
