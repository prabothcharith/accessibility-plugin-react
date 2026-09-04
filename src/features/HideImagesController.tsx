"use client";

import { useEffect } from "react";
import { useAccessibility } from "../core/useAccessibility";
import { getBodyElement, addClass, removeClass } from "../utils/dom";

const FEATURE_KEY = "hideImages";
const DEFAULT_VALUE = false;
const CSS_CLASS = "arap-hide-images";

export function HideImagesController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE
  );

  useEffect(() => {
    const body = getBodyElement();
    if (value) {
      addClass(body, CSS_CLASS);
    } else {
      removeClass(body, CSS_CLASS);
    }
  }, [value]);

  useEffect(() => {
    return () => {
      removeClass(getBodyElement(), CSS_CLASS);
    };
  }, []);

  return (
    <div className="arap-feature">
      <label className="arap-label">Hide Images</label>
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

export default HideImagesController;
