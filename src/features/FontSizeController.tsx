"use client";

import { useEffect } from "react";
import { useAccessibility } from "../core/useAccessibility";
import { getRootElement, setStyle, removeStyle } from "../utils/dom";

const FEATURE_KEY = "fontSize";
const DEFAULT_VALUE = 100;
const MIN = 50;
const MAX = 200;
const STEP = 10;

export function FontSizeController() {
  const { value, setValue, reset } = useAccessibility<number>(
    FEATURE_KEY,
    DEFAULT_VALUE
  );

  useEffect(() => {
    const root = getRootElement();
    if (value !== DEFAULT_VALUE) {
      setStyle(root, "font-size", `${value}%`);
    } else {
      removeStyle(root, "font-size");
    }
  }, [value]);

  useEffect(() => {
    return () => {
      removeStyle(getRootElement(), "font-size");
    };
  }, []);

  return (
    <div className="arap-feature">
      <label className="arap-label">Font Size</label>
      <div className="arap-controls">
        <button
          className="arap-btn-sm"
          onClick={() => setValue(Math.max(MIN, value - STEP))}
          disabled={value <= MIN}
          aria-label="Decrease font size"
          type="button"
        >
          −
        </button>
        <span className="arap-value">{value}%</span>
        <button
          className="arap-btn-sm"
          onClick={() => setValue(Math.min(MAX, value + STEP))}
          disabled={value >= MAX}
          aria-label="Increase font size"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default FontSizeController;
