"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { isForcedColorsActive, subscribeForcedColors } from "../core/effects";
import { useAccessibility } from "../core/useAccessibility";
import {
  type SmartContrastReport,
  SMART_CONTRAST_DISCLAIMER,
} from "../core/smartContrast";

const FEATURE_KEY = "smartContrast";
const DEFAULT_VALUE = "off";

const OPTIONS = [
  { label: "Original", value: "off" },
  { label: "AA (4.5:1)", value: "aa" },
  { label: "AAA (7.0:1)", value: "aaa" },
] as const;

export function SmartContrastController() {
  const { value, setValue } = useAccessibility<string | boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  const forcedColors = useSyncExternalStore(
    subscribeForcedColors,
    isForcedColorsActive,
    () => false,
  );

  const [report, setReport] = useState<SmartContrastReport | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<SmartContrastReport>;
      if (custom.detail) {
        setReport(custom.detail);
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("arap:smart-contrast-report", handler);
      return () => {
        document.removeEventListener("arap:smart-contrast-report", handler);
      };
    }
  }, []);

  const isActive = value === "aa" || value === "aaa" || value === true;

  return (
    <div className="arap-feature" role="group" aria-label="Smart Contrast">
      <div className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Smart Contrast</span>
        <span
          className="arap-prototype-pill"
          title="Research prototype: not a compliance certification"
        >
          Prototype
        </span>
      </div>

      <div className="arap-segmented">
        {OPTIONS.map((option) => {
          const isOptionActive =
            (option.value === "off" && (value === "off" || value === false || !value)) ||
            (option.value === "aa" && (value === "aa" || value === true)) ||
            (option.value === "aaa" && value === "aaa");

          return (
            <button
              key={option.value}
              className={`arap-segment ${isOptionActive ? "arap-segment-active" : ""}`}
              onClick={() => setValue(option.value)}
              aria-pressed={isOptionActive}
              type="button"
            >
              {isOptionActive && (
                <span className="arap-check" aria-hidden="true">
                  ✓
                </span>
              )}
              {option.label}
            </button>
          );
        })}
      </div>

      {isActive && report && !forcedColors && (
        <div className="arap-smart-contrast-stats" role="status" aria-live="polite">
          <div className="arap-stats-summary">
            <span>
              <strong>{report.adjustedCount}</strong> adjusted
            </span>
            <span>•</span>
            <span>
              <strong>{report.sufficientCount}</strong> sufficient
            </span>
            {report.unsupportedCount > 0 && (
              <>
                <span>•</span>
                <span className="arap-unsupported-tag">
                  <strong>{report.unsupportedCount}</strong> unsupported
                </span>
              </>
            )}
          </div>

          {report.unsupportedCount > 0 && (
            <button
              type="button"
              className="arap-unsupported-toggle"
              onClick={() => setShowDetails((prev) => !prev)}
              aria-expanded={showDetails}
            >
              {showDetails ? "Hide unsupported details" : "Show unsupported elements"}
            </button>
          )}

          {showDetails && report.unsupportedElements.length > 0 && (
            <ul className="arap-unsupported-list" aria-label="Unsupported elements">
              {report.unsupportedElements.map((item, idx) => (
                <li key={idx} className="arap-unsupported-item">
                  <code>&lt;{item.tag}&gt;</code>:{" "}
                  <span className="arap-reason-pill">{item.reason}</span>
                  {item.textSnippet && (
                    <span className="arap-snippet"> “{item.textSnippet}”</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="arap-notice arap-disclaimer-notice">
        {SMART_CONTRAST_DISCLAIMER}
      </div>

      {forcedColors && (
        <div className="arap-notice" role="status" aria-live="polite">
          Operating system high contrast (forced colors) is active. Filter and contrast modifications are bypassed.
        </div>
      )}
    </div>
  );
}

export default SmartContrastController;
