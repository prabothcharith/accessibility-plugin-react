"use client";

import { useContext, useSyncExternalStore } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { isForcedColorsActive, subscribeForcedColors } from "../core/effects";
import { useAccessibility } from "../core/useAccessibility";
import { AccessibilityContext } from "../core/AccessibilityContext";
import { resolveLocaleStrings } from "../core/i18n";

const FEATURE_KEY = "grayscale";
const DEFAULT_VALUE = false;

export interface GrayscaleControllerProps {
  /** Optional custom title override */
  title?: string;
  /** Optional custom description */
  description?: string;
  /** Whether to display chart/image advisory warning when grayscale is enabled (defaults to true) */
  showAdvisory?: boolean;
}

export function GrayscaleController({
  title,
  description,
  showAdvisory = true,
}: GrayscaleControllerProps = {}) {
  const ctx = useContext(AccessibilityContext);
  const strings = resolveLocaleStrings(ctx?.locale);
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );
  const forcedColors = useSyncExternalStore(
    subscribeForcedColors,
    isForcedColorsActive,
    () => false,
  );

  const displayTitle = title ?? strings.features?.grayscale ?? "Grayscale";

  return (
    <div className="arap-feature" role="group" aria-label={displayTitle}>
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>{displayTitle}</span>
      </span>
      {description && <div className="arap-feature-desc">{description}</div>}
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label="Grayscale"
        aria-pressed={value}
        type="button"
      >
        <span className="arap-toggle-knob" aria-hidden="true" />
      </button>
      {forcedColors && (
        <div className="arap-notice" role="status" aria-live="polite">
          {strings.forcedColorsActiveWarning ??
            "Operating system high contrast (forced colors) is active. Filter effects are bypassed to preserve OS contrast."}
        </div>
      )}
      {value && !forcedColors && showAdvisory && (
        <div
          className="arap-notice arap-notice-warning"
          role="note"
          aria-live="polite"
        >
          {strings.grayscaleWarning ??
            "Grayscale removes all color. Visualizations and charts relying on color alone may require alternative labels."}
        </div>
      )}
    </div>
  );
}

export default GrayscaleController;
