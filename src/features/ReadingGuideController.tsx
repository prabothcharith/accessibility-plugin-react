"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAccessibility } from "../core/useAccessibility";

const FEATURE_KEY = "readingGuide";
const DEFAULT_VALUE = false;
const CSS_CLASS = "arap-reading-guide";

export function ReadingGuideController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE
  );
  const guideRef = useRef<HTMLDivElement | null>(null);

  const createGuide = useCallback(() => {
    if (guideRef.current) return guideRef.current;
    const guide = document.createElement("div");
    guide.className = CSS_CLASS;
    guide.style.cssText = `
      position: fixed;
      left: 0;
      right: 0;
      height: 4px;
      background: rgba(37,99,235,0.6);
      z-index: 999998;
      pointer-events: none;
      transition: top 0.05s ease;
      box-shadow: 0 2px 8px rgba(37,99,235,0.3);
    `;
    document.body.appendChild(guide);
    guideRef.current = guide;
    return guide;
  }, []);

  const removeGuide = useCallback(() => {
    if (guideRef.current) {
      guideRef.current.remove();
      guideRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (value) {
      const guide = createGuide();
      const handleMouseMove = (e: MouseEvent) => {
        guide.style.top = `${e.clientY}px`;
      };
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    } else {
      removeGuide();
    }
  }, [value, createGuide, removeGuide]);

  useEffect(() => {
    return () => {
      removeGuide();
    };
  }, [removeGuide]);

  return (
    <div className="arap-feature">
      <label className="arap-label">Reading Guide</label>
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

export default ReadingGuideController;
