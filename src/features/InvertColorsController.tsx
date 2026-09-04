"use client";

import { useEffect } from "react";
import { useAccessibility } from "../core/useAccessibility";
import { applyFilter, clearFilter } from "../utils/dom";

const FEATURE_KEY = "invertColors";
const DEFAULT_VALUE = false;

export function InvertColorsController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE
  );

  useEffect(() => {
    if (value) {
      applyFilter("invert(1)");
    } else {
      clearFilter();
    }
  }, [value]);

  useEffect(() => {
    return () => {
      clearFilter();
    };
  }, []);

  return (
    <div className="arap-feature">
      <label className="arap-label">Invert Colors</label>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-pressed={value}
        type="button"
      >
        <span className="arap-toggle-knob" />
      </button>
    </div>
  );
}

export default InvertColorsController;
