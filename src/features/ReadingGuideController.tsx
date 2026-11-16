"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { WidgetPortal } from "../core/WidgetPortal";
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
    <>
      <div className="arap-feature" role="group" aria-label="Reading Guide">
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
      </div>

      {value && (
        <WidgetPortal>
          <div
            className="arap-reading-aid-nudge"
            data-aid="guide"
            role="region"
            aria-label="Reading guide position"
          >
            <button
              className="arap-btn-secondary arap-reading-aid-nudge-btn"
              onClick={handleNudgeUp}
              aria-label="Move reading guide up"
              title="Move reading guide up (Alt+Up Arrow)"
              type="button"
            >
              ↑
            </button>
            <button
              className="arap-btn-secondary arap-reading-aid-nudge-btn"
              onClick={handleNudgeDown}
              aria-label="Move reading guide down"
              title="Move reading guide down (Alt+Down Arrow)"
              type="button"
            >
              ↓
            </button>
          </div>
        </WidgetPortal>
      )}
    </>
  );
}

export default ReadingGuideController;
