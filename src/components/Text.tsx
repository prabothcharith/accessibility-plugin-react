import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Control, Slider, ButtonGroup } from './Control';

export function Text() {
  const { state, dispatch } = useAccessibility();

  return (
    <div className="accessibility-section">
      <Control label="Line Height">
        <Slider
          value={state.lineHeight}
          onChange={(value) => dispatch({ type: 'SET_LINE_HEIGHT', payload: value })}
          min={100}
          max={250}
          step={10}
          unit="%"
        />
      </Control>
      
      <Control label="Letter Spacing">
        <Slider
          value={state.letterSpacing}
          onChange={(value) => dispatch({ type: 'SET_LETTER_SPACING', payload: value })}
          min={0}
          max={10}
          step={1}
          unit="px"
        />
      </Control>
      
      <Control label="Text Align">
        <ButtonGroup
          buttons={[
            {
              label: 'L',
              value: 'left',
              active: state.textAlign === 'left',
              onClick: () => dispatch({ type: 'SET_TEXT_ALIGN', payload: 'left' }),
            },
            {
              label: 'C',
              value: 'center',
              active: state.textAlign === 'center',
              onClick: () => dispatch({ type: 'SET_TEXT_ALIGN', payload: 'center' }),
            },
            {
              label: 'R',
              value: 'right',
              active: state.textAlign === 'right',
              onClick: () => dispatch({ type: 'SET_TEXT_ALIGN', payload: 'right' }),
            },
            {
              label: 'J',
              value: 'justify',
              active: state.textAlign === 'justify',
              onClick: () => dispatch({ type: 'SET_TEXT_ALIGN', payload: 'justify' }),
            },
          ]}
        />
      </Control>
    </div>
  );
}
