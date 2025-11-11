import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Control, Slider } from './Control';

export function Fonts() {
  const { state, dispatch } = useAccessibility();

  return (
    <div className="accessibility-section">
      <Control label="Font Size">
        <Slider
          value={state.fontSize}
          onChange={(value) => dispatch({ type: 'SET_FONT_SIZE', payload: value })}
          min={50}
          max={200}
          step={10}
          unit="%"
        />
      </Control>
    </div>
  );
}
