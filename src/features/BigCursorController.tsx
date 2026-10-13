"use client";

import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "bigCursor";
const DEFAULT_VALUE = false;

export function BigCursorController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Big Cursor">
      <span className="arap-label">Big Cursor</span>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label="Big Cursor"
        aria-pressed={value}
        type="button"
      >
        <span className="arap-toggle-knob" />
      </button>
    </div>
  );
}

export default BigCursorController;
