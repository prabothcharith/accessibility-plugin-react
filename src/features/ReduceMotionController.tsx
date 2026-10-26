"use client";

import { useSyncExternalStore } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { isReducedMotionActive, subscribeReducedMotion } from "../core/effects";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "reduceMotion";
const DEFAULT_VALUE = false;

/**
 * Controller to reduce motion and pause active animations and media.
 * Disables non-essential CSS animations, smooth scrolling, pauses running WAAPI animations,
 * and pauses playing media while honoring operating system motion preferences.
 */
export function ReduceMotionController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );
  const osReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    isReducedMotionActive,
    () => false,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Reduce Motion">
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Reduce Motion</span>
      </span>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label="Reduce Motion"
        aria-pressed={Boolean(value)}
        type="button"
      >
        <span className="arap-toggle-knob" aria-hidden="true" />
      </button>
      {osReducedMotion && (
        <div className="arap-notice" role="status" aria-live="polite">
          Operating system prefers-reduced-motion is active.
        </div>
      )}
    </div>
  );
}

export default ReduceMotionController;
