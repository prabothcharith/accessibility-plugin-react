"use client";

import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "hideVideos";
const DEFAULT_VALUE = false;

export function HideVideosController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );

  return (
    <div className="arap-feature" role="group" aria-label="Hide Videos">
      <span className="arap-label">Hide Videos</span>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label="Hide Videos"
        aria-pressed={value}
        type="button"
      >
        <span className="arap-toggle-knob" />
      </button>
    </div>
  );
}

export default HideVideosController;
