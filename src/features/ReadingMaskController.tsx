"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAccessibility } from "../core/useAccessibility";
import { getBodyElement, addClass, removeClass } from "../utils/dom";

const FEATURE_KEY = "readingMask";
const DEFAULT_VALUE = false;
const CSS_CLASS = "arap-reading-mask";

export function ReadingMaskController() {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE
  );
  const maskRef = useRef<HTMLDivElement | null>(null);

  const createMask = useCallback(() => {
    if (maskRef.current) return maskRef.current;
    const mask = document.createElement("div");
    mask.className = CSS_CLASS;
    mask.style.cssText = `
      position: fixed;
      left: 0;
      right: 0;
      height: 80px;
      background: rgba(0,0,0,0.85);
      z-index: 999998;
      pointer-events: none;
      transition: top 0.1s ease;
    `;
    document.body.appendChild(mask);
    maskRef.current = mask;
    return mask;
  }, []);

  const removeMask = useCallback(() => {
    if (maskRef.current) {
      maskRef.current.remove();
      maskRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (value) {
      const mask = createMask();
      const handleMouseMove = (e: MouseEvent) => {
        mask.style.top = `${e.clientY - 40}px`;
      };
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    } else {
      removeMask();
    }
  }, [value, createMask, removeMask]);

  useEffect(() => {
    return () => {
      removeMask();
    };
  }, [removeMask]);

  return (
    <div className="arap-feature">
      <label className="arap-label">Reading Mask</label>
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

export default ReadingMaskController;
