import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Control, ButtonGroup } from './Control';

export function Contrast() {
  const { state, dispatch } = useAccessibility();

  const getCurrentContrast = () => {
    if (state.lowContrast) return 'low';
    if (state.highContrast) return 'high';
    if (state.extraContrast) return 'extra';
    return 'default';
  };

  return (
    <div className="accessibility-section">
      <Control label="Contrast">
        <ButtonGroup
          buttons={[
            {
              label: 'Low',
              value: 'low',
              active: getCurrentContrast() === 'low',
              onClick: () => dispatch({ type: 'SET_CONTRAST', payload: 'low' }),
            },
            {
              label: 'Normal',
              value: 'default',
              active: getCurrentContrast() === 'default',
              onClick: () => dispatch({ type: 'SET_CONTRAST', payload: 'default' }),
            },
            {
              label: 'High',
              value: 'high',
              active: getCurrentContrast() === 'high',
              onClick: () => dispatch({ type: 'SET_CONTRAST', payload: 'high' }),
            },
            {
              label: 'Extra',
              value: 'extra',
              active: getCurrentContrast() === 'extra',
              onClick: () => dispatch({ type: 'SET_CONTRAST', payload: 'extra' }),
            },
          ]}
        />
      </Control>
    </div>
  );
}
