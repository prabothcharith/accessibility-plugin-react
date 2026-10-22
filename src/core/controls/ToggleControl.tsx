"use client";

import type { CSSProperties, ReactNode } from "react";

export interface ToggleControlProps {
  id?: string;
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  unavailable?: boolean;
  unavailableReason?: string;
  name?: string;
  description?: string;
  largeControls?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function ToggleControl({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  unavailable = false,
  unavailableReason,
  name,
  description,
  largeControls = false,
  className = "",
  style,
}: ToggleControlProps) {
  const isInteractive = !disabled && !unavailable;
  const toggleLabel = typeof label === "string" ? label : undefined;

  const handleClick = () => {
    if (isInteractive) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`arap-toggle-wrapper ${largeControls ? "arap-large-controls" : ""} ${className}`}
      style={style}
    >
      <button
        id={id}
        name={name}
        type="button"
        className={`arap-toggle ${checked ? "arap-toggle-active" : ""}`}
        role="switch"
        aria-checked={checked}
        aria-label={toggleLabel}
        aria-disabled={!isInteractive}
        disabled={!isInteractive}
        onClick={handleClick}
        title={unavailableReason || description || toggleLabel}
      >
        <span
          className="arap-toggle-knob"
          style={{
            transform: checked
              ? largeControls
                ? "translateX(28px)"
                : "translateX(24px)"
              : "translateX(0)",
          }}
        />
      </button>
    </div>
  );
}

export default ToggleControl;
