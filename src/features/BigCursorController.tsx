"use client";

import { useEffect, useState } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";
import { hasFinePointer, subscribeFinePointer } from "../core/effects";

const FEATURE_KEY = "bigCursor";
const DEFAULT_VALUE = false;

export interface BigCursorControllerProps {
  showCapabilityHint?: boolean;
}

export function BigCursorController({
  showCapabilityHint = true,
}: BigCursorControllerProps = {}) {
  const { value, setValue } = useAccessibility<boolean>(
    FEATURE_KEY,
    DEFAULT_VALUE,
  );
  const [finePointer, setFinePointer] = useState<boolean>(() =>
    hasFinePointer(),
  );

  useEffect(() => {
    return subscribeFinePointer(() => {
      setFinePointer(hasFinePointer());
    });
  }, []);

  return (
    <div className="arap-feature" role="group" aria-label="Big Cursor">
      <span className="arap-label">
        <FeatureIcon name={FEATURE_KEY} />
        <span>Big Cursor</span>
        {showCapabilityHint && !finePointer && (
          <span
            className="arap-badge"
            style={{ fontSize: "0.75rem", opacity: 0.8, marginLeft: "4px" }}
            title="Custom cursor requires mouse or trackpad pointer hardware"
          >
            (Mouse)
          </span>
        )}
      </span>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={() => setValue(!value)}
        aria-label="Big Cursor"
        aria-pressed={value}
        type="button"
      >
        <span className="arap-toggle-knob" aria-hidden="true" />
      </button>
    </div>
  );
}

export default BigCursorController;
