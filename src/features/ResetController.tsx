"use client";

import { useContext } from "react";
import { AccessibilityContext } from "../core/AccessibilityContext";

export function ResetController() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "ResetController must be used within an <AccessibilityPlugin> provider.",
    );
  }

  const { resetAll } = ctx;

  return (
    <div className="arap-feature">
      <button className="arap-reset-btn" onClick={resetAll} type="button">
        Reset All
      </button>
    </div>
  );
}

export default ResetController;
