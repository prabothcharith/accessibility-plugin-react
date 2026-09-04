"use client";

import { useEffect } from "react";
import { useAccessibility } from "../core/useAccessibility";
import { getRootElement, setStyle, removeStyle } from "../utils/dom";

const FEATURE_KEY = "lineHeight";
const DEFAULT_VALUE = 100;
const MIN = 50;
const MAX = 200;
const STEP = 10;

export function LineHeightController() {
  const { value, setValue } = useAccessibility<number>(
    FEATURE_KEY,
    DEFAULT_VALUE
  );

  useEffect(() => {
    const root = getRootElement();
    if (value !== DEFAULT_VALUE) {
      setStyle(root, "line-height", `${value}%`);
    } else {
      removeStyle(root, "line-height");
    }
  }, [value]);

  useEffect(() => {
    return () => {
      removeStyle(getRootElement(), "line-height");
    };
  }, []);

  return (
    <div className="arap-feature">
      <label className="arap-label">Line Height</label>
      <div className="arap-controls">
        <button
          className="arap-btn-sm"
          onClick={() => setValue(Math.max(MIN, value - STEP))}
          disabled={value <= MIN}
          aria-label="Decrease line height"
          type="button"
        >
          −
        </button>
        <span className="arap-value">{value}%</span>
        <button
          className="arap-btn-sm"
          onClick={() => setValue(Math.min(MAX, value + STEP))}
          disabled={value >= MAX}
          aria-label="Increase line height"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default LineHeightController;
