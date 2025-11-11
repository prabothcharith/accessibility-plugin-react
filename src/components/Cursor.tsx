import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Control, ToggleButton } from './Control';

export function Cursor() {
  const { state, dispatch } = useAccessibility();

  return (
    <div className="accessibility-section">
      <Control label="Big Cursor">
        <ToggleButton
          active={state.bigCursor}
          onClick={() => dispatch({ type: 'TOGGLE_BIG_CURSOR' })}
          label={state.bigCursor ? 'On' : 'Off'}
        />
      </Control>
    </div>
  );
}
