"use client";

import { useContext, useSyncExternalStore } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { isForcedColorsActive, subscribeForcedColors } from "../core/effects";
import { useAccessibility } from "../core/useAccessibility";
import { AccessibilityContext } from "../core/AccessibilityContext";
import { resolveLocaleStrings } from "../core/i18n";

const FEATURE_KEY = "saturation";
const DEFAULT_VALUE = 0;

export interface SaturationControllerProps {
  /** Optional custom title override */
  title?: string;
  /** Optional custom description */
  description?: string;
  /** Whether to include Grayscale mode option in the segmented control (defaults to true) */
  includeGrayscale?: boolean;
  /** Whether to display chart/image advisory warning when low/high/grayscale is selected (defaults to true) */
  showAdvisory?: boolean;
}

export function SaturationController({
  title,
  description,
  includeGrayscale = true,
  showAdvisory = true,
}: SaturationControllerProps = {}) {
  const ctx = useContext(AccessibilityContext);
  const strings = resolveLocaleStrings(ctx?.locale);
  const { value, setValue } = useAccessibility<number | string>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );
  const forcedColors = useSyncExternalStore(
    subscribeForcedColors,
    isForcedColorsActive,
    () => false,
  );

  const levels = [
    {
      label: strings.saturationOff ?? "Off",
      value: 0,
      mode: "original",
      ariaLabel: "Original saturation (Off)",
    },
    {
      label: strings.saturationLow ?? "Low",
      value: 1,
      mode: "low",
      ariaLabel: "Low saturation (20%)",
    },
    {
      label: strings.saturationHigh ?? "High",
      value: 2,
      mode: "high",
      ariaLabel: "High saturation (200%)",
    },
    ...(includeGrayscale
      ? [
          {
            label: strings.saturationGrayscale ?? "Grayscale",
            value: 3,
            mode: "grayscale",
            ariaLabel: "Saturation: Grayscale",
          },
        ]
      : []),
  ];

  const isLevelActive = (levelVal: number) => {
    if (levelVal === 0) {
      return (
        value === 0 ||
        value === "original" ||
        value === "off" ||
        value === undefined
      );
    }
    if (levelVal === 1) return value === 1 || value === "low";
    if (levelVal === 2) return value === 2 || value === "high";
    if (levelVal === 3) return value === 3 || value === "grayscale";
    return false;
  };

  const getAdvisory = () => {
    if (forcedColors || !showAdvisory) return null;
    if (value === 1 || value === "low") {
      return (
        strings.saturationLowWarning ??
        "Low saturation reduces color differences. Color-coded charts and indicators may be harder to distinguish."
      );
    }
    if (value === 2 || value === "high") {
      return (
        strings.saturationHighWarning ??
        "High saturation increases color intensity (200%), which may cause visual glare or color clipping."
      );
    }
    if (value === 3 || value === "grayscale") {
      return (
        strings.grayscaleWarning ??
        "Grayscale removes all color. Visualizations and charts relying on color alone may require alternative labels."
      );
    }
    return null;
  };

  const advisory = getAdvisory();
  const displayTitle = title ?? strings.features?.saturation ?? "Saturation";

  return (
    <div className="arap-feature" role="group" aria-label={displayTitle}>
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>{displayTitle}</span>
      </span>
      {description && <div className="arap-feature-desc">{description}</div>}
      <div className="arap-segmented">
        {levels.map((level) => {
          const isActive = isLevelActive(level.value);
          return (
            <button
              key={level.value}
              className={`arap-segment ${isActive ? "arap-segment-active" : ""}`}
              onClick={() => setValue(level.value)}
              aria-pressed={isActive}
              aria-label={level.ariaLabel}
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
          {strings.forcedColorsActiveWarning ??
            "Operating system high contrast (forced colors) is active. Filter effects are bypassed to preserve OS contrast."}
        </div>
      )}
      {advisory && (
        <div
          className="arap-notice arap-notice-warning"
          role="note"
          aria-live="polite"
        >
          {advisory}
        </div>
      )}
    </div>
  );
}

export default SaturationController;
