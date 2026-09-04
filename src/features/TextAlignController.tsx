"use client";

import { useEffect } from "react";
import { useAccessibility } from "../core/useAccessibility";
import { getRootElement, setStyle, removeStyle } from "../utils/dom";

const FEATURE_KEY = "textAlign";
const DEFAULT_VALUE = "left";
const OPTIONS = ["left", "center", "right", "justify"] as const;

export function TextAlignController() {
  const { value, setValue } = useAccessibility<string>(
    FEATURE_KEY,
    DEFAULT_VALUE
  );

  useEffect(() => {
    const root = getRootElement();
    if (value !== DEFAULT_VALUE) {
      setStyle(root, "text-align", value);
    } else {
      removeStyle(root, "text-align");
    }
  }, [value]);

  useEffect(() => {
    return () => {
      removeStyle(getRootElement(), "text-align");
    };
  }, []);

  return (
    <div className="arap-feature">
      <label className="arap-label">Text Alignment</label>
      <div className="arap-segmented">
        {OPTIONS.map((option) => (
          <button
            key={option}
            className={`arap-segment ${value === option ? "arap-segment-active" : ""}`}
            onClick={() => setValue(option)}
            aria-pressed={value === option}
            type="button"
            style={{ textTransform: "capitalize" }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TextAlignController;
