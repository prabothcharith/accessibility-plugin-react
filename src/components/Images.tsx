import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Control, ToggleButton } from './Control';

export function Images() {
  const { state, dispatch } = useAccessibility();

  return (
    <div className="accessibility-section">
      <Control label="Hide Images">
        <ToggleButton
          active={state.hideImages}
          onClick={() => dispatch({ type: 'TOGGLE_HIDE_IMAGES' })}
          label={state.hideImages ? 'Hidden' : 'Visible'}
        />
      </Control>
    </div>
  );
}
