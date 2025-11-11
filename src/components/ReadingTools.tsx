import React, { useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Control, ToggleButton } from './Control';
import { useReadingTools } from '../hooks/useReadingTools';
import styles from './ReadingTools.module.css';

export function ReadingTools() {
  const { state, dispatch } = useAccessibility();
  
  useReadingTools();

  return (
    <div className="accessibility-section">
      <Control label="Reading Mask">
        <ToggleButton
          active={state.readingMask}
          onClick={() => dispatch({ type: 'TOGGLE_READING_MASK' })}
          label={state.readingMask ? 'On' : 'Off'}
        />
      </Control>
      
      <Control label="Reading Guide">
        <ToggleButton
          active={state.readingGuide}
          onClick={() => dispatch({ type: 'TOGGLE_READING_GUIDE' })}
          label={state.readingGuide ? 'On' : 'Off'}
        />
      </Control>

      {state.readingMask && (
        <div id="accessibility-reading-mask" className={styles.readingMask} />
      )}
      
      {state.readingGuide && (
        <div id="accessibility-reading-guide" className={styles.readingGuide} />
      )}
    </div>
  );
}
