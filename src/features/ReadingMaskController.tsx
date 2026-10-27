"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";
import { nudgeReadingAid } from "../core/effects";

const FEATURE_KEY = "readingMask";
const HEIGHT_KEY = "readingMaskHeight";
const DEFAULT_VALUE = false;
const DEFAULT_HEIGHT = 100;
const MIN_HEIGHT = 40;
const MAX_HEIGHT = 300;
const STEP_HEIGHT = 20;

export interface ReadingMaskControllerProps {
  minHeight?: number;
  maxHeight?: number;
  step?: number;
}

export function ReadingMaskController({
  minHeight = MIN_HEIGHT,
  maxHeight = MAX_HEIGHT,
  step = STEP_HEIGHT,
}: ReadingMaskControllerProps = {}) {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );
  const { value: height, setValue: setHeight } = useAccessibility<number>(
    HEIGHT_KEY,
    DEFAULT_HEIGHT,
  );

  const currentHeight = typeof height === "number" ? height : DEFAULT_HEIGHT;

  const handleDecreaseHeight = () => {
    setHeight(Math.max(minHeight, currentHeight - step));
  };

  const handleIncreaseHeight = () => {
    setHeight(Math.min(maxHeight, currentHeight + step));
  };

  const handleNudgeUp = () => {
    nudgeReadingAid("readingMask", -30);
  };

  const handleNudgeDown = () => {
    nudgeReadingAid("readingMask", 30);
  };

  return (
    <div
      className="arap-feature arap-feature-expandable"
      role="group"
      aria-label="Reading Mask"
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
          <span>Reading Mask</span>
        </span>
        <button
          className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
          onClick={() => setValue(!value)}
          aria-label="Reading Mask"
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
            flexDirection: "column",
            gap: "8px",
            width: "100%",
          }}
        >
          <div
            style={{
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
              Window Height
            </span>
            <div className="arap-controls">
              <button
                className="arap-btn-sm"
                onClick={handleDecreaseHeight}
                disabled={currentHeight <= minHeight}
                aria-label="Decrease reading mask height"
                type="button"
              >
                −
              </button>
              <output className="arap-value" aria-live="polite">
                {currentHeight}px
              </output>
              <button
                className="arap-btn-sm"
                onClick={handleIncreaseHeight}
                disabled={currentHeight >= maxHeight}
                aria-label="Increase reading mask height"
                type="button"
              >
                +
              </button>
            </div>
          </div>

          <div
            style={{
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
              Move Window
            </span>
            <div className="arap-controls">
              <button
                className="arap-btn-sm"
                onClick={handleNudgeUp}
                aria-label="Move reading mask up"
                title="Alt+Up Arrow"
                type="button"
              >
                ↑
              </button>
              <button
                className="arap-btn-sm"
                onClick={handleNudgeDown}
                aria-label="Move reading mask down"
                title="Alt+Down Arrow"
                type="button"
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReadingMaskController;
