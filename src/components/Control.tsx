import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import styles from './Control.module.css';

interface ControlProps {
  label: string;
  children: React.ReactNode;
}

export function Control({ label, children }: ControlProps) {
  return (
    <div className={styles.control}>
      <span className={styles.controlLabel}>{label}</span>
      {children}
    </div>
  );
}

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

export function ToggleButton({ active, onClick, label }: ToggleButtonProps) {
  return (
    <button
      className={`${styles.button} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export function Slider({ value, onChange, min, max, step = 1, unit = '' }: SliderProps) {
  return (
    <div className={styles.slider}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.sliderInput}
      />
      <span className={styles.sliderValue}>
        {value}{unit}
      </span>
    </div>
  );
}

interface ButtonGroupProps {
  buttons: { label: string; value: string; active: boolean; onClick: () => void }[];
}

export function ButtonGroup({ buttons }: ButtonGroupProps) {
  return (
    <div className={styles.buttonGroup}>
      {buttons.map((button) => (
        <button
          key={button.value}
          className={`${styles.button} ${button.active ? styles.active : ''}`}
          onClick={button.onClick}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
