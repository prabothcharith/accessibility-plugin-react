"use client";

import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "grayscale";
const DEFAULT_VALUE = false;

export function GrayscaleController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Grayscale">
      <span className="arap-label">Grayscale</span>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label="Grayscale"
        aria-pressed={value}
        type="button"
      >
        <span className="arap-toggle-knob" />
      </button>
    </div>
  );
}

export default GrayscaleController;
