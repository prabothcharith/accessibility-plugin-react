"use client";

import { FeatureIcon } from "../core/FeatureIcon";
import { createPortal } from "react-dom";
import { PanelActionsContext } from "../core/PanelActionsContext";
import { useContext } from "react";
import { AccessibilityContext } from "../core/AccessibilityContext";

export function ResetController() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "ResetController must be used within an <AccessibilityPlugin> provider.",
    );
  }

  const actionHost = useContext(PanelActionsContext);
  const { resetAll } = ctx;

  const button = (
    <div className="arap-feature arap-feature-reset">
      <button className="arap-reset-btn" onClick={resetAll} type="button">
        <FeatureIcon name="reset" />
        Reset All
      </button>
    </div>
  );
  return actionHost ? createPortal(button, actionHost) : button;
}

export default ResetController;
