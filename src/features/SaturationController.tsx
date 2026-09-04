"use client";

import { useEffect } from "react";
import { useAccessibility } from "../core/useAccessibility";
import { applyFilter, clearFilter } from "../utils/dom";

const FEATURE_KEY = "saturation";
const DEFAULT_VALUE = 0;
const LEVELS = [
  { label: "Off", value: 0 },
  { label: "Low", value: 1 },
  { label: "High", value: 2 },
];

function buildFilter(level: number): string {
  switch (level) {
    case 1:
      return "saturate(0.5)";
    case 2:
      return "saturate(2)";
    default:
      return "";
  }
}

export function SaturationController() {
  const { value, setValue } = useAccessibility<number>(
    FEATURE_KEY,
    DEFAULT_VALUE
  );

  useEffect(() => {
    const filter = buildFilter(value);
    if (filter) {
      applyFilter(filter);
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
      <label className="arap-label">Saturation</label>
      <div className="arap-segmented">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            className={`arap-segment ${value === level.value ? "arap-segment-active" : ""}`}
            onClick={() => setValue(level.value)}
            aria-pressed={value === level.value}
            type="button"
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SaturationController;
