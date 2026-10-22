"use client";

import type { CSSProperties } from "react";

export interface StepperControlProps {
  id?: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  formatValue?: (val: number) => string;
  onChange: (value: number) => void;
  showSlider?: boolean;
  disabled?: boolean;
  largeControls?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function StepperControl({
  id,
  label,
  value,
  min,
  max,
  step,
  unit = "%",
  formatValue,
  onChange,
  showSlider = false,
  disabled = false,
  largeControls = false,
  className = "",
  style,
}: StepperControlProps) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

  const isMin = value <= min;
  const isMax = value >= max;

  const handleDecrement = () => {
    if (!disabled && !isMin) {
      onChange(Math.max(min, Number((value - step).toFixed(2))));
    }
  };

  const handleIncrement = () => {
    if (!disabled && !isMax) {
      onChange(Math.min(max, Number((value + step).toFixed(2))));
    }
  };

  return (
    <div
      id={id}
      className={`arap-stepper-control-wrapper ${largeControls ? "arap-large-controls" : ""} ${className}`}
      style={style}
    >
      <div className="arap-controls">
        <button
          type="button"
          className="arap-btn-sm"
          onClick={handleDecrement}
          disabled={disabled || isMin}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <output className="arap-value" aria-live="polite">
          {displayValue}
        </output>
        <button
          type="button"
          className="arap-btn-sm"
          onClick={handleIncrement}
          disabled={disabled || isMax}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>

      {showSlider && (
        <div className="arap-slider-container">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            aria-label={label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={displayValue}
            onChange={(e) => onChange(Number(e.target.value))}
            className="arap-slider"
          />
        </div>
      )}
    </div>
  );
}

export default StepperControl;
