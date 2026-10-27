"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";
import { nudgeReadingAid } from "../core/effects";

const FEATURE_KEY = "readingGuide";
const DEFAULT_VALUE = false;

export interface ReadingGuideControllerProps {
  nudgeStep?: number;
}

export function ReadingGuideController({
  nudgeStep = 30,
}: ReadingGuideControllerProps = {}) {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  const handleNudgeUp = () => {
    nudgeReadingAid("readingGuide", -nudgeStep);
  };

  const handleNudgeDown = () => {
    nudgeReadingAid("readingGuide", nudgeStep);
  };

  return (
    <div
      className="arap-feature arap-feature-expandable"
      role="group"
      aria-label="Reading Guide"
    >
      <div
        className="arap-feature-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <span className="arap-label">
          <FeatureIcon name={FEATURE_KEY} />
          <span>Reading Guide</span>
        </span>
        <button
          className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
          onClick={() => setValue(!value)}
          aria-label="Reading Guide"
          aria-pressed={value}
          type="button"
        >
          <span className="arap-toggle-knob" aria-hidden="true" />
        </button>
      </div>

      {value && (
        <div
          className="arap-subcontrols"
          style={{
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: "1px solid var(--arap-divider, #e5e7eb)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--arap-muted, #4b5563)",
            }}
          >
            Move Guide
          </span>
          <div className="arap-controls">
            <button
              className="arap-btn-sm"
              onClick={handleNudgeUp}
              aria-label="Move reading guide up"
              title="Alt+Up Arrow"
              type="button"
            >
              ↑
            </button>
            <button
              className="arap-btn-sm"
              onClick={handleNudgeDown}
              aria-label="Move reading guide down"
              title="Alt+Down Arrow"
              type="button"
            >
              ↓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadingGuideController;
