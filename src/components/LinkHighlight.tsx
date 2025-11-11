import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Control, ToggleButton } from './Control';

export function LinkHighlight() {
  const { state, dispatch } = useAccessibility();

  return (
    <div className="accessibility-section">
      <Control label="Link Highlight">
        <ToggleButton
          active={state.linkHighlight}
          onClick={() => dispatch({ type: 'TOGGLE_LINK_HIGHLIGHT' })}
          label={state.linkHighlight ? 'On' : 'Off'}
        />
      </Control>
    </div>
  );
}
