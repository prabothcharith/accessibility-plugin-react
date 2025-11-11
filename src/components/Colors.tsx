import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Control, ToggleButton, ButtonGroup } from './Control';

export function Colors() {
  const { state, dispatch } = useAccessibility();

  return (
    <div className="accessibility-section">
      <Control label="Invert Colors">
        <ToggleButton
          active={state.invertColors}
          onClick={() => dispatch({ type: 'TOGGLE_INVERT_COLORS' })}
          label={state.invertColors ? 'On' : 'Off'}
        />
      </Control>
      
      <Control label="Grayscale">
        <ToggleButton
          active={state.grayscale}
          onClick={() => dispatch({ type: 'TOGGLE_GRAYSCALE' })}
          label={state.grayscale ? 'On' : 'Off'}
        />
      </Control>
      
      <Control label="Saturation">
        <ButtonGroup
          buttons={[
            {
              label: 'Low',
              value: 'low',
              active: state.lowSaturation,
              onClick: () => dispatch({ type: 'TOGGLE_LOW_SATURATION' }),
            },
            {
              label: 'Normal',
              value: 'normal',
              active: !state.lowSaturation && !state.highSaturation,
              onClick: () => {
                if (state.lowSaturation) dispatch({ type: 'TOGGLE_LOW_SATURATION' });
                if (state.highSaturation) dispatch({ type: 'TOGGLE_HIGH_SATURATION' });
              },
            },
            {
              label: 'High',
              value: 'high',
              active: state.highSaturation,
              onClick: () => dispatch({ type: 'TOGGLE_HIGH_SATURATION' }),
            },
          ]}
        />
      </Control>
    </div>
  );
}
