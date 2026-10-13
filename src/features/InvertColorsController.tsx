"use client";

import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "invertColors";
const DEFAULT_VALUE = false;

export function InvertColorsController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Invert Colors">
      <span className="arap-label">Invert Colors</span>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label="Invert Colors"
        aria-pressed={value}
        type="button"
      >
        <span className="arap-toggle-knob" />
      </button>
    </div>
  );
}

export default InvertColorsController;
