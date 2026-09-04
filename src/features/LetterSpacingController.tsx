"use client";

import { useEffect } from "react";
import { useAccessibility } from "../core/useAccessibility";
import { getRootElement, setStyle, removeStyle } from "../utils/dom";

const FEATURE_KEY = "letterSpacing";
const DEFAULT_VALUE = 0;
const MIN = 0;
const MAX = 10;
const STEP = 1;

export function LetterSpacingController() {
  const { value, setValue } = useAccessibility<number>(
    FEATURE_KEY,
    DEFAULT_VALUE
  );

  useEffect(() => {
    const root = getRootElement();
    if (value !== DEFAULT_VALUE) {
      setStyle(root, "letter-spacing", `${value}px`);
    } else {
      removeStyle(root, "letter-spacing");
    }
  }, [value]);

  useEffect(() => {
    return () => {
      removeStyle(getRootElement(), "letter-spacing");
    };
  }, []);

  return (
    <div className="arap-feature">
      <label className="arap-label">Letter Spacing</label>
      <div className="arap-controls">
        <button
          className="arap-btn-sm"
          onClick={() => setValue(Math.max(MIN, value - STEP))}
          disabled={value <= MIN}
          aria-label="Decrease letter spacing"
          type="button"
        >
          −
        </button>
        <span className="arap-value">{value}px</span>
        <button
          className="arap-btn-sm"
          onClick={() => setValue(Math.min(MAX, value + STEP))}
          disabled={value >= MAX}
          aria-label="Increase letter spacing"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default LetterSpacingController;
