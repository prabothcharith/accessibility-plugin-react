"use client";

import { useCallback, useContext, useRef, useEffect, type KeyboardEvent } from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import type { AccessibilityButtonProps } from "./types";

export function AccessibilityButton({
  icon,
  title = "Accessibility",
  description,
  className = "",
}: AccessibilityButtonProps) {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "AccessibilityButton must be used within an <AccessibilityPlugin> provider."
    );
  }

  const { toggleOpen, isOpen } = ctx;
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Escape" && isOpen) {
        toggleOpen();
      }
    },
    [isOpen, toggleOpen]
  );

  const buttonStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "16px",
    right: "16px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
    transition: "transform 0.2s, box-shadow 0.2s",
    fontSize: "24px",
    padding: 0,
    outline: "none",
  };

  const focusStyle: React.CSSProperties = {
    boxShadow: "0 0 0 3px rgba(37,99,235,0.5), 0 4px 12px rgba(37,99,235,0.4)",
  };

  return (
    <button
      ref={buttonRef}
      className={`arap-btn ${className}`}
      style={buttonStyle}
      onClick={toggleOpen}
      onKeyDown={handleKeyDown}
      aria-label={title}
      aria-describedby={description ? "arap-btn-desc" : undefined}
      aria-expanded={isOpen}
      aria-controls="arap-panel"
      type="button"
      onFocus={(e) => {
        Object.assign(e.currentTarget.style, focusStyle);
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = buttonStyle.boxShadow as string;
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      {description && (
        <span id="arap-btn-desc" style={{ display: "none" }}>
          {description}
        </span>
      )}
      {icon}
    </button>
  );
}

export default AccessibilityButton;
