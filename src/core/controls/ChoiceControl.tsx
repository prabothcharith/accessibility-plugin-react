"use client";

import type { CSSProperties } from "react";
import { useCallback, useMemo, useRef } from "react";

export interface ChoiceOption<T extends string | number> {
  label: string;
  value: T;
  description?: string;
  disabled?: boolean;
  badge?: string;
}

export interface ChoiceGroup<T extends string | number> {
  label: string;
  options: ChoiceOption<T>[];
}

export interface ChoiceControlProps<T extends string | number> {
  id?: string;
  label: string;
  value: T;
  options?: ChoiceOption<T>[];
  groups?: ChoiceGroup<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  largeControls?: boolean;
  className?: string;
  style?: CSSProperties;
  orientation?: "horizontal" | "vertical";
}

export function ChoiceControl<T extends string | number>({
  id,
  label,
  value,
  options,
  groups,
  onChange,
  disabled = false,
  largeControls = false,
  className = "",
  style,
  orientation = "horizontal",
}: ChoiceControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const allOptions: ChoiceOption<T>[] = useMemo(
    () => (groups ? groups.flatMap((g) => g.options) : options || []),
    [groups, options],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled || allOptions.length === 0) return;

      const enabledOptions = allOptions.filter((opt) => !opt.disabled);
      const currentIndex = enabledOptions.findIndex(
        (opt) => opt.value === value,
      );

      let nextIndex = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex =
          currentIndex === -1 ? 0 : (currentIndex + 1) % enabledOptions.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex =
          currentIndex === -1
            ? enabledOptions.length - 1
            : (currentIndex - 1 + enabledOptions.length) %
              enabledOptions.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = enabledOptions.length - 1;
      }

      if (nextIndex !== -1 && enabledOptions[nextIndex]) {
        onChange(enabledOptions[nextIndex].value);
        const buttons =
          containerRef.current?.querySelectorAll<HTMLButtonElement>(
            "button[data-choice-value]",
          );
        const targetBtn = Array.from(buttons || []).find(
          (b) =>
            b.getAttribute("data-choice-value") ===
            String(enabledOptions[nextIndex].value),
        );
        targetBtn?.focus();
      }
    },
    [allOptions, disabled, onChange, value],
  );

  const renderOptionButton = (opt: ChoiceOption<T>) => {
    const isSelected = value === opt.value;
    const isOptionDisabled = disabled || Boolean(opt.disabled);

    return (
      <button
        key={String(opt.value)}
        type="button"
        data-choice-value={String(opt.value)}
        className={`arap-segment ${isSelected ? "arap-segment-active" : ""}`}
        role="radio"
        aria-checked={isSelected}
        aria-disabled={isOptionDisabled}
        disabled={isOptionDisabled}
        tabIndex={isSelected ? 0 : -1}
        onClick={() => !isOptionDisabled && onChange(opt.value)}
        title={opt.description}
      >
        {isSelected && (
          <span className="arap-check" aria-hidden="true">
            ✓
          </span>
        )}
        <span>{opt.label}</span>
        {opt.badge && (
          <span className="arap-choice-badge" aria-hidden="true">
            {opt.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      ref={containerRef}
      id={id}
      role="radiogroup"
      aria-label={label}
      aria-orientation={orientation}
      className={`arap-choice-control arap-segmented ${largeControls ? "arap-large-controls" : ""} ${className}`}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {groups
        ? groups.map((group) => (
            <div
              key={group.label}
              className="arap-choice-group"
              role="group"
              aria-label={group.label}
            >
              <span className="arap-choice-group-title">{group.label}</span>
              <div className="arap-segmented">
                {group.options.map(renderOptionButton)}
              </div>
            </div>
          ))
        : options?.map(renderOptionButton)}
    </div>
  );
}

export default ChoiceControl;
