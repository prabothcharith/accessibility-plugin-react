import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Control, ToggleButton } from './Control';

export function Videos() {
  const { state, dispatch } = useAccessibility();

  return (
    <div className="accessibility-section">
      <Control label="Hide Videos">
        <ToggleButton
          active={state.hideVideos}
          onClick={() => dispatch({ type: 'TOGGLE_HIDE_VIDEOS' })}
          label={state.hideVideos ? 'Hidden' : 'Visible'}
        />
      </Control>
    </div>
  );
}
